import { Response } from 'express'
import { IRequest } from '../support/types'
import { DEFAULT_FUNCTION_NAME, INTERCEPTOR_FUNCTION_NAME } from '../constants'
import {
  FunctionExecutor,
  Console,
  FunctionCache,
  FunctionContext,
} from '../support/engine'

export async function handleInvokeFunction(req: IRequest, res: Response) {
  const name = req.params?.name

  const ctx: FunctionContext = {
    __function_name: name,
    requestId: req.requestId,
    query: req.query,
    files: req.files as any,
    body: req.body,
    headers: req.headers,
    method: req.method,
    auth: req['auth'],
    user: req.user,
    request: req,
    response: res,
  }

  let useInterceptor = true
  if (!FunctionCache.get(INTERCEPTOR_FUNCTION_NAME)) {
    useInterceptor = false
  }

  return await invokeFunction(ctx, useInterceptor)
}

// invoke cloud function
async function invokeFunction(
  ctx: FunctionContext,
  useInterceptor: boolean,
): Promise<any> {
  const requestId = ctx.requestId

  const name = ctx.__function_name

  let func = FunctionCache.get(name)
  if (!func) {
    func = FunctionCache.get(DEFAULT_FUNCTION_NAME)
    if (!func) {
      return ctx.response.status(404).send('Function Not Found')
    }
  }
  // TODO: add HTTP method support
  // reject while no HTTP enabled
  // if (!func.methods.includes(ctx.request.method.toUpperCase())) {
  //   return ctx.response.status(405).send('Method Not Allowed')
  // }

  const logger = new Console(func.name)
  try {
    // execute the func
    const executor = new FunctionExecutor(func)
    const result = await executor.invoke(ctx, useInterceptor)

    if (result.error) {
      logger.error(result.error)
      return ctx.response.status(500).send({
        error: 'Internal Server Error',
        requestId,
      })
    }

    // reject request if interceptor return false
    if (
      result.data?.__type__ === '__interceptor__' &&
      result.data?.__res__ == false
    ) {
      return ctx.response.status(403).send({ error: 'Forbidden', requestId })
    }

    if (ctx.response.writableEnded === false) {
      let data = result.data
      if (typeof result.data === 'number') {
        data = Number(result.data).toString()
      }
      return ctx.response.send(data)
    }
  } catch (error) {
    logger.error(requestId, 'failed to invoke error', error)
    return ctx.response.status(500).send('Internal Server Error')
  }
}