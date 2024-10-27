import fs from 'fs'
import path from 'path'

import Config from '../../config/Config'
import type { IFunctionData } from '../../types/functions'
import { compileTs2js } from '../../utils/lang'
import { systemLogger } from '../../utils/logger'
import { InitHook } from '../hooks/init-hook'

export class FunctionCache {
  private static cache: Map<string, IFunctionData> = new Map()

  static initialize(): void {
    systemLogger.info('initialize function cache')

    this.initializeFromWorkspace()

    systemLogger.info('Function cache initialized.')

    // invoke init function
    InitHook.invoke()
  }

  static get(name: string): IFunctionData {
    return FunctionCache.cache.get(name)!
  }

  static getAll(): IFunctionData[] {
    return Array.from(FunctionCache.cache.values())
  }

  private static initializeFromWorkspace(): void {
    const stack = [Config.WORKSPACE_PATH]

    while (stack.length > 0) {
      const currentDir = stack.pop()
      if (!currentDir) continue
      const entries = fs.readdirSync(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)
        if (entry.isDirectory()) {
          stack.push(fullPath)
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          // Read the TypeScript file content
          const fileContent = fs.readFileSync(fullPath, 'utf8')

          // Calculate relative path from WORKSPACE_PATH and remove .ts extension
          const relativePath = path.relative(Config.WORKSPACE_PATH, fullPath)
          const name = relativePath.replace(/\.ts$/, '')
          // Compile the TypeScript code to JavaScript
          const compiledCode = compileTs2js(fileContent, name)
          // Create the cloud function data object
          const cloudFunction: IFunctionData = {
            name,
            code: fileContent,
            compiledCode,
          }
          systemLogger.info(`Loaded function: ${cloudFunction.name}`)
          FunctionCache.cache.set(cloudFunction.name, cloudFunction)
        }
      }
    }
  }
}
