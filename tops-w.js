#!/usr/bin/env node

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
const db = require('nano')('http://localhost:5984/evs2')
const updateNotifier = require('update-notifier')

updateNotifier({ pkg: require('./package.json') }).notify()

const cli = meow([
  'Usage',
  '  $ tops-w',
  '',
  'Options',
  '  --week  Lorem ipsum. [Default: false]',
  '  --type  Lorem ipsum. [Default: false]',
  '  --top  Lorem ipsum. [Default: false]',
  '',
  'Examples',
  '  $ rollodeqc-gh-user-event-logger',
  '  unicorns & rainbows',
  '  $ rollodeqc-gh-user-event-logger ponies',
  '  ponies & rainbows'
])

const week = cli.flags.week || 2429
const type = cli.flags.type || ''
const top = cli.flags.top || 10

db.view('app', 'reposhortnameperweek', { group_level: 3, startkey: [week, type], endkey: [week, type + '\ufff0'] }, (err, bod) => {
  const z = _.groupBy(bod.rows, (x) => x.key[1])
  const more = {}
  let r
  console.log(bod.rows.length)
  console.log(Object.keys(z))
  for (r in z) {
    more[r] = _.sortBy(z[r], 'value').reverse().slice(0, top)
      .map((x) => `${x.key[2]} (${x.value})`)
  }
  console.log(JSON.stringify(more, null, ' '))
})
