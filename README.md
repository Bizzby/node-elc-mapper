# ELC Mapper

You'll probably neveer nead to use this unless you have some "wierd" technical requirements.

experimenting with mappers and javascript's total lack of type system...

for implementation see `./lib/serialiser` and `./lib/deserialiser`

## Serialiser

 spec definition:
 If key is just an empty object '{}', or none of the optional keys below are found
 then the key ('propertyName') is just copied across (currently not cloned or anything)
 
 ```
 {
     propertyName : {
         optional: 
         mapper:   
         transform: 
         getter:
         sourceKey:
         default:
     }
 }
 ```

- `optional`: boolean, default false, determines if `propertyName` is optional. if true, then `propertyName` will not be created in the serialised data if it is not present on model. May one day throw error if false and no data found or returned by `mapper`/`transform`. Currently does nothing
other than allow developer to signal intent.
- `mapper`:  function, optional, function to operate on the model to produce the value for the propertyName. it's only arg is the model. the returned value from the function is then assigned to the `propertyName`. if `undefined` is returned then acts like `propertyName` didn't exist on model. Cannot be used with `sourceKey`.
- `transform`: function, optional, function to operate on `model[propertyName]` or `model[getter]()` to produce the value. Behaves like `mapper` except only arg is the value for the `propertyName`/`sourceKey`/`getter()`. if `undefined` is returned then acts like `propertyName`/`sourceKey`/`getter` didn't exist on model. Cannot be used with `mapper`. Will not be called if `propertyName`/`sourceKey` is `undefined`. if `sourceKey` is present then the value for that propertyName on the model will be used
- `getter`: string, optional, name of the function to use for getting, will work like this `model[getter]()`. Cannot be used with `mapper`, or `sourceKey`
- `sourceKey`: string, optional, determines which propertyName on the model this value will come from. Cannot be used with `mapper`.
- `default`: primitive value or function that will be used if the `propertyName`/`sourceKey` is not found on the model, or is `undefined` is returned by mapper. If a function (`typeof 'function'`), then result of calling that function will be assigned. `null` values on the model will copied across.

 example:

 ```
 var mySpec = {
     id: {},
     name: {
         mapper: function(user){ return user.firstname + ' ' + user.lastname }
     }
     team: {
         sourceKey: companyName
     }
 }
 
 var mySerialiser = createSerialiser(mySpec)
 
 // given a model of
 {
     id: 12,
     firstname: 'James',
     lastname: 'Butler',
     companyName: 'rofly',
     meta: 'some string?'
 }
 
 // it would serialise to
 
 {
     id: 12,
     name: 'James Butler',
     team: 'rofly'
 }
 ```

## Deserialiser

```
{
    factory : // function that will be called, should return a new instance of the model ready to be configured.
              // is passed the optional initilisation data incase it wishes to use that for initialisation
              // we have "initialisation data" just because some models needs it.

    // object containing info on how to create/fill/whatever each property on the new model instance
    properties: {
        propertyName : {
            optional: 
            mapper:   
            transform: 
            setter:   
            sourceKey: 
            default: 
        }
    }
}
```

-`factory`: function that will be called, should return a new instance of the model ready to be configured. Is passed the optional initilisation data incase it wishes to use that for initialisation
_we have "initialisation data" just because some models needs it._

- `optional`: boolean, default false, determines if `propertyName` is optional. if true, then `propertyName` will not be created on the model if it is not present in the serialised data. May one day throw error if false and no data found or returned by `mapper`/`transform`. Currently does nothing
other than allow developer to signal intent.
- `mapper`:  function, optional, function to operate in the serialised data to produce the value for the propertyName. it's only arg is the serialised data. the returned value from the function is then assigned to the `propertyName`. if `undefined` is returned then acts like `propertyName` didn't exist in the serialised data. Cannot be used with `sourceKey`.
- `transform`: function, optional, function to operate on `data[propertyName]` to produce the value. Behaves like `mapper` except only arg is the value for the `propertyName`/`sourceKey`. if `undefined` is returned then acts like `propertyName`/`sourceKey` didn't exist on model. Cannot be used with `mapper`. Will not be called if `propertyName`/`sourceKey` is `undefined`. if `sourceKey` is present then the value for that `propertyName` on the serialised data will be used
- `setter`: string, optional, name of the function to use for setting, will work like this `model[setter](value)`.
- `sourceKey`: string, optional, determines which propertyName on the the serialised data this value will come from. Cannot be used with `mapper`.
- `default`: primitive value or function that will be used if the `propertyName`/`sourceKey` is not found on the the serialised data, or is `undefined` is returned by mapper. If a function (`typeof 'function'`), then result of calling that function will be assigned. `null` values on the the serialised data will copied across.



example

```
var mySpec = {
    id: {},
    name: {
        mapper: function(user){ return user.firstname + ' ' + user.lastname }
    }
    team: {
        sourceKey: companyName
    }
}
var myDeserialiser = createDeserialiser(mySpec)
// given a model of
{
    id: 12,
    firstname: 'James',
    lastname: 'Butler',
    companyName: 'rofly',
    meta: 'some string?'
}
// it would serialise to
{
    id: 12,
    name: 'James Butler',
    team: 'rofly'
}
```