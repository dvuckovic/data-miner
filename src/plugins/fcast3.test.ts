import { vi, describe, it, expect } from 'vitest'
import * as core from '@actions/core'

import fcast3 from './fcast3'
import parseThree from './fcast3/parseThree'
import generateFeed from './fcast3/generateFeed'


vi.mock('@actions/core')
vi.mock('./fcast3/parseThree')
vi.mock('./fcast3/generateFeed')

const mockResponse: Response = {
  ok: true,
  headers: new Headers(),
  status: 200,
  statusText: 'OK',
  redirected: false,
  type: 'basic' as ResponseType,
  url: '',
  clone: () => new Response(),
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  blob: () => Promise.resolve(new Blob()),
  formData: () => Promise.resolve(new FormData()),
  body: null,
  bodyUsed: false,
  bytes: () => Promise.resolve(new Uint8Array()),
  text: () => Promise.resolve('<html></html>'),
  json: () => Promise.resolve({}),
}

const fetchMock = vi.fn(() => Promise.resolve(mockResponse))

vi.stubGlobal('fetch', fetchMock)

describe('fcast3 Plugin', () => {
  it('defines expected plugin identifier', async () => {
    expect(fcast3.id).toBe('fcast3')
  })

  it('implements execute method', async () => {
    expect(fcast3.execute).toBeTypeOf('function')
  })

  describe('execute method', () => {
    it('fetches remote page', async () => {
      await fcast3.execute()

      expect(fetchMock).toHaveBeenCalledOnce()
      expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Fetching forecast from'))
    })

    it('returns expected result structure', async () => {
      vi.mocked(parseThree).mockReturnValue({ status: 'ok', data: {} })
      vi.mocked(generateFeed).mockReturnValue('<xml></xml>')

      const result = await fcast3.execute()

      expect(result.data).toEqual({ status: 'ok', data: {} })
      expect(result.xml).toBe('<xml></xml>')
    })

    it('implements parsing error handling', async () => {
      vi.mocked(parseThree).mockReturnValue({ status: 'not_ok', e: 3 })

      await fcast3.execute()

      expect(core.warning).toHaveBeenCalledWith('Parsing exception...')
    })

    it('implements general error handling', async () => {
      vi.mocked(parseThree).mockImplementation(() => {
        throw 'Unknown Error'
      })

      await fcast3.execute()

      expect(core.setFailed).toHaveBeenCalledWith('Unknown error occurred')
    })

    it('implements fetch error handling', async () => {
      vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
        ...mockResponse,
        ok: false,
        status: 500,
        statusText: 'Internal Error',
      })))

      await fcast3.execute()

      expect(core.setFailed).toHaveBeenCalledWith('Internal Error')
    })
  })
})
