import * as crypto from 'crypto'

import type { Request } from 'express'

/**
 * Generate UUID v4
 * @returns
 */
export function generateUUID() {
  return crypto.randomUUID()
}

/**
 * nanosecond to ms
 * @param nanoseconds
 * @returns
 */
export function nanosecond2ms(nanoseconds: bigint): number {
  // trim the decimal point by devide 1000
  const _t = nanoseconds / BigInt(1000)

  const ret = parseFloat(_t.toString()) / 1000
  return ret
}

/**
 * sleep
 * @param ms  milliseconds
 * @returns
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * generate md5
 * @param content md5 content
 * @returns
 */
export function md5(content: string) {
  return crypto.createHash('md5').update(content).digest('hex')
}

export function uint8ArrayToBase64(buffer: Uint8Array) {
  return Buffer.from(buffer).toString('base64')
}

export function base64ToUint8Array(base64: string) {
  const buffer = Buffer.from(base64, 'base64')
  return new Uint8Array(buffer)
}

export function GetClientIPFromRequest(req: Request) {
  // try to get ip from x-forwarded-for
  const ips_str = req.headers['x-forwarded-for'] as string
  if (ips_str) {
    const ips = ips_str.split(',')
    return ips[0]
  }

  // try to get ip from x-real-ip
  const ip = req.headers['x-real-ip'] as string
  if (ip) {
    return ip
  }

  return null
}
