import type { Server } from 'http'

import cors from 'cors'
import dotenv from 'dotenv'
import type { Express, Request, Response, NextFunction } from 'express'
import express from 'express'
import xmlparser from 'express-xml-bodyparser'
import sourceMapSupport from 'source-map-support'

import Config from '@/config/Config.js'
import { FunctionCache } from '@/engine/cache/FunctionCache.js'
import { router } from '@/handler/router.js'
import { WebSocketAgent } from '@/handler/ws.js'
import type { SimpleWebConfig } from '@/types/simple-web-config.js'
import { GetClientIPFromRequest } from '@/utils/common.js'
import { systemLogger } from '@/utils/logger.js'

sourceMapSupport.install({
  emptyCacheBetweenOperations: true,
  overrideRetrieveFile: true,
  retrieveFile: (path) => FunctionCache.get(path)?.compiledCode,
})

dotenv.config()

export class SimpleWeb {
  private app: Express
  private server!: Server

  constructor(private userConfig: SimpleWebConfig = {}) {
    Config.initialize(userConfig)
    this.app = express()
    this.setupMiddlewares()
    this.setupRoutes()
  }

  private setupMiddlewares() {
    this.app.use(
      cors({
        origin: true,
        methods: '*',
        exposedHeaders: '*',
        credentials: true,
        maxAge: 86400,
      }),
    )

    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      if (!req.headers['x-real-ip']) {
        const clientIP = GetClientIPFromRequest(req)
        if (clientIP) {
          req.headers['x-real-ip'] = clientIP
        }
      }
      next()
    })

    this.app.use(express.json({ limit: Config.REQUEST_LIMIT_SIZE }))

    this.app.use(
      express.urlencoded({
        limit: Config.REQUEST_LIMIT_SIZE,
        extended: true,
      }),
    )

    this.app.use(
      express.raw({
        limit: Config.REQUEST_LIMIT_SIZE,
      }),
    )

    this.app.use(xmlparser())
  }

  private setupRoutes() {
    this.app.use(router)
  }

  private setupErrorHandling() {
    process.on('unhandledRejection', (reason, promise) => {
      systemLogger.error(`Caught unhandledRejection:`, reason, promise)
    })

    process.on('uncaughtException', (err) => {
      systemLogger.error(`Caught uncaughtException:`, err)
    })

    process.on('SIGTERM', this.gracefullyExit.bind(this))
    process.on('SIGINT', this.gracefullyExit.bind(this))
  }

  private setupWebSocket() {
    this.server.on('upgrade', (req, socket, head) => {
      WebSocketAgent.server.handleUpgrade(req, socket, head, (client) => {
        WebSocketAgent.server.emit('connection', client, req)
      })
    })
  }

  private gracefullyExit() {
    this.server.close(() => {
      systemLogger.info('process gracefully exited!')
      process.exit(0)
    })
  }

  public start() {
    FunctionCache.initialize()
    this.setupErrorHandling()

    this.server = this.app.listen(Config.PORT, () =>
      systemLogger.info(`server ${process.pid} listened on ${Config.PORT}`),
    )

    this.setupWebSocket()

    systemLogger.info('SimpleWeb framework started.')
  }
}

export default SimpleWeb
