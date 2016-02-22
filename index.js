'use strict'

const serialiser = require('./lib/serialiser');
const deserialiser = require('./lib/deserialiser');

exports.createSerialiser = serialiser.createSerialiser;
exports.serialiserSpecValidator = serialiser.validateSpec;

exports.createDeserialiser = deserialiser.createDeserialiser;
exports.deserialiserSpecValidator = deserialiser.validateSpec;