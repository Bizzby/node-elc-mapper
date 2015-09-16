var assert = require('assert');
var serialiser = require('../serialiser');

var mySpec = {
    id: {},
    name: {
     mapper: function(user){ return user.firstname + ' ' + user.lastname }
    },
    team: {
     sourceKey: 'companyName'
    },
    seating: {
        default : 'standard'
    },
    milliseconds: {
        sourceKey: 'seconds'
        transform: function(mills) { return mills*1000}
    },
    bad : {}
}

var myModel = {
     id: 12,
     firstname: 'James',
     lastname: 'Butler',
     companyName: 'rofly',
     meta: 'some string?',
     bad: undefined,
     seconds: 3
 }
 
 
var desiredResult = {
     id: 12,
     name: 'James Butler',
     team: 'rofly',
     seating: 'standard',
     milliseconds: 3000
}


var mySerialiser = serialiser.createSerialiser(mySpec);

var actualResult = mySerialiser(myModel);

assert.deepEqual(actualResult, desiredResult);
