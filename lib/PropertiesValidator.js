'use strict'

/**
 * Why am I using a class here? Who knows....
 */

const utils = require('./utils')

exports.createPropertiesValidator = function (optTypes, illegalOptPairs) {
  return new PropertiesValidator(optTypes, illegalOptPairs)
}

exports.PropertiesValidator = PropertiesValidator

function PropertiesValidator (optTypes, illegalOptPairs) {
  this._optTypes = optTypes || {}
  this._illegalOptPairs = illegalOptPairs || []
}

PropertiesValidator.prototype._validateProperty = function (propertyName, PropertySpec) {
  Object.keys(this._optTypes).forEach((optName) => {
    utils.optionTypeCheck(optName, this._optTypes[optName], propertyName, PropertySpec)
  })

  function _doCheck (optPair) {
    utils.illegalOptionPairCheck(optPair[0], optPair[1], propertyName, PropertySpec)
  }

  this._illegalOptPairs.forEach(_doCheck)
}

PropertiesValidator.prototype.validate = function (propertiesSpec) {
  for (let propertyName in propertiesSpec) {
    this._validateProperty(propertyName, propertiesSpec[propertyName])
  }
}
