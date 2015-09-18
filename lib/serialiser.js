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

/**
 * spec definition:
 * If key is just an empty object '{}', or none of the optional keys below are found
 * then the key ('propertyName') is just copied across (currently not cloned or anything)
 * 
 * {
 *     propertyName : {
 *         optional: // boolean, default false, determines if `propertyName` is optional
 *                   // if true, then `propertyName` will not be created in serialised data
 *                   // if it not present on model. may one day throw error if false
 *                   // and no data found or returned by `mapper`. Currently does fuck all
 *                   // other than allow developer to signal intent.
 *                   
 *         mapper:   // function, optional, fuction to operate on the model to produce
 *                   // the value for the key. it's only arg is the model. the returned value
 *                   // is then assigned to the `propertyName`. 
 *                   // if `undefined` is returned then acts like `propertyName` didn't exist on model.
 *                   // cannot be used with explicit 'sourceKey'.
 *
 *         transform: // function, optional, function to operate on model's `key` to produce the value.
 *                    // behaves like mapper except only arg is the value for the `key`.
 *                    // if `undefined` is returned then acts like `propertyName`/`sourceKey`/`getter` didn't exist on model.
 *                    // cannot be used with 'mapper'.
 *                    // if `sourceKey` is present then the value for that key on the model will be used
 *
 *         getter:    // string, optional, name of the function to use for getting, will work like this
 *                    // `model[getter]()`
 *                    // cannot be used with `mapper`, or `sourceKey` 
 *
 *         sourceKey: // string, optional, determines which key on the model this value will come from.
 *                    // cannot be used with `mapper`.
 *
 *         default: // optional, a value that will be used if the `propertyName`/`sourceKey` is not found on the model, or `undefined`
 *                  // is returned by mapper. null values on the model will copied across.
 *                  // cannot be used with `optional`
 *     }
 * }
 *
 * example:
 *
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
 * var mySerialiser = createSerialiser(mySpec)
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


exports.createSerialiser = createSerialiser;

function createSerialiser(spec){

    validateSpec(spec);

    var keys = Object.keys(spec);    


    var serialiser = function(model){

        var serialisedData = {}

        function _doTheFunkyChicken(key) {

            var val = getDataForKeyFromModelBasedOnSpec(key, spec[key], model);

            if (val !== undefined) {
                serialisedData[key] = val;
            }
        }

        keys.forEach(_doTheFunkyChicken);

        return serialisedData;

    }

    return serialiser;
}

/**
 * returns a value from the model based on the keyspec
 * assume that the validator has been applied.
 */
function getDataForKeyFromModelBasedOnSpec(key, keySpec, model) {

    var retval;

    // do we have a mapper try to use it
    // else try to find another source key
    // else just our key name
    if( keySpec.mapper ) {
        retval = keySpec.mapper(model);
    } else if ( keySpec.sourceKey ) {
        retval = model[keySpec.sourceKey];
    } else {
        retval = model[key];
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


exports.validateSpec = validateSpec;

function validateSpec(spec) {

    function _validateSpecItem(key){

        var item = spec[key];

        //FIXME: these tests are probably not bulletproof
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

        if ('getter' in item && typeof item.getter !== 'string') {
            throw new TypeError(key + '.getter must be a string');
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
        // X [getter && sourceKey]
        if ('getter' in item && 'sourceKey' in item) {
            throw new Error(key + '.sourceKey and ' + key + '.getter cannot both be present')
        }        
        // X [getter && transform]
        if ('getter' in item && 'transform' in item) {
            throw new Error(key + '.transform and ' + key + '.getter cannot both be present')
        }        
        // X [default && optional]
        if ('default' in item && 'optional' in item) {
            throw new Error(key + '.default and ' + key + '.optional cannot both be present')
        }

    }

    Object.keys(spec).forEach(_validateSpecItem); 
}