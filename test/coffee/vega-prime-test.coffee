chai      = require('chai')
sinon     = require('sinon')
sinonChai = require('sinon-chai')
expect    = chai.expect

chai.use sinonChai

VegaPrime = require('../vega-prime')

class MockObservatory
  callbacks: {}

  on: (event, callback)->
    @callbacks[event] ||= []
    @callbacks[event].push callback

  trigger: (event) ->
    args = Array.prototype.slice.call(arguments, 1)

    if callbacks = @callbacks[event]
      callbacks.forEach (callback) ->
        callback.apply(this, args)

  call: ->
  createOffer: ->
  createAnswer: ->
  onStreamAdded: ->
  onPeerRemoved: ->

describe 'vega-prime', ->
  beforeEach ->
    @url = 'ws://0.0.0.0:3000'
    @roomId = '/abc123'
    @badge = { name: 'Dave' }
    @observatory = new MockObservatory
    @getUserMediaPromise = create: ->

    options =
      url: @url
      roomId: @roomId
      badge: @badge
      observatory: @observatory
      getUserMediaPromise: @getUserMediaPromise

    @vegaPrime = new VegaPrime options

  afterEach ->
    sinon.collection.restore()

  describe '#init', ->
    beforeEach ->
      sinon.collection.stub(@getUserMediaPromise, 'create').
        returns @promise =
          done: ->
          reject: ->

    it 'calls done on the getUserMedia promise', ->
      done = sinon.collection.stub @promise, 'done'

      @vegaPrime.init()

      expect(done).to.have.been.calledWith @vegaPrime.getUserMediaPromiseDone

    it 'calls reject on the getUserMedia promise', ->
      reject = sinon.collection.stub @promise, 'reject'

      @vegaPrime.init()

      expect(reject).to.have.been.calledWith @vegaPrime.getUserMediaPromiseReject

  describe '#getUserMediaPromiseDone', ->
    beforeEach ->
      @stream  = new Object
      @call    = sinon.collection.stub @observatory, 'call'
      @trigger = sinon.collection.stub @vegaPrime, 'trigger'
      sinon.collection.stub(@vegaPrime, '_wrappedStream').
        withArgs(@stream).
        returns @wrappedStream = new Object

    it 'has the observatory make a call with the local stream', ->
      @vegaPrime.getUserMediaPromiseDone(@stream)

      expect(@call).to.have.been.calledWith @stream

    it 'triggers localStreamReceived with a wrapped stream', ->
      @vegaPrime.getUserMediaPromiseDone(@stream)

      expect(@trigger).to.have.been.calledWith 'localStreamReceived', @wrappedStream

  describe '#onStreamAdded', ->
    it 'delegates to the observatory', ->
      onStreamAdded = sinon.collection.stub @observatory, 'onStreamAdded'
      arg = ->

      @vegaPrime.onStreamAdded(arg)

      expect(onStreamAdded).to.have.been.calledWith(arg)

    it 'returns vega prime', ->
      returnVal = @vegaPrime.onStreamAdded(->)

      expect(returnVal).to.eq @vegaPrime

  describe '#onPeerRemoved', ->
    it 'delegates to the observatory', ->
      onPeerRemoved = sinon.collection.stub @observatory, 'onPeerRemoved'
      arg = ->

      @vegaPrime.onPeerRemoved(arg)

      expect(onPeerRemoved).to.have.been.calledWith(arg)

    it 'returns vega prime', ->
      returnVal = @vegaPrime.onPeerRemoved(->)

      expect(returnVal).to.eq @vegaPrime

  describe '#onLocalStreamReceived', ->
    it 'saves a callback for when a local stream is received', ->
      stream = new Object
      callback = (stream) =>
        @theStream = stream

      @vegaPrime.onLocalStreamReceived(callback)
      @vegaPrime.trigger 'localStreamReceived', stream

      expect(@theStream).to.eq stream

    it 'returns the vega prime', ->
      returnVal = @vegaPrime.onLocalStreamReceived(->)

      expect(returnVal).to.eq @vegaPrime

  describe 'observatory callbacks', ->
    beforeEach ->
      @peer1 = { peerId: 'peerId1' }
      peer2 = { peerId: 'peerId2' }
      @peers = [@peer1, peer2]

    it 'creates an offer for all peers in the payload', ->
      createOffer = sinon.collection.spy @observatory, 'createOffer'

      @observatory.trigger 'callAccepted', @peers

      @peers.forEach (peer) =>
        expect(createOffer).to.have.been.calledWith peer.peerId

    it 'creates an answer for an offering peer', ->
      createAnswer = sinon.collection.spy @observatory, 'createAnswer'

      @observatory.trigger 'offer', @peer1

      expect(createAnswer).to.have.been.calledWith @peer1.peerId
