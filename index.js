var serialiser = require('./serialiser');
var deserialiser = require('./deserialiser');

exports.createSerialiser = serialiser.createSerialiser;
exports.serialiserSpecValidator = serialiser.validateSpec;

exports.createDeserialiser = deserialiser.createDeserialiser;
exports.deserialiserSpecValidator = deserialiser.validateSpec;