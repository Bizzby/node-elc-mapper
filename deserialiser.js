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

           transform: // function, optional, function to operate on model`s `key` to produce the value.
                      // behaves like mapper except only arg is the value for the `key`.
                      // if `undefined` is returned then acts like `propertyName`/`sourceKey` didn't exist on model.
                      // cannot be used with 'mapper'.
                      // if `sourceKey` is present then the value for that key on the model will be used

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
    if( !keySpec.mapper && keySpec.transform ) {
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

function validateSpec(spec) {

    function _validateSpecProperty(key){

        var item = spec.properties[key];

        //FIXME: this test is probably not bulletproof
        if ('optional' in item && typeof item.optional !== 'boolean') {
            throw new TypeError(key + '.optional must be a boolean');
        }

        if ('mapper' in item && typeof item.mapper !== 'function') {
            throw new TypeError(key + '.mapper must be a function');
        }

        if ('transform' in item && typeof item.transform !== 'function') {
            throw new TypeError(key + '.transform must be a function');
        }

        if ('sourceKey' in item && typeof item.sourceKey !== 'string') {
            throw new TypeError(key + '.sourceKey must be a string');
        }

        if ('setter' in item && typeof item.setter !== 'string') {
            throw new TypeError(key + '.setter must be a string');
        }

        //check for illegal option groups
        // X [sourceKey && mapper]
        if ('mapper' in item && 'sourceKey' in item) {
            throw new Error(key + '.sourceKey and ' + key + '.mapper cannot both be present')
        }
        // X [mapper && transform]
        if ('mapper' in item && 'transform' in item) {
            throw new Error(key + '.transform and ' + key + '.mapper cannot both be present')
        }
        // X [default && optional]
        if ('default' in item && 'optional' in item) {
            throw new Error(key + '.default and ' + key + '.optional cannot both be present')
        }

    }

    Object.keys(spec.properties).forEach(_validateSpecProperty); 
}
