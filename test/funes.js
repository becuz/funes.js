const chai = require('chai');
const expect = chai.expect;
var Funes = require('../index');

describe('funes.js', () => {

    it('get null should return null when empty', done => {
        var cache = new Funes();
        cache.put({id: 1, name: 'a'});

        cache.get(1).then(obj => console.log(obj));


        new Funes().get(null).then(obj => {
            expect(obj).to.be.null;
            done();
        });
    });

    it('get null should return [] when empty', done => {
        new Funes().get([null]).then(obj => {
            expect(obj).to.be.an('array').to.have.lengthOf(0);
            done();
        });
    });

    it('get 1 should return null when empty', done => {
        new Funes().get(1).then(obj => {
            expect(obj).to.be.null;
            done();
        });
    });

    it('get [1] should return [] when empty', done => {
        new Funes().get([1]).then(obj => {
            expect(obj).to.be.an('array').to.have.lengthOf(0);
            done();
        });
    });

    it('get should return same obj', done => {
        var defaultCache = new Funes();
        var obj = {id: 1, name: 'a'};
        defaultCache.put(obj);
        defaultCache.get(1).then(obj => {
            expect(obj).to.be.equal(obj);
            done();
        });
    });

    it('should be fifo', done => {
        var cache = new Funes({size: 1});
        var object = {id: 1, name: 'a'};
        var object2 = {id: 2, name: 'b'};
        cache.put([object, object2]);
        cache.get([1, 2]).then(obj => {
            expect(obj).to.be.an('array').to.have.lengthOf(1);
            expect(obj[0]).to.be.equals(object2);
            done();
        });
    });


    it('queue should works fine', done => {
        var cache = new Funes({size: 5});
        var ids = [];
        for(var i=0;i<10;i++){
            cache.put({id: i});
            ids.push(i);
        }

        cache.get(ids).then(obj => {
            expect(obj).to.be.an('array').to.have.lengthOf(5);

            cache.get(2).then(obj => {
                expect(obj).to.be.null

                cache.get(8).then(obj => {
                    expect(obj.id).to.be.equal(8);

                    expect(cache.cache.queue).to.be.an('array').to.have.lengthOf(5);
                    expect(cache.cache.queue[0]).to.be.equal(8);
                    expect(cache.cache.queue[1]).to.be.equal(9);
                    expect(cache.cache.queue[2]).to.be.equal(7);
                    expect(cache.cache.queue[3]).to.be.equal(6);
                    expect(cache.cache.queue[4]).to.be.equal(5);
                    done();
                })
            })
        });
    });

    it('should ignore old objects', done => {
        var cache = new Funes({validity: 10});
        var object = {id: 1, name: 'a'};
        var object2 = {id: 2, name: 'b'};
        cache.put([object, object2]);
        setTimeout(function(){
            cache.get([1, 2]).then(obj => {
                expect(obj).to.be.an('array').to.have.lengthOf(0);
                done();
            });
        }, 11)
    });

    it('should overwrite previous objects', done => {
        var cache = new Funes();
        cache.put({id: 1, name: 'a'});
        cache.put({id: 1, name: 'b'});
        cache.get(1).then(obj => {
            expect(obj.name).to.be.equal('b');
            done();
        });
    });

    it('should retrieve new objects', done => {
        var cache = new Funes(
            {
                validity: 0,
                retrieve: function(ids){
                    expect(ids).to.be.an('array').to.have.lengthOf(1);
                    expect(ids[0]).to.be.equal(1);
                    return Promise.resolve({body: [{id:1, name: 'a'}]})
                }
            });

        cache.put({id:1, name: 'b'});
        setTimeout(
                function(){
                    cache.get(1).then(obj => {
                        expect(obj.id).to.be.equal(1);
                        expect(obj.name).to.be.equal('a');
                        done();
                    });
                }, 3
        );
    });

});
