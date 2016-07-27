#!/usr/bin/env node
'use strict'

// npm
const ghUser = require('rollodeqc-gh-user')
const ghUserEvents = require('rollodeqc-gh-user-events')
const _ = require('lodash')
const db = require('nano')('http://localhost:5984/evs2')
const rlp = require('rate-limit-promise')

// const contributors = require('./contributors.json').rows.map((x) => x.id.split(':')[1])

const request = rlp(3, 10000)

db.list({include_docs: true, startkey: 'github:user:id:', endkey: 'github:user:id:\ufff0'}, (err, body) => {
  const store = { }
  const store2 = { }
  const contributors = []
  if (err) { return console.log('err:', err) }
  setInterval(() => console.log(new Date(), 'ping'), 5000)
  console.log(body.rows.length)
  // console.log(body.rows[0])
  body.rows.forEach((doc) => {
    contributors.push(doc.doc.login)
    store[doc.doc.login] = doc.doc
    store2[doc.doc.login] = doc.doc
  })

  // console.log(contributors.slice(0, 1))
  // if (false)
  contributors.forEach((user) => {
    console.log('USER:', user)
    request()
      .then(() => ghUser(user, store))
      .then((doc) => {
        // console.log('STORED:', store[doc.login])
        // console.log('STORED2:', store2[doc.login])
        Object.assign(store2[doc.login], doc)
        // console.log('OUT:', out)
        // console.log('STORED2:', store2[doc.login])
        // doc._id = store[doc.login]._id
        // doc._rev = store[doc.login]._rev
        return store2[doc.login] // out
      })
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
      .then((x) => console.log(new Date(), user, x))
      .catch((e) => console.log(new Date(), 'ERR:', user, e))
  })
})
