const bodyParser = require('body-parser')
const morgan = require('morgan')
const express = require('express')
const PokemonController = require('./controllers/pokemon')

/**
 * @param {object} models - Injected object of models
 * @param {object} services - Injected object of services
 * @return app - The express app object
 */
exports.app = function (models, services) {
  const app = express()

  // Middlewares
  app.use(bodyParser.json())
  if (app.get('env') !== 'test') {
    app.use(morgan('dev'))
  }

  // Routes
  const pc = new PokemonController(models.Pokemon, services.Pokemon)
  app.get('/pokemons', pc.router.getPokemons)
  app.put('/pokemons', pc.router.createPokemons)
  app.post('/pokemons/:name', pc.router.updatePokemons)
  app.delete('/pokemons/:name', pc.router.removePokemons)
  app.post('/orders/pokemon', pc.router.buyPokemons)

  return app
}
