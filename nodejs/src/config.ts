import * as dotenv from 'dotenv'

/**
 * parse environment vars from the `.env` file if existing
 */
dotenv.config()

/**
 * configuration management
 */
export default class Config {
  /**
   * mongodb connection configuration
   */
  static get MONGO_URI() {
    return process.env['MONGO_URI']
  }

  /**
   * the server secret salt, mainly used for generating tokens
   */
  static get SERVER_SECRET(): string {
    const secret_salt = process.env['SERVER_SECRET']
    if (!secret_salt) {
      throw new Error('env: `SERVER_SECRET` is missing')
    }
    return secret_salt
  }

  /**
   * the logger level : 'debug', 'info', 'warn', 'error'
   */
  static get LOG_LEVEL(): 'debug' | 'info' | 'warn' | 'error' {
    return (process.env['LOG_LEVEL'] as any) || 'debug'
  }

  /**
   * the logger display line level : 'info', 'warn', 'error', 'debug'
   */
  static get DISPLAY_LINE_LOG_LEVEL(): 'debug' | 'info' | 'warn' | 'error' {
    return (process.env['DISPLAY_LINE_LOG_LEVEL'] as any) || 'error'
  }

  /**
   * the object depth limit when logging
   */
  static get LOG_DEPTH(): number {
    const depth = (process.env['LOG_DEPTH'] as any) ?? 1
    if (depth < 0) {
      return 0
    }
    return depth > 5 ? 5 : depth
  }

  /**
   * the serving port, default is 8000
   */
  static get PORT(): number {
    return (process.env.__PORT ?? 8000) as number
  }

  static get STORAGE_PORT(): number {
    return (process.env.__STORAGE_PORT ?? 9000) as number
  }

  /**
   * in production deploy or not
   */
  static get isProd(): boolean {
    return process.env.NODE_ENV === 'production'
  }

  static get REQUEST_LIMIT_SIZE(): string {
    return process.env.REQUEST_LIMIT_SIZE || '10mb'
  }

  static get CHANGE_STREAM_RECONNECT_INTERVAL(): number {
    return (process.env.CHANGE_STREAM_RECONNECT_INTERVAL || 3000) as number
  }

  static get OSS_INTERNAL_ENDPOINT(): string {
    return process.env.OSS_INTERNAL_ENDPOINT || ''
  }

  static get OSS_EXTERNAL_ENDPOINT(): string {
    return process.env.OSS_EXTERNAL_ENDPOINT
  }

  static get DISABLE_MODULE_CACHE(): boolean {
    return process.env.DISABLE_MODULE_CACHE === 'true'
  }

  static get APPID(): string {
    return "laf"
  }

}
