#!/usr/bin/env node
'use strict'

// npm
const _ = require('lodash')
const db = require('nano')('http://localhost:5984/evs2')

// 'http://localhost:5984/evs2/_design/app/_view/reposhortname?group_level=2'
db.view('app', 'repofullname', { group_level: 2 }, (err, bod) => {
  if (err) {
    console.log('ERR:', err)
    return
  }
  const z = _.groupBy(bod.rows, (x) => x.key[0])
  const more = {}
  let r
  console.log(bod.rows.length)
  console.log(Object.keys(z))
  for (r in z) {
    more[r] = _.sortBy(z[r], 'value').reverse().slice(0, 100)
      .map((x) => {
        return {
          name: x.key[1],
          value: x.value
        }
      })
  }
  console.log(JSON.stringify(more, null, ' '))
})

