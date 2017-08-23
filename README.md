# pokemon-store

[![Build Status](https://travis-ci.org/dbalduini/pokemon-store.svg?branch=master)](https://travis-ci.org/dbalduini/pokemon-store)

**pokemon-store** is a Restfull API with CRUD operations on pokemons. 

Its main functionality is to test the purchase of pokemons through the integration with a credit-card transaction API. The name of the platform is hidden on purpose (_avoid spoilers_).

## Configuration
This project uses [EditorConfig](http://editorconfig.org/) and follows [JavaScript Standard Style](https://standardjs.com) guidelines to maintain consistent coding styles.

The *standardjs* needs to be installed as a global dependency.

**JavaScript Standard Style**
```
 npm install standard --global
```

## Environments

The `PAGARME_API_KEY` env var is required for all environments (test, dev and prod).

```sh
export PAGARME_API_KEY=<YOUR_API_KEY>
```

### Production

On production, the following command should be used to start the app:

```sh
NODE_ENV=production node index.js
```

## Routes

Overview

| Method  	|  Endpoint 			| Description |
|---			|---						|---
|  GET 		|  /pokemons			| Retrieves a list of all stored pokemons |
|  PUT 		|  /pokemons 			| Create new Pokemons |
|  POST 		|  /pokemons/:name 	| Update a Pokemon |
|  DELETE 	|  /pokemons/:name	| Delete a Pokemon |
|  POST 		|  /orders/pokemon 	| Buy the given quantity Pokemons if available on stock |

### Payload Examples

PUT /pokemons
```json
{
 "name": "pikachu",
 "price": 10,
 "stock": 5
}
```

POST /pokemons/pikachu
```json
{
 "price": 7,
 "stock": 2000
}
```

POST /orders/pokemon
```json
{
  "name": "pikachu",
  "quantity":3
}
```

---------------------------
