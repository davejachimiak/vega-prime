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
      this.callbacks = {};
      this._setObservatoryCallbacks();
    }

    VegaPrime.prototype.init = function() {
      return this.observatory.call();
    };

    VegaPrime.prototype.onStreamAdded = function(f) {
      this.observatory.onStreamAdded(f);
      return this;
    };

    VegaPrime.prototype.onPeerRemoved = function(f) {
      return this.observatory.onPeerRemoved(f);
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
