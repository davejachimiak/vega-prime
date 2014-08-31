// Generated by CoffeeScript 1.7.1
(function() {
  var MockObservatory, VegaPrime, chai, expect, sinon, sinonChai;

  chai = require('chai');

  sinon = require('sinon');

  sinonChai = require('sinon-chai');

  expect = chai.expect;

  chai.use(sinonChai);

  VegaPrime = require('../vega-prime');

  MockObservatory = (function() {
    function MockObservatory() {}

    MockObservatory.prototype.callbacks = {};

    MockObservatory.prototype.on = function(event, callback) {
      var _base;
      (_base = this.callbacks)[event] || (_base[event] = []);
      return this.callbacks[event].push(callback);
    };

    MockObservatory.prototype.trigger = function(event) {
      var args, callbacks;
      args = Array.prototype.slice.call(arguments, 1);
      if (callbacks = this.callbacks[event]) {
        return callbacks.forEach(function(callback) {
          return callback.apply(this, args);
        });
      }
    };

    MockObservatory.prototype.call = function() {};

    MockObservatory.prototype.createOffer = function() {};

    MockObservatory.prototype.createAnswer = function() {};

    MockObservatory.prototype.onStreamAdded = function() {};

    MockObservatory.prototype.onPeerRemoved = function() {};

    return MockObservatory;

  })();

  describe('vega-prime', function() {
    beforeEach(function() {
      var options;
      this.url = 'ws://0.0.0.0:3000';
      this.roomId = '/abc123';
      this.badge = {
        name: 'Dave'
      };
      this.observatory = new MockObservatory;
      this.getUserMediaPromise = {
        create: function() {}
      };
      options = {
        url: this.url,
        roomId: this.roomId,
        badge: this.badge,
        observatory: this.observatory,
        getUserMediaPromise: this.getUserMediaPromise
      };
      return this.vegaPrime = new VegaPrime(options);
    });
    afterEach(function() {
      return sinon.collection.restore();
    });
    describe('#init', function() {
      beforeEach(function() {
        return sinon.collection.stub(this.getUserMediaPromise, 'create').returns(this.promise = {
          done: function() {}
        });
      });
      return it('calls done on the getUserMedia promise', function() {
        var done;
        done = sinon.collection.stub(this.promise, 'done');
        this.vegaPrime.init();
        return expect(done).to.have.been.calledWith(this.vegaPrime.getUserMediaPromiseDone);
      });
    });
    describe('#onStreamAdded', function() {
      it('delegates to the observatory', function() {
        var arg, onStreamAdded;
        onStreamAdded = sinon.collection.stub(this.observatory, 'onStreamAdded');
        arg = function() {};
        this.vegaPrime.onStreamAdded(arg);
        return expect(onStreamAdded).to.have.been.calledWith(arg);
      });
      return it('returns vega prime', function() {
        var returnVal;
        returnVal = this.vegaPrime.onStreamAdded(function() {});
        return expect(returnVal).to.eq(this.vegaPrime);
      });
    });
    describe('#onPeerRemoved', function() {
      it('delegates to the observatory', function() {
        var arg, onPeerRemoved;
        onPeerRemoved = sinon.collection.stub(this.observatory, 'onPeerRemoved');
        arg = function() {};
        this.vegaPrime.onPeerRemoved(arg);
        return expect(onPeerRemoved).to.have.been.calledWith(arg);
      });
      return it('returns vega prime', function() {
        var returnVal;
        returnVal = this.vegaPrime.onPeerRemoved(function() {});
        return expect(returnVal).to.eq(this.vegaPrime);
      });
    });
    describe('#onLocalStreamReceived', function() {
      it('saves a callback for when a local stream is received', function() {
        var callback, stream;
        stream = new Object;
        callback = (function(_this) {
          return function(stream) {
            return _this.theStream = stream;
          };
        })(this);
        this.vegaPrime.onLocalStreamReceived(callback);
        this.vegaPrime.trigger('localStreamReceived', stream);
        return expect(this.theStream).to.eq(stream);
      });
      return it('returns the vega prime', function() {
        var returnVal;
        returnVal = this.vegaPrime.onLocalStreamReceived(function() {});
        return expect(returnVal).to.eq(this.vegaPrime);
      });
    });
    return describe('observatory callbacks', function() {
      beforeEach(function() {
        var peer2;
        this.peer1 = {
          peerId: 'peerId1'
        };
        peer2 = {
          peerId: 'peerId2'
        };
        return this.peers = [this.peer1, peer2];
      });
      it('creates an offer for all peers in the payload', function() {
        var createOffer;
        createOffer = sinon.collection.spy(this.observatory, 'createOffer');
        this.observatory.trigger('callAccepted', this.peers);
        return this.peers.forEach((function(_this) {
          return function(peer) {
            return expect(createOffer).to.have.been.calledWith(peer.peerId);
          };
        })(this));
      });
      return it('creates an answer for an offering peer', function() {
        var createAnswer;
        createAnswer = sinon.collection.spy(this.observatory, 'createAnswer');
        this.observatory.trigger('offer', this.peer1);
        return expect(createAnswer).to.have.been.calledWith(this.peer1.peerId);
      });
    });
  });

}).call(this);
