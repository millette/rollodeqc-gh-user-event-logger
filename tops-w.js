#!/usr/bin/env node
'use strict'

// npm
const _ = require('lodash')
const db = require('nano')('http://localhost:5984/evs2')

const week = 2429
const type = ''

db.view('app', 'reposhortnameperweek', { group_level: 3, startkey: [week, type], endkey: [week, type + '\ufff0'] }, (err, bod) => {
  const z = _.groupBy(bod.rows, (x) => x.key[1])
  const more = {}
  let r
  console.log(bod.rows.length)
  console.log(Object.keys(z))
  for (r in z) {
    more[r] = _.sortBy(z[r], 'value').reverse().slice(0, 10)
      .map((x) => {
        return {
          name: x.key[2],
          value: x.value
        }
      })
  }
  console.log(JSON.stringify(more, null, ' '))
})

