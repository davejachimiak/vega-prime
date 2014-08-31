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
      this.getUserMedia = function() {};
      this.userMediaConstraints = new Object;
      options = {
        url: this.url,
        roomId: this.roomId,
        badge: this.badge,
        observatory: this.observatory,
        getUserMedia: this.getUserMedia,
        userMediaConstraints: this.userMediaConstraints
      };
      return this.vegaPrime = new VegaPrime(options);
    });
    afterEach(function() {
      return sinon.collection.restore();
    });
    describe('#init', function() {
      beforeEach(function() {
        return this.stub = sinon.collection.stub(this.vegaPrime, 'getUserMedia');
      });
      return it('calls getUserMedia with constraints and callback', function() {
        this.vegaPrime.init();
        return expect(this.stub).to.have.been.calledWith(this.userMediaConstraints, this.vegaPrime.getUserMediaCallback);
      });
    });
    describe('#getUserMediaCallback', function() {
      describe('an error occurred', function() {
        return it('delegates to localStreamError', function() {
          var error, localStreamError;
          localStreamError = sinon.collection.stub(this.vegaPrime, '_localStreamError');
          this.vegaPrime.getUserMediaCallback(error = new Object, null);
          return expect(localStreamError).to.have.been.calledWith(error);
        });
      });
      return describe('stream is passed', function() {
        return it('delegates to _localStreamReceived', function() {
          var localStreamReceived, stream;
          localStreamReceived = sinon.collection.stub(this.vegaPrime, '_localStreamReceived');
          this.vegaPrime.getUserMediaCallback(null, stream = new Object);
          return expect(localStreamReceived).to.have.been.calledWith(stream);
        });
      });
    });
    describe('#_localStreamReceived', function() {
      beforeEach(function() {
        this.stream = new Object;
        this.call = sinon.collection.stub(this.observatory, 'call');
        this.trigger = sinon.collection.stub(this.vegaPrime, 'trigger');
        sinon.collection.stub(this.vegaPrime, '_wrappedStream').withArgs(this.stream).returns(this.wrappedStream = new Object);
        return this.vegaPrime._localStreamReceived(this.stream);
      });
      it('has the observatory make a call with the local stream', function() {
        return expect(this.call).to.have.been.calledWith(this.stream);
      });
      return it('triggers localStreamReceived with a wrapped stream', function() {
        return expect(this.trigger).to.have.been.calledWith('localStreamReceived', this.wrappedStream);
      });
    });
    describe('_wrappedStream', function() {
      return it('creates an object url out of the stream and sets it with the stream on an object', function() {
        var stream, url, urlHelper;
        stream = new Object;
        global.URL = urlHelper = {
          createObjectURL: function() {}
        };
        sinon.collection.stub(urlHelper, 'createObjectURL').withArgs(stream).returns(url = 'http://www..com');
        expect(this.vegaPrime._wrappedStream(stream)).to.eql({
          stream: stream,
          url: url
        });
        return global.URL = void 0;
      });
    });
    describe('#_localStreamError', function() {
      return it('triggers a localStreamError', function() {
        var error, trigger;
        trigger = sinon.collection.stub(this.vegaPrime, 'trigger');
        error = new Object;
        this.vegaPrime._localStreamError(error);
        return expect(trigger).to.have.been.calledWith('localStreamError', error);
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
