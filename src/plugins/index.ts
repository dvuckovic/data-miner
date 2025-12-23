import { Plugin } from './types'

const getPlugins = async (): Promise<Plugin[]> =>
  await Promise.all([
    import('./erate').then((p) => p.default),
    import('./fcast3').then((p) => p.default),
  ])

export default getPlugins
