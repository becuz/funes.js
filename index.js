/**
 * Simple memory cache implementation.
 *
 */
class Funes {

  constructor(conf) {
      if (!conf) conf = {};

      this.size    = conf.size || 10000;    //maximum size of the cache
      this.validity = conf.validity == 0 ? conf.validity : conf.validity || 5 * 60 * 1000; //validity in ms of an element in the cache
      this.retrieve = conf.retrieve;    //retrieve function to get expired objects or objects not in cache. Must returns a Promise.
      this.responseField = conf.responseField || 'body'; //field in the response of the retrieve function, containing *array* of new objects
      this.idField = conf.idField || 'id';  //field of the object containint the "id"


      this.cache = {
          queue: [],
          objects: {}   //objects: {id: {object:{id:1, ..}, lastAccess:"2017-11-27T10:43:10.264Z"}}
      }
  }

  /**
  * Gets an element (or more) from the cache and, if it's not present, retrieves it and puts it into the cache (or returns null)
  *
  */
  get(ids){
      var requestIsArray = Array.isArray(ids);
      if (!Array.isArray(ids)) ids = [ids];

      var now = new Date().getTime();

      return new Promise((resolve, reject) => {
          var result = [];
          var idsNotInCache = [];
          ids.forEach(id => {
                if (this.cache.objects[id]
                        && (now - this.cache.objects[id].lastAccess < this.validity)){
                    var object = this.cache.objects[id].object;
                    result.push(object);
                    this.put(object)
                } else {
                    idsNotInCache.push(id);
                }
          });

          var promise = (idsNotInCache.length > 0) && this.retrieve
            ?
            this._retrieve(idsNotInCache)
              .then(response => {
                  response[this.responseField].forEach(object => {
                      result.push(object);
                      this.put(object)
                  })
              })
            :
            Promise.resolve(null);

          promise
          .then( () => {return resolve(requestIsArray ? result : result[0] || null);})
          .catch(reject)
      })

  }

  /**
  * Put an element in the cache
  */
  put(objects){
      if (!Array.isArray(objects)) objects = [objects];

      objects.forEach(object => {

          this.cache.objects[object[this.idField]] = {
              object: object,
              lastAccess: new Date()
          }

          var oldIndex = this.cache.queue.indexOf(object[this.idField]);
          this.cache.queue.splice(0, 0, object[this.idField]);
          if (oldIndex > -1){
              this.cache.queue.splice(oldIndex+1, 1);
          } else if (this.cache.queue.length > this.size){
              var idToDelete = this.cache.queue[this.cache.queue.length-1];
              this.cache.queue.splice(this.cache.queue.length-1, 1);
              delete this.cache.objects[idToDelete];
          }

      })
  }

  /**
  *
  */
  _retrieve(ids){
      return this.retrieve(ids);
  }

}

module.exports = Funes;
