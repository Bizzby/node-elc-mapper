'use strict'

var tap = require('tap')
var utils = require('../lib/utils')

function illegalOptionSet () {
  var key = 'superTed'
  var item = {
    launch: function () {},
    crash: function () {}
  }

  utils.illegalOptionPairCheck('launch', 'crash', key, item)
}

tap.throws(illegalOptionSet, /superTed\.launch and superTed\.crash cannot both be present/)

function badTypeCheck () {
  var key = 'projectIdentifier'
  var item = {
    mapper: 'whhoops'
  }

  utils.optionTypeCheck('mapper', 'function', key, item)
}

// key + '.' + item + ' must be a ' + typeName
tap.throws(badTypeCheck, /projectIdentifier\.mapper must be a function/)
