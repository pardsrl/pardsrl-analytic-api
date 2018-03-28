'use strict'

const debug = require('debug')('pardsrl:api')
const http = require('http')
const chalk = require('chalk')
const express = require('express')
const socketio = require('socket.io')
const helmet = require('helmet')
const cors = require('cors')
const compression = require('compression')

const api = require('./api')
const ws = require('./ws')

const port = process.env.PORT || 3000
const app = express()

const server = http.createServer(app)
const io = socketio(server)

// connect to mqtt server and start websockets transmision
ws.connect(io)

// enable helmet, cors and compression middlewares!
app.use(helmet())
app.use(cors())
app.use(compression())
app.use('/', api)

// Express Error Handler
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }

  res.status(500).send({ error: err.message })
})

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  console.log(`${chalk.green('[pardsrl-api]')} server listening on port ${port}`)
})

module.exports = server
