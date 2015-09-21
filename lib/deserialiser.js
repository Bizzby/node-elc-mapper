/**
 * Accepts a spec and returns a function that operates on a serialised model data and returns 
 * the model?
 *
 */


/**
 * spec definition:
 * TODO:
 *     - setting for say if property is data/accessor or set via java style setter functions
 *     - default should belong to the model itself
 *     - doesn't support nested objects - but maybe they should always be seperate mappers anyway
 */

/*
{
    factory : // function that will be called, should return a new instance of the model ready to be configured.
              // is passed the optional initilisation data incase it wishes to use that for initialisation
              // we have "initialisation data" just because some models needs it.

    // object containing info on how to create/fill/whatever each property on the new model instance
    properties: {
        propertyName : {
            optional: // boolean, default false, determines if `propertyName` is optional
                      // if true, then `propertyName` will not be created set on the model
                      // if it is not present in serialisedData. may one day throw error if false
                      // and no data found or returned by `mapper`. Currently does fuck all
                      // other than allow developer to signal intent
                      
            mapper:   // function, optional, fuction to operate on the serialisedData to produce
                      // the value for the model property. it's only arg is the serialisedData. the returned value
                      // is then assigned to the 'propertyName'. 
                      // TODO: if 'undefined' is returned then act like `propertyName` didn't exist in the serialisedData.
                      // cannot be used with explicit `sourceKey`.

           transform: // function, optional, function to operate on serialisedData's `key` to produce the value.
                      // behaves like mapper except only arg is the value for the `key`.
                      // Will not be applied if `propertyName`/`sourceKey`/`key` is `undefined` or `null`
                      // if `undefined` is returned then acts like `propertyName`/`sourceKey` didn't exist on serialisedData.
                      // cannot be used with 'mapper'.
                      // if `sourceKey` is present then the value for that key on the serialisedData will be used

            setter:   // string, optional, name of the function to use for setting, will work like this sort
                      // `model[setter](data)` where data is either returned from `mapper`, or `sourceKey`, or `propertyName`

            sourceKey: // string, optional, determines which key on the serialisedData this value will come from.
                       // cannot be used with `mapper`.

            default: // optional, a value that will be used if the `propertyName/sourceKey` is not found in the serialiedData, or 'undefined'
                     // is returned by mapper. `null` values in the serialiedData will be copied across.
                     // cannot be used with `optional`

        }
    }
}
*/

/*
 * var mySpec = {
 *     id: {},
 *     name: {
 *         mapper: function(user){ return user.firstname + ' ' + user.lastname }
 *     }
 *     team: {
 *         sourceKey: companyName
 *     }    
 * }
 *
 * var myDeserialiser = createDeserialiser(mySpec)
 *
 * given a model of
 * {
 *     id: 12,
 *     firstname: 'James',
 *     lastname: 'Butler',
 *     companyName: 'rofly',
 *     meta: 'some string?'
 * }
 * 
 * it would serialise to
 * 
 * {
 *     id: 12,
 *     name: 'James Butler',
 *     team: 'rofly'
 * }
 */

var utils = require('./utils'); 

exports.createDeserialiser = createDeserialiser;

function createDeserialiser(spec){

    validateSpec(spec);

    var keys = Object.keys(spec.properties);

    var deserialiser = function(serialisedData, initialisationData){

        var model = spec.factory(initialisationData);

        function _doTheSoulfulChicken(key) {

            var val = getValueForKeyFromDataBasedOnSpec(key, spec.properties[key], serialisedData);

            if (val !== undefined) {
                setValueForKeyBasedOnSpec(key, spec.properties[key], val, model)
            }
        }

        keys.forEach(_doTheSoulfulChicken);

        return model;

    }

    return deserialiser;
}

/**
 * returns a value from the serialisedData based on the keyspec
 * assume that the validator has been applied.
 */
function getValueForKeyFromDataBasedOnSpec(key, keySpec, serialisedData) {

    var retval;

    // do we have a mapper try to use it
    // else try to find another source key
    // else just our key name
    if( keySpec.mapper ) {
        retval = keySpec.mapper(serialisedData);
    } else if ( keySpec.sourceKey ) {
        retval = serialisedData[keySpec.sourceKey];
    } else {
        retval = serialisedData[key];
    }

    // for safety we check that we haven't got a mapper
    // even though validator should catch that.
    // FIXME: can we avoid re-assigning the variable?
    if(retval !== undefined && retval !== null && !keySpec.mapper && keySpec.transform ) {
        retval = keySpec.transform(retval)
    }

    if(retval === undefined && keySpec.default) {
        //FIXME: should we be cloning if we have non-primitive values?
        retval = keySpec.default;
    }

    return retval;

}

function setValueForKeyBasedOnSpec(key, keySpec, value, model) {

    // either try to use setter or just set property.

    if (keySpec.setter) {
        model[keySpec.setter](value)
    } else {
        model[key] = value
    }

}

exports.validateSpec = validateSpec;

var optTypes = {
    optional: 'boolean',
    mapper: 'function',
    transform: 'function',
    sourceKey: 'string',
    setter: 'string'
}

var illegalOptPairs = [
    ['mapper', 'sourceKey'],
    ['mapper', 'transform'],
    ['default', 'optional'] 
]

function validateSpec(spec) {

    function _validateSpecProperty(key){

        var item = spec.properties[key];

        for (opt in optTypes) {
            utils.optionTypeCheck(opt, optTypes[opt], key, item);
        }

        //check for illegal option groups
        function _doCheck(optPair){
            utils.illegalOptionPairCheck(optPair[0], optPair[1], key, item)
        }
        illegalOptPairs.forEach(_doCheck);
 
    }

    Object.keys(spec.properties).forEach(_validateSpecProperty); 
}
