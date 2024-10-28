import { ICloudFunctionData } from './types'
import { logger } from '../logger'
import { InitHook } from '../init-hook'
import path from 'path'
import fs from 'fs'
import { compileTs2js } from '../utils'

const WORKSPACE_PATH = path.join(__dirname, '../../../function')
export class FunctionCache {
  private static cache: Map<string, ICloudFunctionData> = new Map()

  static initialize(): void {
    logger.info('initialize function cache')

    this.initializeFromWorkspace()

    logger.info('Function cache initialized.')

    // invoke init function
    InitHook.invoke()
  }

  static get(name: string): ICloudFunctionData {
    return FunctionCache.cache.get(name)
  }

  static getAll(): ICloudFunctionData[] {
    return Array.from(FunctionCache.cache.values())
  }

  private static initializeFromWorkspace(): void {
    const stack = [WORKSPACE_PATH]

    while (stack.length > 0) {
      const currentDir = stack.pop()
      const entries = fs.readdirSync(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)
        if (entry.isDirectory()) {
          stack.push(fullPath)
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          // Read the TypeScript file content
          const fileContent = fs.readFileSync(fullPath, 'utf8')

          // Calculate relative path from WORKSPACE_PATH and remove .ts extension
          const relativePath = path.relative(WORKSPACE_PATH, fullPath)
          const name = relativePath.replace(/\.ts$/, '')
          // Compile the TypeScript code to JavaScript
          const compiledCode = compileTs2js(fileContent, name)
          // Create the cloud function data object
          const cloudFunction: ICloudFunctionData = {
            name,
            code: fileContent,
            compiledCode
          }
          // console.log('++++++++++++++++++++++++++++++++++++')
          console.log(cloudFunction.name)
          // console.log(cloudFunction.code)
          // console.log('--------------------------------')
          // console.log(cloudFunction.compiledCode)
          // console.log('++++++++++++++++++++++++++++++++++++')
          FunctionCache.cache.set(cloudFunction.name, cloudFunction)
        }
      }
    }
  }
}
