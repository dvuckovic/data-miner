import { describe, it, expect } from 'vitest'

import getPlugins from './index'

describe('Plugin Layer', () => {
  it('returns imported modules', async () => {
    const plugins = await getPlugins()

    expect(plugins).toHaveLength(2)
    expect(plugins[0].id).toBe('erate')
    expect(plugins[1].id).toBe('fcast3')
  })
})
