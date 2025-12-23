import { vi, describe, it, expect } from 'vitest'
import * as core from '@actions/core'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import erate from './erate'
import getSOAPResponse from './erate/getSOAPResponse'

vi.mock('@actions/core')
vi.mock('./erate/getSOAPResponse')

describe('erate Plugin', () => {
  it('handles successful SOAP response', async () => {
    const fixtureSoapResponse = JSON.parse(
      readFileSync(
        resolve(__dirname, 'erate', '__fixtures__', 'GetCurrentExchangeRate.json'),
        'utf8',
      ),
    )

    vi.mocked(getSOAPResponse).mockResolvedValue(fixtureSoapResponse)

    const result = await erate.execute()

    expect(result).toHaveProperty('data')
    expect(result.data).toEqual({
      result: expect.objectContaining({
        date: '26.12.2025',
        eur: { kup: '117.0114', pro: '117.7156' },
      }),
    })
  })

  it('implements general error handling', async () => {
    vi.mocked(getSOAPResponse).mockImplementation(() => {
      throw 'Unknown Error'
    })

    await erate.execute()

    expect(core.setFailed).toHaveBeenCalledWith('Unknown error occurred')
  })
})
