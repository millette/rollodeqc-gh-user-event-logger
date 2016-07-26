#!/usr/bin/env node
'use strict'

// npm
const ghUser = require('rollodeqc-gh-user')
const ghUserEvents = require('rollodeqc-gh-user-events')
const _ = require('lodash')
const db = require('nano')('http://localhost:5984/evs2')
const rlp = require('rate-limit-promise')

const contributors = require('./contributors.json').rows
  .map((x) => x.id.split(':')[1])

const request = rlp(3, 10000)

contributors.forEach((user) => {
  request()
    .then(() => ghUser(user))
    .then((doc) => {
      doc._id = `github:user:id:${doc.id}`
      return doc
    })
    .then((doc) => Promise.all([doc, ghUserEvents(user)]))
    .then((p) => {
      let docs = []
      p[0].events_headers = p[1].headers
      docs = docs.concat(
        p[0], p[1].events.map((x) => {
          x._id = `github:event:id:${x.id}`
          return x
        })
      )
      return new Promise(
        (resolve, reject) => db.bulk(
          { docs: docs }, (err, bod) => err ? reject(e) : resolve(bod.length)
        )
      )
    })
    .then((x) => console.log(new Date(), user, x))
    .catch((e) => console.log(new Date(), 'ERR:', user, e))
})

setInterval(() => console.log(new Date(), 'ping'), 5000)
