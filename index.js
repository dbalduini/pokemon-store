const config = getEnvVarsOrExitProcess()
const Sequelize = require('sequelize')
const ROOT_PATH = './src'
const HOST_PORT = 3000
const server = require(ROOT_PATH + '/server')

// Create the connection
const sequelize = new Sequelize('pokemons', null, null, {
  dialect: 'sqlite'
})

// Test the connection and start the server if it can be estabilished,
// otherwise exit the process.
sequelize
.authenticate()
.then(startServer)
.catch(function (err) {
  console.error('Unable to connect to the database:', err)
  process.exit(1)
})

function getEnvVarsOrExitProcess () {
  var envVars = {}
  // Validate env vars
  if (!process.env.PAGARME_API_KEY) {
    console.log('Enviroment variable PAGARME_API_KEY was not set.')
    process.exit(1)
  }
  envVars.PAGARME_API_KEY = process.env.PAGARME_API_KEY
  return envVars
}

function startServer () {
  console.log('Connection has been established successfully.')

  // Load models
  const models = {
    Pokemon: require(ROOT_PATH + '/models/Pokemon')(sequelize)
  }

  // Load services
  const PokemonService = require(ROOT_PATH + '/services/pokemon')
  const services = {
    Pokemon: new PokemonService(config.PAGARME_API_KEY)
  }

  const app = server.app(models, services)

  // Don't syncronize models if this is a production env
  if (app.get('env') !== 'production') {
    Object.keys(models).forEach(function (k) {
      models[k].sync({force: true}).then(function () {
        console.log('Model' + k + ' is ready!')
      })
    })
  }

  // Start the server
  app.listen(HOST_PORT, function () {
    console.log('Server listening on port:', HOST_PORT)
  })
}
