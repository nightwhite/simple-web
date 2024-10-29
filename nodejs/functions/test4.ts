// import Config from 'src/config/Config'
import { tee } from '../src/test'

// import Config from '@/src/config/Config'

export default async function (ctx: FunctionContext) {
  await tee()
  console.log('ok')

  // console.log(Config.WORKSPACE_PATH)

  // throw new Error('eeee')
  return {
    data: 'test4',
  }
}
