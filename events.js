#!/usr/bin/env node
'use strict'

// npm
const ghUser = require('rollodeqc-gh-user')
const ghUserEvents = require('rollodeqc-gh-user-events')
const _ = require('lodash')
const db = require('nano')('http://localhost:5984/evs2')
const rlp = require('rate-limit-promise')

db.list({include_docs: true, startkey: 'github:user:id:', endkey: 'github:user:id:\ufff0'}, (err, body) => {
  const delay = 2000
  const request = rlp(5, delay) // 5, 7500
  let count = body.rows.length
  const store = { }
  const store2 = { }
  const contributors = []
  const timer = setInterval(() => {
    console.log(new Date(), 'ping', count, 'to go')
    if (count < 1) { clearInterval(timer) }
  }, 3 * delay)
  if (err) { return console.log('err:', err) }
  console.log(body.rows.length)
  _.shuffle(body.rows).forEach((doc) => {
    contributors.push(doc.doc.login)
    store[doc.doc.login] = doc.doc
    store2[doc.doc.login] = doc.doc
  })

  contributors.forEach((user) => {
    request()
      .then(() => ghUser(user, store))
      .then((doc) => Object.assign(store2[doc.login], doc))
      .then((doc) => Promise.all([doc, ghUserEvents(user, doc.events_headers && doc.events_headers.etag)]))
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
      .then((x) => console.log(new Date(), 'EVENTS:  ', --count, user, x))
      .catch((e) => {
        --count
        if (e.statusCode === 304) {
          console.log(new Date(), 'NO-MODIF:', count, user, e.path)
        } else {
          console.log(new Date(), 'ERR:     ', count, user, e)
          count = 0 // only set count to 0 on rate limit error
        }
      })
  })
})
