'use strict'

const debug = require('debug')('pardsrl:api:routes')
const express = require('express')
const request = require('request')
const moment = require('moment-timezone')

const { influxApiEndpoint } = require('./config')

const api = express.Router()

api.get('/ping', async (req, res, next) => {
  debug('A request has come to /ping')

  try {
    res.send({ time: new Date().getTime() })
  } catch (e) {
    return next(e)
  }
})

api.get('/historico', function (req, res) {
  debug('A request has come to /historico')

  let { desde, hasta, tipo, resolucion, equipo } = req.query

  let filters = {
    metrics: [],
    from: parseInt(desde),
    to: parseInt(hasta)
  }

  // histórico de plumas o de maniobras
  filters.metrics = parseInt(tipo)
    ? ['adef', 'aexe', 'mtv', 'pbp', 'ppel', 'tmay', 'vto']
    : ['hta', 'anem', 'bpozo', 'llave', 'haparejo']

    // let url = `${config.historico_script}${req.query.equipo}?filters=${JSON.stringify(filters)}&resolution=${req.query.resolucion}`

  let uri = `${influxApiEndpoint}/api/histogram/${equipo}`
  let resolution = resolucion

  request({
    uri,
    qs: {
      filters: JSON.stringify(filters),
      resolution
    }}, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let data = JSON.parse(body)

      let jsonData = {
        datos: {}
      }

      data.forEach((item) => {
        let rows = []

        item.rows.forEach((row) => {
          rows.push([
            // moment(row.time).tz(timezone).valueOf(),
            moment(row.time).valueOf(),
            row.max
          ])
        })
        jsonData.datos[item.name] = rows
      })

      res.send(jsonData)
    } else {
      error = error || 'Error interno del servidor de datos.'

      res.status(500).send({ status: 'error', detail: error })
    }
  })
})

module.exports = api
