/* eslint-env mocha */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const PokemonService = require('../../src/services/pokemon')

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Pokemon Service Integration', function () {
  var apiKey, pokemon

  before(function () {
    pokemon = {
      name: 'pikachu',
      price: 10
    }
    apiKey = process.env.PAGARME_API_KEY
  })

  describe('buyPokemon', function () {
    it('should resolve with transaction paid', function () {
      expect(apiKey).to.be.defined
      this.timeout(1000 * 5)
      var ps = new PokemonService(apiKey)
      var p = ps.buyPokemon(pokemon, 2)
      return expect(p).to.eventually.be.true
    })

    it('should return 401 Forbidden for invalid API KEYs', function () {
      var ps = new PokemonService('abc123')
      var p = ps.buyPokemon(pokemon, 1)
      return expect(p).to.eventually.be.rejected
    })
  })
})
