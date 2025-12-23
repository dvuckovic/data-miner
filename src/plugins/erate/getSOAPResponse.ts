import * as core from '@actions/core'
import { createClientAsync } from 'soap'

import type { GetCurrentExchangeRateResult } from './parseSOAPResponse'

const BASE_URL = 'https' + '://' + 'webservices' + '.' + 'nbs' + '.' + 'rs'
const AUTH_XMLNS = 'http' + '://' + 'communication' + 'office' + '.' + 'nbs' + '.' + 'rs'

const getSOAPResponse = async (): Promise<GetCurrentExchangeRateResult> => {
  const username = process.env.ERATE_USERNAME ?? ''
  const password = process.env.ERATE_PASSWORD ?? ''
  const licenceId = process.env.ERATE_LICENCE_ID ?? ''

  if (!username || !password || !licenceId)
    throw new Error('ERATE_USERNAME, ERATE_PASSWORD and ERATE_LICENCE_ID environment variables must be set')

  const wsdlUrl = new URL('/CommunicationOfficeService1_0/ExchangeRateService.asmx?WSDL', BASE_URL)

  core.info(`Fetching exchange rate from ${wsdlUrl.href} ...`)

  const client = await createClientAsync(wsdlUrl.href)

  const authHeaderXml = buildAuthenticationHeaderXml({
    username,
    password,
    licenceId,
  })

  client.addSoapHeader(authHeaderXml)

  const [response] = await client.GetCurrentExchangeRateAsync({
    exchangeRateListTypeID: 1,
  })

  return response
}

const buildAuthenticationHeaderXml = (params: {
  username: string
  password: string
  licenceId: string
}): string => (
  `<AuthenticationHeader xmlns="${AUTH_XMLNS}">`
  + `<UserName>${params.username}</UserName>`
  + `<Password>${params.password}</Password>`
  + `<LicenceID>${params.licenceId}</LicenceID>`
  + `</AuthenticationHeader>`
)

export default getSOAPResponse
