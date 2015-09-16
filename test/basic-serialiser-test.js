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
    bad : {}
}

var myModel = {
     id: 12,
     firstname: 'James',
     lastname: 'Butler',
     companyName: 'rofly',
     meta: 'some string?',
     bad: undefined
 }
 
 
var desiredResult = {
     id: 12,
     name: 'James Butler',
     team: 'rofly',
     seating: 'standard'
}


var mySerialiser = serialiser.createSerialiser(mySpec);

var actualResult = mySerialiser(myModel);

assert.deepEqual(actualResult, desiredResult);
