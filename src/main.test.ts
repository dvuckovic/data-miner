import { vi, describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest'
import * as core from '@actions/core'

import { run } from './main'
import getPlugins from './plugins'

vi.mock('@actions/core')
vi.mock('./plugins')

describe('Test Mode', () => {
  beforeAll(() => {
    vi.stubEnv('TEST_MODE', 'true')
  })

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it('runs in test mode', async () => {
    await run()

    expect(core.info).toHaveBeenCalledWith('Running in test mode...')
  })
})

describe('Plugins', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('sets the output plugins correctly with all plugins', async () => {
    vi.mocked(getPlugins).mockResolvedValue([
      {
        id: 'erate',
        execute: async () => ({ data: { rates: [0.1, 0.2, 0.3] } }),
      },
      {
        id: 'fcast3',
        execute: async () => ({ data: { forecast: 'sunny' } }),
      },
    ])

    await run()

    expect(core.setOutput).toHaveBeenCalledWith('result', [
      expect.objectContaining({
        id: 'erate',
        data: { rates: [0.1, 0.2, 0.3] },
      }),
      expect.objectContaining({
        id: 'fcast3',
        data: { forecast: 'sunny' },
      }),
    ])
  })
})

describe('Error Handling', () => {
  beforeEach(() => {
    vi.mocked(getPlugins).mockResolvedValue([])
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('sets failed on error', async () => {
    vi.mocked(core.setOutput).mockImplementation(() => {
      throw new Error('Something went wrong')
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('Something went wrong')
  })

  it('sets failed on exception', async () => {
    vi.mocked(core.setOutput).mockImplementation(() => {
      throw 'An exception occurred'
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('Unknown error occurred')
  })
})
