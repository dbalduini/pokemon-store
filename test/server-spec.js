/* eslint-env mocha */
const request = require('supertest')
const sinon = require('sinon')
const server = require('../src/server')

describe('Server - Pokemon Routes', function () {
  var app
  var sandbox
  var models
  var services
  var originals

  before(function () {
    sandbox = sinon.sandbox.create()

    models = {
      Pokemon: {
        findAll: sandbox.stub(),
        findOne: sandbox.stub(),
        create: sandbox.stub(),
        destroy: sandbox.stub()
      }
    }

    services = {
      Pokemon: {
        buyPokemon: sandbox.stub(),
        createCreditCardRequest: sandbox.stub()
      }
    }

    originals = {
      PAGARME_API_KEY: process.env.PAGARME_API_KEY
    }

    process.env.PAGARME_API_KEY = '1234'
    sandbox.stub(console, 'error')

    app = server.app(models, services)
  })

  afterEach(function () {
    sandbox.resetBehavior()
  })

  after(function () {
    sandbox.restore()
    process.env.PAGARME_API_KEY = originals.PAGARME_API_KEY
  })

  describe('GET /pokemons', function () {
    it('respond with json', function (done) {
      models.Pokemon.findAll.resolves([])
      request(app)
        .get('/pokemons')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
    })
  })

  describe('PUT /pokemons', function () {
    it('respond with status code 201', function (done) {
      models.Pokemon.create.resolves()
      request(app)
        .put('/pokemons')
        .send({ name: 'Charmander', price: 10 })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201, done)
    })

    it('respond with status code 400', function (done) {
      models.Pokemon.create.resolves()
      request(app)
        .put('/pokemons')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400, done)
    })

    it('respond with status code 500', function (done) {
      models.Pokemon.create.rejects()
      request(app)
        .put('/pokemons')
        .send({ name: 'Charmander', price: 10 })
        .set('Accept', 'application/json')
        .expect(500, done)
    })

    it('respond with status code 409', function (done) {
      const err = {name: 'SequelizeUniqueConstraintError'}
      models.Pokemon.create.rejects(err)
      request(app)
        .put('/pokemons')
        .send({ name: 'Charmander', price: 10 })
        .set('Accept', 'application/json')
        .expect(409, done)
    })
  })

  describe('DELETE /pokemons/pikachu', function () {
    it('respond with status code 200', function (done) {
      models.Pokemon.destroy.resolves(1)
      request(app)
        .delete('/pokemons/pikachu')
        .expect('Content-Type', /json/)
        .expect(200, done)
    })

    it('respond with status code 404', function (done) {
      models.Pokemon.destroy.resolves(0)
      request(app)
        .delete('/pokemons/pikachu')
        .set('Accept', 'application/json')
        .expect(404, done)
    })

    it('respond with status code 500', function (done) {
      models.Pokemon.destroy.rejects()
      request(app)
        .delete('/pokemons/pikachu')
        .set('Accept', 'application/json')
        .expect(500, done)
    })
  })

  describe('POST /pokemons/pikachu', function () {
    var pokemon

    before(function () {
      pokemon = {
        name: 'Pikachu',
        price: 20,
        update: sandbox.stub()
      }
    })

    beforeEach(function () {
      pokemon.stock = 4
    })

    it('respond with status code 200', function (done) {
      models.Pokemon.findOne.resolves(pokemon)
      pokemon.update.resolves()
      request(app)
        .post('/pokemons/pikachu')
        .send({ stock: 100 })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
    })

    it('respond with status code 400', function (done) {
      request(app)
        .post('/pokemons/pikachu')
        .set('Accept', 'application/json')
        .expect(400, done)
    })

    it('respond with status code 404', function (done) {
      models.Pokemon.findOne.resolves()
      request(app)
        .post('/pokemons/pikachu')
        .send({ price: 10 })
        .set('Accept', 'application/json')
        .expect(404, done)
    })

    it('respond with status code 500', function (done) {
      models.Pokemon.findOne.resolves(pokemon)
      pokemon.update.rejects()
      request(app)
        .post('/pokemons/pikachu')
        .send({ price: 10 })
        .set('Accept', 'application/json')
        .expect(500, done)
    })
  })

  describe('POST /orders/pokemon', function () {
    var pokemon

    before(function () {
      pokemon = {
        name: 'Pikachu',
        price: 20,
        save: sandbox.stub()
      }
    })

    beforeEach(function () {
      pokemon.stock = 4
    })

    it('respond with status code 200', function (done) {
      const expected = {
        name: pokemon.name,
        price: 20,
        stock: 0
      }
      models.Pokemon.findOne.resolves(pokemon)
      services.Pokemon.buyPokemon.resolves(true)
      pokemon.save.resolves(expected)
      request(app)
        .post('/orders/pokemon')
        .send({ name: pokemon.name, quantity: 4 })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(expected)
        .expect(200, done)
    })

    it('respond with status code 400 if req params are invalid', function (done) {
      request(app)
        .post('/orders/pokemon')
        .set('Accept', 'application/json')
        .expect(400, done)
    })

    it('respond with status code 400 if stock < quantity', function (done) {
      models.Pokemon.findOne.resolves(pokemon)
      request(app)
        .post('/orders/pokemon')
        .send({ name: pokemon.name, quantity: 5 })
        .set('Accept', 'application/json')
        .expect(400, done)
    })

    it('respond with status code 403', function (done) {
      models.Pokemon.findOne.resolves(pokemon)
      services.Pokemon.buyPokemon.resolves(false)
      request(app)
        .post('/orders/pokemon')
        .send({ name: pokemon.name, quantity: 2 })
        .set('Accept', 'application/json')
        .expect(403, done)
    })

    it('respond with status code 404', function (done) {
      models.Pokemon.findOne.resolves()
      request(app)
        .post('/orders/pokemon')
        .send({ name: pokemon.name, quantity: 2 })
        .set('Accept', 'application/json')
        .expect(404, done)
    })

    it('respond with status code 500', function (done) {
      models.Pokemon.findOne.resolves(pokemon)
      services.Pokemon.buyPokemon.rejects()
      request(app)
        .post('/orders/pokemon')
        .send({ name: pokemon.name, quantity: 2 })
        .set('Accept', 'application/json')
        .expect(500, done)
    })

    it('respond with status code 202', function (done) {
      models.Pokemon.findOne.resolves(pokemon)
      services.Pokemon.buyPokemon.resolves(true)
      pokemon.save.rejects()
      request(app)
        .post('/orders/pokemon')
        .send({ name: pokemon.name, quantity: 4 })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(202, done)
    })
  })
})
