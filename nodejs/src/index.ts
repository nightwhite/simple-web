import express from 'express'
import cors from 'cors'

import Config from './config'
import { router } from './handler/router'
import { logger } from './support/logger'
import { GetClientIPFromRequest, generateUUID } from './support/utils'
import { WebSocketAgent } from './support/ws'
import xmlparser from 'express-xml-bodyparser'


import { FunctionCache } from './support/engine'

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Caught unhandledRejection:`, reason, promise)
})

process.on('uncaughtException', (err) => {
  logger.error(`Caught uncaughtException:`, err)
})

console.log('1')
FunctionCache.initialize()
console.log('2')
require('source-map-support').install({
  emptyCacheBetweenOperations: true,
  overrideRetrieveFile: true,
  retrieveFile: (path) => FunctionCache.get(path)?.compiledCode,
})

const app = express()

app.use(
  cors({
    origin: true,
    methods: '*',
    exposedHeaders: '*',
    credentials: true,
    maxAge: 86400,
  }),
)
// fix x-real-ip while gateway not set
app.use((req, _res, next) => {
  if (!req.headers['x-real-ip']) {
    req.headers['x-real-ip'] = GetClientIPFromRequest(req)
  }
  next()
})

app.use(express.json({ limit: Config.REQUEST_LIMIT_SIZE }) as any)

app.use(
  express.urlencoded({
    limit: Config.REQUEST_LIMIT_SIZE,
    extended: true,
  }) as any,
)

app.use(
  express.raw({
    limit: Config.REQUEST_LIMIT_SIZE,
  }) as any,
)

app.use(xmlparser())



/**
 * Parsing bearer token
 */
app.use(function (req, res, next) {
  const requestId = (req['requestId'] =
    req.headers['x-request-id'] || generateUUID())
  res.set('request-id', requestId)
  next()
})

app.use(router)

const server = app.listen(Config.PORT, () =>
  logger.info(`server ${process.pid} listened on ${Config.PORT}`),
)

/**
 * WebSocket upgrade & connect
 */
server.on('upgrade', (req, socket, head) => {
  WebSocketAgent.server.handleUpgrade(req, socket as any, head, (client) => {
    WebSocketAgent.server.emit('connection', client, req)
  })
})

process.on('SIGTERM', gracefullyExit)
process.on('SIGINT', gracefullyExit)

async function gracefullyExit() {
  server.close()
  logger.info('process gracefully exited!')
  process.exit(0)
}
