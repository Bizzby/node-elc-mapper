var tap = require('tap');
var serialiser = require('../');

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
        sourceKey: 'seconds',
        transform: function(mills) { return mills*1000}
    },
    bad : {},
    complex_thing: {
        getter: 'complexThing'
    }
}

var myModel = {
     id: 12,
     firstname: 'James',
     lastname: 'Butler',
     companyName: 'rofly',
     meta: 'some string?',
     bad: undefined,
     seconds: 3,
     complexThing: function(){return 10}
 }
 
 
var desiredResult = {
     id: 12,
     name: 'James Butler',
     team: 'rofly',
     seating: 'standard',
     milliseconds: 3000,
     complex_thing: 10
}


var mySerialiser = serialiser.createSerialiser(mySpec);

var actualResult = mySerialiser(myModel);

tap.deepEqual(actualResult, desiredResult);
