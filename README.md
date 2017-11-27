# funes.js

Small in-memory cache.
It can transparently implement a simple "get or retrieve" policy.

## Simple usage

```
var Funes = require('funes.js');

var cache = new Funes();
cache.put({id: 1, name: 'a'});
cache.get(1).then(obj => console.log(obj));
```

## "get or retrieve" usage

```
var Funes = require('funes.js');

var cache = new Funes({
    retrieve: function(ids){
        return request.get(`http://awesome-api.com/users?ids[]=${ids.join("&ids[]=")})
    }
});

cache.get(1).then(obj => console.log(obj));
```

### Parameters
All configuration parameters are optional
```
var cache = new Funes({
    size: 10000,                //maximum size of the cache
    validity: 5 * 60 * 1000,    //validity in ms of an element in the cache
    retrieve: function(ids){    //retrieve function to get expired objects or objects not in cache. Must returns a Promise.
        return request.get(`http://awesome-api.com/users?ids[]=${ids.join("&ids[]=")})
    },    
    responseField: 'body',      //field in the response of the retrieve function, containing *array* of new objects   
    idField: 'id'               //field of the object containint the "id"        
});
```



### Installing
```
npm install funes.js
```

## Running the tests
```
npm test
```
