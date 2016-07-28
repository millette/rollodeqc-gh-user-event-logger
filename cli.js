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
const ghGot = require('gh-got')
const rateLimit = require('rate-limit-promise')
const updateNotifier = require('update-notifier')
const _ = require('lodash')
const db = require('nano')('http://localhost:5984/evs')
updateNotifier({ pkg: require('./package.json') }).notify()

// self
// const rollodeqcGhUserEventLogger = require('./')

const cli = meow([
  'Usage',
  '  $ rollodeqc-gh-user-event-logger [input]',
  '',
  'Options',
  '  --foo  Lorem ipsum. [Default: false]',
  '',
  'Examples',
  '  $ rollodeqc-gh-user-event-logger',
  '  unicorns & rainbows',
  '  $ rollodeqc-gh-user-event-logger ponies',
  '  ponies & rainbows'
])

const delay = cli.flags.delay || 8000

const contributors = require('./contributors.json').rows.map((x) => x.id.split(':')[1])

const sample = _.sampleSize(contributors, 5048)

const doit = (s) => {
  ghGot(`users/${s}`)
    .then((user) => {
      const doc = user.body
      doc._id = `github:id:${doc.id}`
      doc.rollodeqc = { headers: _.pick(user.headers, ['last-modified', 'date', 'etag']) }
      return Promise.all([doc, ghGot(`user/${doc.id}/events?per_page=100`)])
    })
    .then((p) => {
      const events = p[1]
      const doc = events.body
      const user = p[0]
      user.rollodeqc.events = { headers: _.pick(events.headers, ['last-modified', 'date', 'etag']) }
      db.insert(user)
      console.log(user.login, doc.length)
      doc.forEach((event) => {
        event._id = event.id
        db.insert(event)
      })
    })
    .catch((err) => { console.log('err:', err) })
}

const throttler = rateLimit(1, delay)

sample.forEach((s) => throttler().then(doit.bind(this, s)))

const t = setTimeout(() => {
  if (!sample.length) {
    clearTimeout(t)
  }
}, delay + 500)
