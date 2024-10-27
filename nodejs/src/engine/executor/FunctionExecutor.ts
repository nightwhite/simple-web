import assert from 'assert'

import { INTERCEPTOR_FUNCTION_NAME } from '../../constants/function-name'
import type { FunctionContext, FunctionResult, IFunctionData } from '../../types/functions'
import { nanosecond2ms } from '../../utils/common'
import { FunctionModule } from '../module/FunctionModule'

export class FunctionExecutor {
  /**
   * cloud function data struct
   */
  protected data: IFunctionData
  constructor(data: IFunctionData) {
    assert(data, 'function data cannot be empty')
    this.data = data
  }

  async invoke(context: FunctionContext, useInterceptor: boolean): Promise<FunctionResult> {
    const startTime = process.hrtime.bigint()

    try {
      const mod = this.getModule()
      const main = mod.default || mod.main

      if (!main) {
        throw new Error('FunctionExecutionError: `main` function not found')
      }

      if (typeof main !== 'function') {
        throw new Error('FunctionExecutionError: `main` function must be callable')
      }

      let data = null
      if (this.data.name === INTERCEPTOR_FUNCTION_NAME) {
        console.log('execute interceptor')
        data = await main(context, () => {})
      } else if (useInterceptor) {
        console.log('execute interceptor with interceptor')
        data = await this.invokeWithInterceptor(
          context,
          (ctx: FunctionContext) => main(ctx) as Promise<unknown>,
        )
      } else {
        console.log('execute function without interceptor')
        data = await main(context)
        console.log(data)
      }

      const endTime = process.hrtime.bigint()
      const timeUsage = nanosecond2ms(endTime - startTime)
      console.log('execute function end')
      return {
        data,
        time_usage: timeUsage,
      }
    } catch (error) {
      console.log('execute function error')
      const endTime = process.hrtime.bigint()
      const timeUsage = nanosecond2ms(endTime - startTime)

      return {
        error: error instanceof Error ? error : new Error(String(error)),
        time_usage: timeUsage,
      }
    }
  }

  protected async invokeWithInterceptor(
    context: FunctionContext,
    next?: (context: FunctionContext) => Promise<unknown>,
  ) {
    const mod = FunctionModule.get(INTERCEPTOR_FUNCTION_NAME)
    if (!mod) {
      throw new Error(`FunctionExecutionError: Module '${INTERCEPTOR_FUNCTION_NAME}' not found`)
    }
    const interceptor = mod.default || mod.main

    if (!interceptor) {
      throw new Error(
        `FunctionExecutionError: main function '${INTERCEPTOR_FUNCTION_NAME}' not found`,
      )
    }

    if (typeof interceptor !== 'function') {
      throw new Error(
        `FunctionExecutionError: Function '${INTERCEPTOR_FUNCTION_NAME}' must be callable`,
      )
    }

    // interceptor must have 2 arguments one is context and the other is next function
    if (interceptor.length !== 2) {
      throw new Error(
        `FunctionExecutionError: Function '${INTERCEPTOR_FUNCTION_NAME}' must have 2 arguments`,
      )
    }

    return await interceptor(context, next)
  }

  protected getModule() {
    const mod = FunctionModule.get(this.data.name)
    if (!mod) {
      throw new Error(`FunctionExecutionError: Module '${this.data.name}' not found`)
    }
    return mod
  }
}
