import { RunningScriptOptions } from 'vm'
import { FunctionCache, FunctionModuleGlobalContext } from '.'
import Config from '../../config'
import { Console } from '.'
import * as vm from 'vm'
import * as path from 'node:path'


export class FunctionModule {
  protected static cache: Map<string, any> = new Map()

  static get(functionName: string): any {
    const moduleName = `@/${functionName}`
    return this.require(moduleName, [])
  }

  static require(moduleName: string, fromModule: string[], filename = ''): any {
    if (moduleName === '@/cloud-sdk') {
      return require('@lafjs/cloud')
    } else if (
      moduleName.startsWith('@/') ||
      moduleName.startsWith('./') ||
      moduleName.startsWith('../')
    ) {
      // get function name
      let fn = ''
      if (moduleName.startsWith('@/')) {
        fn = moduleName.replace('@/', '')
      } else {
        const dirname = '/'
        const filePath = path.join(path.dirname(dirname + filename), moduleName)
        fn = filePath.slice(dirname.length)
      }

      // check cache
      if (FunctionModule.cache.has(fn)) {
        return FunctionModule.cache.get(fn)
      }

      // check circular dependency
      if (fromModule?.indexOf(fn) !== -1) {
        throw new Error(
          `circular dependency detected: ${fromModule.join(' -> ')} -> ${fn}`,
        )
      }

      // build function module
      const data = FunctionCache.get(fn)
      if (!data) {
        throw new Error(`function ${fn} not found`)
      }
      const mod = this.compile(fn, data.compiledCode, fromModule)

      // cache module
      if (!Config.DISABLE_MODULE_CACHE) {
        FunctionModule.cache.set(fn, mod)
      }
      return mod
    }

    return require(moduleName)
  }

  /**
   * Compile function module
   */
  static compile(
    functionName: string,
    code: string,
    fromModules: string[],
    consoleInstance?: Console,
  ): any {
    const wrapped = this.wrap(code)
    const sandbox = this.buildSandbox(
      functionName,
      fromModules,
      consoleInstance,
    )
    const options: RunningScriptOptions = {
      filename: functionName,
      displayErrors: true,
      contextCodeGeneration: {
        strings: true,
        wasm: true,
      },
    } as any

    const script = this.createScript(wrapped, options)
    return script.runInNewContext(sandbox, options)
  }

  static deleteCache(): void {
    FunctionModule.cache.clear()
  }

  protected static wrap(code: string): string {
    // ensure 1 line to balance line offset of error stack
    return [
      `function require(name){__from_modules.push(__filename);return __require(name,__from_modules,__filename);}`,
      `${code}`,
      `\nmodule.exports;`,
    ].join(' ')
  }

  /**
   * Create vm.Script
   */
  protected static createScript(
    code: string,
    options: vm.RunningScriptOptions,
  ): vm.Script {
    const _options = {
      ...options,
      importModuleDynamically: async (
        specifier: string,
        _: vm.Script,
        _importAssertions: any,
      ) => {
        return await import(specifier)
      },
    } as any

    const script = new vm.Script(code, _options)
    return script
  }

  /**
   * Build function module global sandbox
   */
  protected static buildSandbox(
    functionName: string,
    fromModules: string[],
    consoleInstance?: Console,
  ): FunctionModuleGlobalContext {
    const _module = {
      exports: {},
    }

    const fConsole = consoleInstance || new Console(functionName)
    const __from_modules = fromModules || []

    const sandbox: FunctionModuleGlobalContext = {
      __filename: functionName,
      module: _module,
      exports: _module.exports,
      console: fConsole,
      __require: this.require.bind(this),
      RegExp: RegExp,
      Buffer: Buffer,
      setImmediate: setImmediate,
      clearImmediate: clearImmediate,
      Float32Array: Float32Array,
      setInterval: setInterval,
      clearInterval: clearInterval,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      process: process,
      URL: URL,
      fetch: globalThis.fetch,
      global: null,
      __from_modules: [...__from_modules],
    }
    sandbox.global = sandbox
    return sandbox
  }
}
