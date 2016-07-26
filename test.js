/*eslint arrow-parens: [2, "as-needed"]*/
'use strict'
import test from 'ava'
import fn from './'

test('title', t => {
  t.is(fn('unicorns'), 'unicorns & rainbows')
})
