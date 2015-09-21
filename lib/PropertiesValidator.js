/**
 * Why am I using a class here? Who knows....
 */

var utils = require('./utils');

exports.createPropertiesValidator = function(optTypes, illegalOptPairs){

    return new PropertiesValidator(optTypes, illegalOptPairs);

}


exports.PropertiesValidator = PropertiesValidator;

function PropertiesValidator(optTypes, illegalOptPairs){

    this._optTypes = optTypes || {};
    this._illegalOptPairs || [];

}

PropertiesValidator.prototype._validateProperty = function(propertyName, PropertySpec) {

    for (opt in this.optTypes) {
        utils.optionTypeCheck(opt, optTypes[opt], propertyName, PropertySpec);
    }

    function _doCheck(optPair){
        utils.illegalOptionPairCheck(optPair[0], optPair[1], key, item)
    }
    console.log(this);
    this._illegalOptPairs.forEach(_doCheck);


};

PropertiesValidator.prototype.validate = function(propertiesSpec) {

    for (propertyName in propertiesSpec) {
        this._validateProperty.bind(this, propertyName, propertiesSpec[propertyName])
    }

};