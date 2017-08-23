const request = require('request-promise')

const amount = (price, quantity) => realToCentavos(price) * quantity
const realToCentavos = real => real * 100

function PokemonService (apiKey) {
  this.apiKey = apiKey
  this.apiUrl = 'https://api.pagar.me'
  this.transactionAPIUrl = this.apiUrl + '/1/transactions'
}

/**
 * Calls the pagar.me transactions api to buy pokemons.
 * @params {object} pokemon -The pokemon model
 * @params {number} quantity - The quantity of pokemons to buy
 * @return {Promise.<boolean>} - True if the transaction was paid sucessfully
 */
PokemonService.prototype.buyPokemon = function (pokemon, quantity) {
  const options = {
    uri: this.transactionAPIUrl,
    method: 'POST',
    json: {
      api_key: this.apiKey,
      amount: amount(pokemon.price, quantity),
      payment_method: 'credit_card',
      card_number: '4024007138010896',
      card_expiration_date: '1050',
      card_holder_name: 'Ash Ketchum',
      card_cvv: '123',
      metadata: {
        product: 'pokemon',
        name: pokemon.name,
        quantity: quantity
      }
    }
  }

  return request(options).then(isPaid)
}

function isPaid (body) {
  const paid = body.status === 'paid'
  console.log(`[TRANSACTION] buyPokemon {"id":${body.id},"paid":${paid}}`)
  return paid
}

module.exports = PokemonService
