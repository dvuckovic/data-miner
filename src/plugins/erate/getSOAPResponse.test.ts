import { vi, describe, it, expect } from 'vitest'
import { Client, createClientAsync } from 'soap'
import * as core from '@actions/core'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import getSOAPResponse from './getSOAPResponse'

vi.mock('soap')
vi.mock('@actions/core')

describe('getSOAPResponse', () => {
  it('executes SOAP function', async () => {
    vi.stubEnv('ERATE_USERNAME', 'test-username')
    vi.stubEnv('ERATE_PASSWORD', 'test-password')
    vi.stubEnv('ERATE_LICENCE_ID', 'test-licence-id')

    const fixtureSoapResponse = JSON.parse(
      readFileSync(
        resolve(__dirname, '__fixtures__', 'GetCurrentExchangeRate.json'),
        'utf8',
      ),
    )

    const mockGetCurrentExchangeRateAsync = vi.fn()
    const mockAddSoapHeader = vi.fn()

    vi.mocked(createClientAsync).mockResolvedValue({
      GetCurrentExchangeRateAsync: mockGetCurrentExchangeRateAsync
        .mockResolvedValue([fixtureSoapResponse]),
      addSoapHeader: mockAddSoapHeader,
    } as unknown as Client)

    const result = await getSOAPResponse()

    expect(createClientAsync).toHaveBeenCalledExactlyOnceWith(expect.stringContaining('/CommunicationOfficeService1_0/ExchangeRateService.asmx?WSDL'))
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('Fetching exchange rate from'))
    expect(mockAddSoapHeader).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('<AuthenticationHeader xmlns="'),
    )
    expect(mockAddSoapHeader).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('<UserName>test-username</UserName>'),
    )
    expect(mockAddSoapHeader).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('<Password>test-password</Password>'),
    )
    expect(mockAddSoapHeader).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('<LicenceID>test-licence-id</LicenceID>'),
    )
    expect(mockGetCurrentExchangeRateAsync).toHaveBeenCalledExactlyOnceWith({
      exchangeRateListTypeID: 1,
    })
    expect(result).toEqual(fixtureSoapResponse)
  })
})