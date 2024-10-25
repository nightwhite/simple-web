import assert from 'assert'

import { INTERCEPTOR_FUNCTION_NAME } from '@/constants/function-name.js'
import { FunctionModule } from '@/engine/module/FunctionModule.js'
import type { FunctionContext, FunctionResult, IFunctionData } from '@/types/functions.js'
import { nanosecond2ms } from '@/utils/common.js'

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
        data = await main(context, () => {})
      } else if (useInterceptor) {
        data = await this.invokeWithInterceptor(context, main)
      } else {
        data = await main(context)
      }

      const endTime = process.hrtime.bigint()
      const timeUsage = nanosecond2ms(endTime - startTime)
      return {
        data,
        time_usage: timeUsage,
      }
    } catch (error) {
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
    const interceptor = mod.default || mod.main
    if (!interceptor) {
      throw new Error('FunctionExecutionError: `__interceptor__` function not found')
    }

    if (typeof interceptor !== 'function') {
      throw new Error('FunctionExecutionError: `__interceptor__` function must be callable')
    }

    if (interceptor.length === 2) {
      return interceptor(context, next)
    }
  }

  protected getModule() {
    const mod = FunctionModule.get(this.data.name)
    return mod
  }
}
