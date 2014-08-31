(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./vega-client').VegaClient;

},{"./vega-client":2}],2:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (typeof exports !== "undefined" && exports !== null ? exports : window).VegaClient = (function() {
    VegaClient.send = function(websocket, message) {
      var sendMessage;
      message = JSON.stringify(message);
      sendMessage = (function(_this) {
        return function() {
          return websocket.send(message);
        };
      })(this);
      if (websocket.readyState === websocket.CONNECTING) {
        return websocket.onopen = sendMessage;
      } else {
        return sendMessage();
      }
    };

    function VegaClient(url, roomId, badge) {
      this.url = url;
      this.roomId = roomId;
      this.badge = badge;
      this.onmessage = __bind(this.onmessage, this);
      if (this.url === void 0) {
        throw new TypeError('url not provided');
      }
      if (this.roomId === void 0) {
        throw new TypeError('roomId not provided');
      }
      if (this.badge === void 0) {
        throw new TypeError('badge not provided');
      }
      this.websocket = new WebSocket(this.url);
      this.callbacks = {};
      this.websocket.onmessage = this.onmessage;
    }

    VegaClient.prototype.onmessage = function(message) {
      var data, parsedData, payload, type;
      data = message.data;
      parsedData = JSON.parse(data);
      type = parsedData.type;
      payload = parsedData.payload;
      return this.trigger(type, payload);
    };

    VegaClient.prototype.on = function(type, callback) {
      var _base;
      (_base = this.callbacks)[type] || (_base[type] = []);
      return this.callbacks[type].push(callback);
    };

    VegaClient.prototype.trigger = function(type, payload) {
      if (!this.callbacks[type]) {
        return;
      }
      return this.callbacks[type].forEach((function(_this) {
        return function(callback, idx, callbacks) {
          return callback.apply(_this, [payload]);
        };
      })(this));
    };

    VegaClient.prototype.call = function() {
      return VegaClient.send(this.websocket, {
        type: 'call',
        payload: {
          roomId: this.roomId,
          badge: this.badge
        }
      });
    };

    VegaClient.prototype.offer = function(offer, peerId) {
      return VegaClient.send(this.websocket, {
        type: 'offer',
        payload: {
          offer: offer,
          peerId: peerId
        }
      });
    };

    VegaClient.prototype.answer = function(answer, peerId) {
      return VegaClient.send(this.websocket, {
        type: 'answer',
        payload: {
          answer: answer,
          peerId: peerId
        }
      });
    };

    VegaClient.prototype.candidate = function(candidate, peerId) {
      return VegaClient.send(this.websocket, {
        type: 'candidate',
        payload: {
          candidate: candidate,
          peerId: peerId
        }
      });
    };

    VegaClient.prototype.hangUp = function() {
      return VegaClient.send(this.websocket, {
        type: 'hangUp',
        payload: {}
      });
    };

    return VegaClient;

  })();

}).call(this);

},{}],3:[function(require,module,exports){
module.exports = require('./vega-observatory.js')

},{"./vega-observatory.js":7}],4:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var PeerConnectionFactory;

  PeerConnectionFactory = (function() {
    function PeerConnectionFactory() {}

    PeerConnectionFactory.create = function(observatory, peer, config, pcConstructor) {
      var localStream, peerConnection, peerId;
      if (pcConstructor == null) {
        pcConstructor = RTCPeerConnection;
      }
      console.debug(pcConstructor);
      peerConnection = new pcConstructor(config);
      localStream = observatory.localStream;
      peerId = peer.peerId;
      peerConnection.addStream(localStream);
      peerConnection.onicecandidate = function(event) {
        var candidate;
        if (candidate = event.candidate) {
          return observatory.sendCandidate(candidate, peerId);
        }
      };
      peerConnection.onaddstream = function(event) {
        return observatory.addStream(peerId, event.stream);
      };
      return peerConnection;
    };

    return PeerConnectionFactory;

  })();

  module.exports = PeerConnectionFactory;

}).call(this);

},{}],5:[function(require,module,exports){
(function (global){
// Generated by CoffeeScript 1.7.1
(function() {
  var PeerStore;

  PeerStore = (function() {
    PeerStore.prototype.callbacks = {};

    PeerStore.prototype.peers = [];

    function PeerStore(options) {
      var _ref;
      this.options = options;
      this.URL = ((_ref = this.options) != null ? _ref.URL : void 0) || global.URL;
    }

    PeerStore.prototype.add = function(peer) {
      this.peers.push(peer);
      return this.trigger('add', peer);
    };

    PeerStore.prototype.addStream = function(peerId, stream) {
      var peer;
      peer = void 0;
      this.peers.forEach(function(p) {
        if (p.peerId === peerId) {
          return peer = p;
        }
      });
      peer.stream = stream;
      peer.streamUrl = this.URL.createObjectURL(stream);
      return this.trigger('streamAdded', peer);
    };

    PeerStore.prototype.remove = function(peerId) {
      var peers, removedPeer;
      removedPeer = void 0;
      peers = [];
      this.peers.forEach(function(peer) {
        if (peer.peerId === peerId) {
          return removedPeer = peer;
        } else {
          return peers.push(peer);
        }
      });
      this.peers = peers;
      return this.trigger('remove', removedPeer);
    };

    PeerStore.prototype.find = function(peerId) {
      var peer;
      peer = void 0;
      this.peers.forEach(function(p) {
        if (p.peerId === peerId) {
          return peer = p;
        }
      });
      return peer;
    };

    PeerStore.prototype.peersWithStreams = function() {
      var peersWithStreams;
      peersWithStreams = [];
      this.peers.forEach((function(_this) {
        return function(peer) {
          if (_this._hasStream(peer)) {
            return peersWithStreams.push(peer);
          }
        };
      })(this));
      return peersWithStreams;
    };

    PeerStore.prototype.peersWithoutStreams = function() {
      var peersWithoutStreams;
      peersWithoutStreams = [];
      this.peers.forEach((function(_this) {
        return function(peer) {
          if (!_this._hasStream(peer)) {
            return peersWithoutStreams.push(peer);
          }
        };
      })(this));
      return peersWithoutStreams;
    };

    PeerStore.prototype.on = function(event, callback) {
      var _base;
      (_base = this.callbacks)[event] || (_base[event] = []);
      return this.callbacks[event].push(callback);
    };

    PeerStore.prototype.trigger = function(event) {
      var args, callbacks;
      args = Array.prototype.slice.call(arguments, 1);
      if (callbacks = this.callbacks[event]) {
        return callbacks.forEach(function(callback) {
          return callback.apply(this, args);
        });
      }
    };

    PeerStore.prototype._hasStream = function(peer) {
      return !!peer.stream;
    };

    return PeerStore;

  })();

  module.exports = PeerStore;

}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var SessionDescriptionCreator,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SessionDescriptionCreator = (function() {
    SessionDescriptionCreator.forOffer = function(observatory, peerId, peerConnection) {
      var creator;
      creator = new SessionDescriptionCreator(observatory, peerId, peerConnection);
      return creator.forOffer();
    };

    SessionDescriptionCreator.forAnswer = function(observatory, peerId, peerConnection) {
      var creator;
      creator = new SessionDescriptionCreator(observatory, peerId, peerConnection);
      return creator.forAnswer();
    };

    function SessionDescriptionCreator(observatory, peerId, peerConnection) {
      this.observatory = observatory;
      this.peerId = peerId;
      this.peerConnection = peerConnection;
      this.sendAnswer = __bind(this.sendAnswer, this);
      this.sendOffer = __bind(this.sendOffer, this);
    }

    SessionDescriptionCreator.prototype.forOffer = function() {
      return this.peerConnection.createOffer(this.successCallback(this.sendOffer), this.failureCallback);
    };

    SessionDescriptionCreator.prototype.forAnswer = function() {
      return this.peerConnection.createAnswer(this.successCallback(this.sendAnswer), this.failureCallback);
    };

    SessionDescriptionCreator.prototype.successCallback = function(onLocalDescriptionSuccess) {
      return (function(_this) {
        return function(description) {
          return _this.peerConnection.setLocalDescription(description, onLocalDescriptionSuccess, _this.failureCallback);
        };
      })(this);
    };

    SessionDescriptionCreator.prototype.failureCallback = function(error) {
      return console.error(error);
    };

    SessionDescriptionCreator.prototype.sendOffer = function() {
      return this.observatory.sendOffer(this.peerConnection.localDescription, this.peerId);
    };

    SessionDescriptionCreator.prototype.sendAnswer = function() {
      return this.observatory.sendAnswer(this.peerConnection.localDescription, this.peerId);
    };

    return SessionDescriptionCreator;

  })();

  module.exports = SessionDescriptionCreator;

}).call(this);

},{}],7:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var PeerConnectionFactory, PeerStore, SessionDescriptionCreator, VegaClient, VegaObservatory, WebRTCInterop;

  VegaClient = require('../vega-client');

  PeerConnectionFactory = require('./private/peer-connection-factory');

  SessionDescriptionCreator = require('./private/session-description-creator');

  PeerStore = require('./private/peer-store');

  WebRTCInterop = require('../webrtc-interop/webrtc-interop.js');

  VegaObservatory = (function() {
    function VegaObservatory(options) {
      this.options = options;
      this.vegaClient = new VegaClient(this.options.url, this.options.roomId, this.options.badge);
      this.peerConnectionFactory = this.options.peerConnectionFactory || PeerConnectionFactory;
      this.sessionDescriptionCreator = this.options.sessionDescriptionCreator || SessionDescriptionCreator;
      this.webRTCInterop = this.options.webRTCInterop || WebRTCInterop;
      this.callbacks = {};
      this.peerStore = this.options.peerStore || new PeerStore;
      this.localStream = this.options.localStream;
      this.webRTCInterop.infectGlobal();
      this._setClientCallbacks();
    }

    VegaObservatory.prototype.call = function() {
      return this.vegaClient.call();
    };

    VegaObservatory.prototype.sendOffer = function(offer, peerId) {
      return this.vegaClient.offer(offer, peerId);
    };

    VegaObservatory.prototype.sendAnswer = function(answer, peerId) {
      return this.vegaClient.answer(answer, peerId);
    };

    VegaObservatory.prototype.sendCandidate = function(candidate, peerId) {
      return this.vegaClient.candidate(candidate, peerId);
    };

    VegaObservatory.prototype.hangUp = function() {
      return this.vegaClient.hangUp();
    };

    VegaObservatory.prototype.createOffer = function(peerId) {
      var peerConnection;
      peerConnection = this._peerConnection(peerId);
      return this.sessionDescriptionCreator.forOffer(this, peerId, peerConnection);
    };

    VegaObservatory.prototype.createAnswer = function(peerId) {
      var peerConnection;
      peerConnection = this._peerConnection(peerId);
      return this.sessionDescriptionCreator.forAnswer(this, peerId, peerConnection);
    };

    VegaObservatory.prototype.onStreamAdded = function(f) {
      return this.peerStore.on('streamAdded', f);
    };

    VegaObservatory.prototype.onPeerRemoved = function(f) {
      return this.peerStore.on('remove', f);
    };

    VegaObservatory.prototype.addStream = function(peerId, stream) {
      return this.peerStore.addStream(peerId, stream);
    };

    VegaObservatory.prototype._setClientCallbacks = function() {
      this.vegaClient.on('callAccepted', (function(_this) {
        return function(payload) {
          return _this._handleCallAccepted(payload);
        };
      })(this));
      this.vegaClient.on('offer', (function(_this) {
        return function(payload) {
          return _this._handleOffer(payload);
        };
      })(this));
      this.vegaClient.on('answer', (function(_this) {
        return function(payload) {
          return _this._handleAnswer(payload);
        };
      })(this));
      this.vegaClient.on('candidate', (function(_this) {
        return function(payload) {
          return _this._handleCandidate(payload);
        };
      })(this));
      return this.vegaClient.on('peerHangUp', (function(_this) {
        return function(payload) {
          return _this._handlePeerHangUp(payload);
        };
      })(this));
    };

    VegaObservatory.prototype._handleCallAccepted = function(payload) {
      var peers;
      peers = payload.peers;
      peers.forEach((function(_this) {
        return function(peer) {
          return _this._addPeerToStore(peer);
        };
      })(this));
      return this.trigger('callAccepted', peers);
    };

    VegaObservatory.prototype._handleOffer = function(payload) {
      var peerConnection;
      peerConnection = this._addPeerToStore(payload);
      return this._handleSessionDescription(peerConnection, 'offer', payload);
    };

    VegaObservatory.prototype._handleAnswer = function(payload) {
      var peerConnection;
      peerConnection = this._peerConnection(payload.peerId);
      return this._handleSessionDescription(peerConnection, 'answer', payload);
    };

    VegaObservatory.prototype._handleSessionDescription = function(peerConnection, descriptionType, payload) {
      var sessionDescription;
      sessionDescription = new RTCSessionDescription(payload[descriptionType]);
      peerConnection.setRemoteDescription(sessionDescription);
      return this.trigger(descriptionType, payload);
    };

    VegaObservatory.prototype._handleCandidate = function(payload) {
      var iceCandidate, peerConnection;
      peerConnection = this._peerConnection(payload.peerId);
      iceCandidate = new RTCIceCandidate(payload.candidate);
      peerConnection.addIceCandidate(iceCandidate);
      return this.trigger('candidate', payload);
    };

    VegaObservatory.prototype._handlePeerHangUp = function(payload) {
      this.trigger('peerHangUp', payload);
      return this.peerStore.remove(payload.peerId);
    };

    VegaObservatory.prototype._addPeerToStore = function(peer) {
      var peerConnection;
      peerConnection = this.peerConnectionFactory.create(this, peer, this.options.peerConnectionConfig);
      peer.peerConnection = peerConnection;
      this.peerStore.add(peer);
      return peerConnection;
    };

    VegaObservatory.prototype._peerConnection = function(peerId) {
      return this._findPeer(peerId).peerConnection;
    };

    VegaObservatory.prototype._findPeer = function(peerId) {
      return this.peerStore.find(peerId);
    };

    VegaObservatory.prototype.on = function(event, callback) {
      var _base;
      (_base = this.callbacks)[event] || (_base[event] = []);
      return this.callbacks[event].push(callback);
    };

    VegaObservatory.prototype.trigger = function(event) {
      var args, callbacks;
      args = Array.prototype.slice.call(arguments, 1);
      if (callbacks = this.callbacks[event]) {
        return callbacks.forEach((function(_this) {
          return function(callback) {
            return callback.apply(_this, args);
          };
        })(this));
      }
    };

    return VegaObservatory;

  })();

  module.exports = VegaObservatory;

}).call(this);

},{"../vega-client":1,"../webrtc-interop/webrtc-interop.js":11,"./private/peer-connection-factory":4,"./private/peer-store":5,"./private/session-description-creator":6}],8:[function(require,module,exports){
(function (global){
global.VegaPrime = require('./index.js')

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./index.js":9}],9:[function(require,module,exports){
module.exports = require('./vega-prime.js')

},{"./vega-prime.js":10}],10:[function(require,module,exports){
// Generated by CoffeeScript 1.7.1
(function() {
  var VegaObservatory, VegaPrime;

  VegaObservatory = require('../vega-observatory');

  VegaPrime = (function() {
    function VegaPrime(options) {
      this.options = options;
      this.observatory = this.options.observatory || new VegaObservatory({
        url: this.options.url,
        roomId: this.options.roomId,
        badge: this.options.badge,
        localStream: this.options.localStream,
        peerConnectionConfig: this.options.peerConnectionConfig
      });
      this.getUserMediaPromise = this.options.getUserMediaPromise;
      this.callbacks = {};
      this._setObservatoryCallbacks();
    }

    VegaPrime.prototype.init = function() {
      this.getUserMediaPromise.done(this.getUserMediaPromiseDone);
      return this.observatory.call();
    };

    VegaPrime.prototype.onStreamAdded = function(f) {
      this.observatory.onStreamAdded(f);
      return this;
    };

    VegaPrime.prototype.onPeerRemoved = function(f) {
      this.observatory.onPeerRemoved(f);
      return this;
    };

    VegaPrime.prototype.onLocalStreamReceived = function(f) {
      this.on('localStreamReceived', f);
      return this;
    };

    VegaPrime.prototype._setObservatoryCallbacks = function() {
      this.observatory.on('callAccepted', (function(_this) {
        return function(peers) {
          return peers.forEach(function(peer) {
            return _this.observatory.createOffer(peer.peerId);
          });
        };
      })(this));
      return this.observatory.on('offer', (function(_this) {
        return function(payload) {
          return _this.observatory.createAnswer(payload.peerId);
        };
      })(this));
    };

    VegaPrime.prototype.on = function(event, callback) {
      var _base;
      (_base = this.callbacks)[event] || (_base[event] = []);
      return this.callbacks[event].push(callback);
    };

    VegaPrime.prototype.trigger = function(event) {
      var args, callbacks;
      args = Array.prototype.slice.call(arguments, 1);
      if (callbacks = this.callbacks[event]) {
        return callbacks.forEach(function(callback) {
          return callback.apply(this, args);
        });
      }
    };

    return VegaPrime;

  })();

  module.exports = VegaPrime;

}).call(this);

},{"../vega-observatory":3}],11:[function(require,module,exports){
(function (global){
// Generated by CoffeeScript 1.7.1
(function() {
  var WebRTCInterop;

  WebRTCInterop = (function() {
    function WebRTCInterop() {}

    WebRTCInterop.infectGlobal = function() {
      var _ref, _ref1, _ref2, _ref3;
      global.RTCPeerConnection = (_ref = (_ref1 = global.RTCPeerConnection) != null ? _ref1 : global.webkitRTCPeerConnection) != null ? _ref : global.mozRTCPeerConnection;
      global.RTCSessionDescription = (_ref2 = global.RTCSessionDescription) != null ? _ref2 : global.mozRTCSessionDescription;
      return global.RTCIceCandidate = (_ref3 = global.RTCIceCandidate) != null ? _ref3 : global.mozRTCIceCandidate;
    };

    return WebRTCInterop;

  })();

  module.exports = WebRTCInterop;

}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[8]);
