'use strict'

const debug = require('debug')('pardsrl:api')
const chalk = require('chalk')
const PardAgent = require('pardsrl-agent')
const { mqttHost } = require('./config')

const agent = new PardAgent({
  mqtt: {
    host: mqttHost
  }
})

let _io = null
let _wsInstances = new Map()

agent.on('connected', () => {
  debug(chalk.green(`agent connected`))
})

/**
 * Read agent/message events
 */
agent.on('agent/message', (payload) => {
  debug(chalk.green(`agent/message received`))
  if (payload && payload.agent) {
    let { uuid } = payload.agent

    if (!_wsInstances.has(uuid)) {
      _wsInstances.set(uuid, _io.of(uuid))
    }
    _wsInstances.get(uuid).emit('agent/message', payload)
  }
})

/**
 * Read agent/disconnected events
 */
agent.on('agent/disconnected', (payload) => {
  debug(chalk.green(`agent/disconnected received`))
  if (payload && payload.agent) {
    let { uuid } = payload.agent

    if (_wsInstances.has(uuid)) {
      _wsInstances.delete(uuid)
    }
  }
})

function connect (io) {
  _io = io
  agent.connect()
}

module.exports = {
  connect
}
