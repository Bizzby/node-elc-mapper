'use strict'

/**
 * Accepts a spec and returns a function that operates on a model and returns
 * serialised data
 *
 * TODO:
 *     - conditionals for if to apply spec item?
 *     - maybe rename `mapper` to something like  `transform`?
 *     - could `mapper` + `sourceKey` become one one key? if string then `sourceKey`, if function then `mapper`.
 *     - could `optional` and `default` become one key? what's the behaviour if it's not set?
 */

const PropertiesValidator = require('./PropertiesValidator').PropertiesValidator

exports.createSerialiser = createSerialiser

function createSerialiser (spec) {
  validateSpec(spec)

  const keys = Object.keys(spec)

  const serialiser = function (model) {
    const serialisedData = {}

    function _doTheFunkyChicken (key) {
      const val = getDataForKeyFromModelBasedOnSpec(key, spec[key], model)

      if (val !== undefined) {
        serialisedData[key] = val
      }
    }

    keys.forEach(_doTheFunkyChicken)

    return serialisedData
  }

  return serialiser
}

/**
 * returns a value from the model based on the keyspec
 * assume that the validator has been applied.
 */
function getDataForKeyFromModelBasedOnSpec (key, keySpec, model) {
  let retval
  // do we have a mapper try to use it
  // else try to find another source key
  // else just our key name
  if (keySpec.mapper) {
    retval = keySpec.mapper(model)
  } else if (keySpec.sourceKey) {
    retval = model[keySpec.sourceKey]
  } else if (keySpec.getter) {
    retval = model[keySpec.getter]()
  } else {
    retval = model[key]
  }

    // for safety we check that we haven't got a mapper
    // even though validator should catch that.
    // FIXME: can we avoid re-assigning the variable?
  if (retval !== undefined && !keySpec.mapper && keySpec.transform) {
    retval = keySpec.transform(retval)
  }

  if (retval === undefined && keySpec.default) {
        // FIXME: should we be cloning if we have non-primitive values?
    retval = typeof keySpec.default === 'function' ? keySpec.default() : keySpec.default
  }

  return retval
}

const optTypes = {
  optional: 'boolean',
  mapper: 'function',
  transform: 'function',
  sourceKey: 'string',
  getter: 'string'
}

const illegalOptPairs = [
    ['mapper', 'sourceKey'],
    ['mapper', 'transform'],
    ['getter', 'sourceKey'],
    ['getter', 'transform'],
    ['default', 'optional']
]

const propertyValidator = new PropertiesValidator(optTypes, illegalOptPairs)

exports.validateSpec = validateSpec

function validateSpec (spec) {
  propertyValidator.validate(spec)
}
