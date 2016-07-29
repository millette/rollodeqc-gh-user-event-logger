#!/usr/bin/env node

// TODO: Need separate "week" and "year/month/day" views

/*
Log Github user events to CouchDB.

Copyright 2016
Robin Millette <robin@millette.info>
<http://robin.millette.info>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the
[GNU Affero General Public License](LICENSE.md)
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict'
// npm
const meow = require('meow')
const _ = require('lodash')
const db = require('nano')('http://localhost:5984/evs2a')
const updateNotifier = require('update-notifier')

updateNotifier({ pkg: require('./package.json') }).notify()

const cli = meow([
  'Usage',
  '  $ tops',
  '',
  'Options',
  '  --week  Lorem ipsum. [Default: false]',
  '  --day  Lorem ipsum. [Default: false]',
  '  --type  Lorem ipsum. [Default: false]',
  '  --top  Lorem ipsum. [Default: false]',
  '',
  'Examples',
  '  $ rollodeqc-gh-user-event-logger',
  '  unicorns & rainbows',
  '  $ rollodeqc-gh-user-event-logger ponies',
  '  ponies & rainbows'
], {
  default: { type: 'PushEvent' }
})


const type = cli.flags.type
const top = cli.flags.top || 10

var weekOfYear = function(dd){
  var d = new Date(dd)
  d.setHours(0,0,0)
  d.setDate(d.getDate()+4-(d.getDay()||7))
  return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7)
}

let week
let month
let monthEnd

const options = { group: true }

const out = (x) => type === 'PushEvent'
  ? `(${x.value.sum}/${x.value.count} ${Math.round(100 * x.value.sum / x.value.count) / 100})`
  : `(${x.value.sum})`

if (cli.flags.day) {
  week = weekOfYear(`${cli.flags.year}-${cli.flags.month}-${cli.flags.day}`)
  options.startkey = ['BYDAY', type, cli.flags.year, cli.flags.month, week, cli.flags.day]
  options.endkey = ['BYDAY', type, cli.flags.year, cli.flags.month, week, cli.flags.day + 1]
} else if (cli.flags.week) {
  month = Math.round(cli.flags.week / 4.3)
  monthEnd = Math.round((cli.flags.week + 1) / 4.3)
  options.startkey = ['BYWEEK', type, cli.flags.year, month, cli.flags.week]
  options.endkey = ['BYWEEK', type, cli.flags.year, monthEnd, cli.flags.week + 1]
} else if (cli.flags.month) {
  options.startkey = ['BYMONTH', type, cli.flags.year, cli.flags.month]
  options.endkey = ['BYMONTH', type, cli.flags.year, cli.flags.month + 1]
} else if (cli.flags.year) {
  options.startkey = ['BYYEAR', type, cli.flags.year]
  options.endkey = ['BYYEAR', type, cli.flags.year + 1]
} else {
  process.exit()
}

console.log('opts:', options)

db.view('app', 'repofullnamedated', options, (err, bod) => {
  if (err) {
    console.log('ERR:', err)
    return
  }
  const z = _.groupBy(bod.rows, (x) => x.key[1])
  const more = {}
  let r
  console.log(bod.rows.length)
  console.log(Object.keys(z))
  for (r in z) {
    more[r] = _.sortBy(z[r], 'value.sum').reverse().slice(0, top)
      .map((x) => `${x.key[6]} ${out(x)}`)
  }
  console.log(JSON.stringify(more, null, ' '))
})
