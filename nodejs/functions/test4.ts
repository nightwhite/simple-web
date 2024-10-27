import Config from '../src/config/Config'

// import Config from '@/src/config/Config'

export default async function (ctx: FunctionContext) {
  console.log('ok')

  console.log(Config.WORKSPACE_PATH)

  // throw new Error('eeee')
  return {
    data: 'test4',
  }
}
