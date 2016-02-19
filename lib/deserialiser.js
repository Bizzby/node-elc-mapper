'use strict'

/**
 * TODO:
 *     - setting for say if property is data/accessor or set via java style setter functions
 *     - default should belong to the model itself
 *     - doesn't support nested objects - but maybe they should always be seperate mappers anyway
 */

const PropertiesValidator = require('./PropertiesValidator').PropertiesValidator

exports.createDeserialiser = createDeserialiser

function createDeserialiser (spec) {
  validateSpec(spec)
  const keys = Object.keys(spec.properties)

  const deserialiser = function (serialisedData, initialisationData) {
    const model = spec.factory(initialisationData)

    function _doTheSoulfulChicken (key) {
      const val = getValueForKeyFromDataBasedOnSpec(key, spec.properties[key], serialisedData)

      if (val !== undefined) {
        setValueForKeyBasedOnSpec(key, spec.properties[key], val, model)
      }
    }

    keys.forEach(_doTheSoulfulChicken)

    return model
  }

  return deserialiser
}

/**
 * returns a value from the serialisedData based on the keyspec
 * assume that the validator has been applied.
 */
function getValueForKeyFromDataBasedOnSpec (key, keySpec, serialisedData) {
  let retval
  // do we have a mapper try to use it
  // else try to find another source key
  // else just our key name
  if (keySpec.mapper) {
    retval = keySpec.mapper(serialisedData)
  } else if (keySpec.sourceKey) {
    retval = serialisedData[keySpec.sourceKey]
  } else {
    retval = serialisedData[key]
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

function setValueForKeyBasedOnSpec (key, keySpec, value, model) {
  // either try to use setter or just set property.
  if (keySpec.setter) {
    model[keySpec.setter](value)
  } else {
    model[key] = value
  }
}

exports.validateSpec = validateSpec

const optTypes = {
  optional: 'boolean',
  mapper: 'function',
  transform: 'function',
  sourceKey: 'string',
  setter: 'string'
}

const illegalOptPairs = [
    ['mapper', 'sourceKey'],
    ['mapper', 'transform'],
    ['default', 'optional']
]

const propertyValidator = new PropertiesValidator(optTypes, illegalOptPairs)

function validateSpec (spec) {
  propertyValidator.validate(spec.properties)
}
