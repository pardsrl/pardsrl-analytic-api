'use strict'

module.exports = {
  influxApiEndpoint: process.env.INFLUX_API_ENDPOINT || 'http://localhost:3000',
  mqttHost: process.env.MQTT_HOST || 'mqtt://localhost',
  timezone: process.env.TIMEZONE || 'America/Argentina/Buenos_Aires'
}
