/* eslint-disable @typescript-eslint/no-explicit-any */
import * as path from 'node:path'
import * as vm from 'vm'
import type { Script, Context, RunningScriptInNewContextOptions, ScriptOptions } from 'vm'

import Config from '@/config/Config.js'
import { FunctionCache } from '@/engine/cache/FunctionCache.js'
import { Console } from '@/utils/logger.js'

interface ModuleExports {
  [key: string]: any
}

interface Module {
  exports: ModuleExports
}

interface FunctionModuleGlobalContext {
  __filename: string
  module: Module
  exports: ModuleExports
  console: Console
  __require: typeof FunctionModule.require
  RegExp: typeof RegExp
  Buffer: typeof Buffer
  Float32Array: typeof Float32Array
  setInterval: typeof setInterval
  clearInterval: typeof clearInterval
  setTimeout: typeof setTimeout
  clearTimeout: typeof clearTimeout
  setImmediate: typeof setImmediate
  clearImmediate: typeof clearImmediate
  Promise: typeof Promise
  process: typeof process
  URL: typeof URL
  fetch: typeof fetch
  global: unknown
  __from_modules: string[]
}

export class FunctionModule {
  // Cache for loaded modules
  private static moduleCache: Map<string, any> = new Map()

  /**
   * Get a function module by name
   * @param functionName Function name to load
   * @returns Module exports
   * @throws Error if function not found
   */
  static get(functionName: string): any {
    if (!functionName) {
      throw new Error('Function name is required')
    }
    const moduleName = `@/${functionName}`
    return this.require(moduleName, [], '')
  }

  /**
   * Require a module by name
   * @param moduleName Module name to require
   * @param fromModule Array of parent module names (for circular dependency detection)
   * @param currentFileName Current filename
   * @returns Module exports
   * @throws Error if module not found or circular dependency detected
   */
  static require(moduleName: string, fromModule: string[], currentFileName: string): any {
    try {
      // Handle cloud SDK imports
      if (moduleName === '@/cloud-sdk') {
        return
      }

      // Handle relative and absolute paths
      if (this.isLocalModule(moduleName)) {
        const fn = this.resolveModulePath(moduleName, currentFileName)

        if (currentFileName === '') {
          currentFileName = fn
        }

        // Check module cache
        if (!Config.DISABLE_MODULE_CACHE && this.moduleCache.has(fn)) {
          return this.moduleCache.get(fn)!
        }

        // Check circular dependencies
        if (this.hasCircularDependency(fn, fromModule)) {
          throw new Error(`Circular dependency detected: ${fromModule.join(' -> ')} -> ${fn}`)
        }

        // Load and compile module
        const functionData = FunctionCache.get(fn)
        if (!functionData) {
          throw new Error(`Function ${fn} not found`)
        }

        const compiledModule = this.compile(fn, functionData.compiledCode, fromModule)

        // Cache module if enabled
        if (!Config.DISABLE_MODULE_CACHE) {
          this.moduleCache.set(fn, compiledModule)
        }

        return compiledModule
      }

      // Handle external modules
      return import(moduleName)
    } catch (error) {
      if (currentFileName === '') {
        throw new Error(`Failed to require module ${currentFileName}: ${error}`)
      } else {
        throw new Error(`${currentFileName}: Failed to require module ${moduleName}: ${error}`)
      }
    }
  }

  /**
   * Clear the module cache
   */
  static clearCache(): void {
    this.moduleCache.clear()
  }

  /**
   * Check if module name is a local module
   */
  private static isLocalModule(moduleName: string): boolean {
    return (
      moduleName.startsWith('@/') || moduleName.startsWith('./') || moduleName.startsWith('../')
    )
  }

  /**
   * Resolve module path from module name
   */
  private static resolveModulePath(moduleName: string, filename: string): string {
    if (moduleName.startsWith('@/')) {
      return moduleName.replace('@/', '')
    }
    const dirname = '/'
    const filePath = path.join(path.dirname(dirname + filename), moduleName)
    return filePath.slice(dirname.length)
  }

  /**
   * Check for circular dependencies
   */
  private static hasCircularDependency(moduleName: string, fromModules: string[]): boolean {
    return fromModules.includes(moduleName)
  }

  /**
   * Wrap code with require function and module exports
   */
  private static wrap(code: string): string {
    return [
      'function require(name) {',
      '  __from_modules.push(__filename);',
      '  return __require(name, __from_modules, __filename);',
      '}',
      code,
      '\nmodule.exports;',
    ].join('\n')
  }

  /**
   * Compile function code into a module
   */
  static compile(
    functionName: string,
    code: string,
    fromModules: string[],
    consoleInstance?: Console,
  ): any {
    try {
      // 使用 RunningScriptInNewContextOptions 运行脚本
      const runningOptions = this.createRunningOptions(functionName)
      // 使用 ScriptOptions 创建脚本
      const scriptOptions = this.createScriptOptions(functionName)
      const sandbox = this.buildSandbox(functionName, fromModules, consoleInstance)
      const wrappedCode = this.wrap(code)

      const script = new vm.Script(wrappedCode, scriptOptions)
      return script.runInNewContext(sandbox, runningOptions)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to compile ${functionName}: ${errorMessage}`)
    }
  }

  /**
   * 创建脚本编译选项
   */
  private static createScriptOptions(filename: string): ScriptOptions {
    return {
      filename,
      // @ts-expect-error Types are incompatible but the implementation is correct
      importModuleDynamically: async (
        specifier: string,
        _script: Script,
        _importAttributes: ImportAttributes,
      ): Promise<any> => {
        // if (this.isLocalModule(specifier)) {
        //   // Resolve and require local modules dynamically
        //   // filename 是当前的文件名, specifier 是 import 的模块名, 所以需要使用 filename 来 resolve 模块路径,
        //   const resolvedModule = this.resolveModulePath(specifier, filename)
        //   // TODO: use __from_modules
        //   return this.require(resolvedModule, global.__from_modules, filename)
        // } else {
        //   // Dynamically import external modules
        //   return import(specifier)
        // }
        return import(specifier)
      },
    }
  }

  /**
   * 创建脚本运行时选项
   */
  private static createRunningOptions(filename: string): RunningScriptInNewContextOptions {
    return {
      filename,
      displayErrors: true,
      // timeout: 5000,
      breakOnSigint: true,
      contextName: `VM_Context_${filename}`,
      contextCodeGeneration: {
        strings: true,
        wasm: true,
      },
      microtaskMode: 'afterEvaluate',
    }
  }

  /**
   * Build sandbox environment for VM context
   */
  private static buildSandbox(
    functionName: string,
    fromModules: string[],
    consoleInstance?: Console,
  ): Context & FunctionModuleGlobalContext {
    const _module: Module = {
      exports: {},
    }

    const fConsole = consoleInstance || new Console(functionName, Config)
    const __from_modules = [...fromModules]

    // TODO: 添加一些 utils，比如清楚缓存，重刷缓存
    const sandbox: Context & FunctionModuleGlobalContext = {
      __filename: functionName,
      module: _module,
      exports: _module.exports,
      console: fConsole,
      __require: this.require.bind(this),
      RegExp,
      Buffer,
      Float32Array,
      setInterval,
      clearInterval,
      setTimeout,
      clearTimeout,
      setImmediate,
      clearImmediate,
      Promise,
      process,
      URL,
      fetch: globalThis.fetch,
      global: null,
      __from_modules,
    }

    sandbox.global = sandbox
    return sandbox
  }
}
