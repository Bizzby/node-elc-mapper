/**
 * Love them grab bags
 */

exports.illegalOptionPairCheck = function(firstOptName, secondOptName, key, item){

    if (firstOptName in item && secondOptName in item) {
        throw new Error(key + '.' + firstOptName + ' and ' + key + '.' + secondOptName  + ' cannot both be present')
    }

}

exports.optionTypeCheck = function(optName, typeName, key, item) {
    //FIXME: this test is probably not bulletproof
    if (optName in item && typeof item[optName] !== typeName) {
        throw new TypeError(key + '.' + optName + ' must be a ' + typeName);
    }

}