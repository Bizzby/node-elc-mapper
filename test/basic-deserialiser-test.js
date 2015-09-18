var assert = require('assert');
var deserialiser = require('../');

var mySpec =  {  
    factory: function(){return new SomeUser()},
    properties : {
        id: {},
        name: {
            mapper: function(serialisedUser){ return serialisedUser.firstname + ' ' + serialisedUser.lastname }
        },
        team: {
         sourceKey: 'companyName'
        },
        seating: {
            setter : 'setSeating'
        },
        meta: {
            default: 'some string?'
        },
        seconds: {
            transform: function(milliseconds) { return milliseconds/1000}
        },
        bad : {}
    }
}

var SomeUser = function(){
}

SomeUser.prototype.setSeating = function(seat) {
    this.seat = seat;
};

Object.defineProperties(SomeUser.prototype, {
    'name': {
        set: function(str){this._name = str},
        get: function(){ return this._name}
    }
})


var serialisedData = {
     id: 12,
     firstname: 'James',
     seat: 'Z',
     lastname: 'Butler',
     companyName: 'rofly',
     seating: 'standard',
     seconds: 3000
}

var desiredResult = {
     id: 12,
     _name: 'James Butler',
     seat: 'standard',
     team: 'rofly',
     meta: 'some string?',
     seconds: 3
 }
 


var myDeserialiser = deserialiser.createDeserialiser(mySpec);

var actualResult = myDeserialiser(serialisedData);

assert.deepEqual(actualResult, desiredResult);
