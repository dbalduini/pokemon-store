const Joi = require('joi')
const httpStatus = require('./httpStatus')

const isUniqueConstraint = err => err === 'SequelizeUniqueConstraintError'

const createPokemonSchema = Joi.object().keys({
  name: Joi.string().alphanum().required(),
  price: Joi.number().integer().min(1).required(),
  stock: Joi.number().integer()
})

const updatePokemonSchema = Joi.object().keys({
  price: Joi.number().integer().min(1),
  stock: Joi.number().integer()
}).or('price', 'stock')

const buyPokemonsSchema = Joi.object().keys({
  name: Joi.string().alphanum().required(),
  quantity: Joi.number().integer().min(1).max(99).required()
})

function PokemonController (model, service) {
  this.router = buildRouter(model, service)
}

function buildRouter (model, service) {
  var router = {}

  router.getPokemons = function (req, res) {
    model.findAll().then(pokemons => res.json(pokemons))
  }

  router.createPokemons = function (req, res) {
    var errors = validateResquestBody(req.body, createPokemonSchema)
    if (errors) {
      return respondBadRequestWithErrors(res, errors)
    }

    model
      .create(req.body)
      .then(function (pokemon) {
        res.status(httpStatus.CREATED).json(pokemon)
      })
      .catch(function (err) {
        if (isUniqueConstraint(err.name)) {
          return res.sendStatus(httpStatus.CONFLICT)
        }
        console.error(err)
        res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
      })
  }

  router.updatePokemons = function (req, res) {
    var errors = validateResquestBody(req.body, updatePokemonSchema)
    if (errors) {
      return respondBadRequestWithErrors(res, errors)
    }

    model
      .findOne({ where: { name: req.params.name } })
      .then(function (pokemon) {
        if (!pokemon) {
          return res.sendStatus(httpStatus.NOT_FOUND)
        }
        // Will update all fields
        return pokemon.update(req.body).then(function (pokemon) {
          res.status(httpStatus.OK).json(pokemon)
        })
      })
      .catch(function (err) {
        console.error(err)
        res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
      })
  }

  router.removePokemons = function (req, res) {
    model
      .destroy({ where: { name: req.params.name } })
      .then(function (n) {
        if (n <= 0) {
          return res.sendStatus(httpStatus.NOT_FOUND)
        }
        res.status(httpStatus.OK).json({deleted: n})
      })
      .catch(function (err) {
        console.error(err)
        res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
      })
  }

  router.buyPokemons = function (req, res) {
    var errors = validateResquestBody(req.body, buyPokemonsSchema)
    if (errors) {
      return respondBadRequestWithErrors(res, errors)
    }

    model
      .findOne({ where: { name: req.body.name } })
      .then(function (pokemon) {
        if (!pokemon) {
          return res.sendStatus(httpStatus.NOT_FOUND)
        }

        const quantity = req.body.quantity

        if (pokemon.stock < quantity) {
          errors = [
            `Not enought ${pokemon.name} in stock: ${pokemon.stock}`
          ]
          return respondBadRequestWithErrors(res, errors)
        }

        const updateStock = function (paid) {
          if (paid) {
            console.log('[TRANSACTION] UPDATE_STOCK', JSON.stringify(pokemon))
            pokemon.stock = pokemon.stock - quantity
            pokemon
              .save()
              .then(function (pokemon) {
                console.log('[TRANSACTION] SUCCESS', JSON.stringify(pokemon))
                res.status(httpStatus.OK).json(pokemon)
              })
              .catch(function (err) {
                console.error(err)
                console.log('[TRANSACTION] FAILED', JSON.stringify(pokemon))
                // The transaction was already processed by the service.
                // The stock will be updated later by another process.
                res.status(httpStatus.ACCEPTED).json(pokemon)
              })
          } else {
            console.log('[TRANSACTION] FORBIDDEN')
            res.sendStatus(httpStatus.FORBIDDEN)
          }
        }

        return service.buyPokemon(pokemon, quantity).then(updateStock)
      })
      .catch(function (err) {
        console.error(err)
        res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR)
      })
  }

  return router
}

/**
 * @param body - The request body
 * @param schema - The Joi validation schema
 * @return The validation errors or undefined
 */
function validateResquestBody (body, schema) {
  const result = Joi.validate(body, schema)

  if (result.error) {
    return result.error.details.map(d => d.message)
  }
}

/**
 * @param res - The response
 * @param errors - The list of erros
 */
function respondBadRequestWithErrors (res, errors) {
  res.status(httpStatus.BAD_REQUEST).json({errors: errors})
}

module.exports = PokemonController
