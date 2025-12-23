import * as core from '@actions/core'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

interface ExchangeRateDataSet {
  ExchangeRateDataSet: {
    ExchangeRate: {
      CurrencyCodeAlfaChar: string
      BuyingRate: string
      SellingRate: string
    }[]
  }
}

export interface GetCurrentExchangeRateResult {
  GetCurrentExchangeRateResult: {
    diffgram: ExchangeRateDataSet
  }
}

interface ParsedExchangeRate {
  currencyCode: string
  buyingRate: string
  sellingRate: string
}

interface ExchangeRate {
  kup: string
  pro: string
}

type Currency = 'eur' | 'usd' | 'gbp' | 'chf'

type Data = {
  [key in Currency]?: ExchangeRate
}

interface Result {
  result?: {
    date: string
  } & Data
}

const parseSOAPResponse = (response: GetCurrentExchangeRateResult): Result => {
  const result = response?.GetCurrentExchangeRateResult?.diffgram

  if (!result) {
    core.setFailed('Unexpected SOAP response: missing expected payload')
    return {}
  }

  const currentDate = dayjs().format('DD.MM.YYYY')

  core.info(`currentDate: ${currentDate}`)

  return buildExchangeResult(result, currentDate)
}

const buildExchangeResult = (dataset: ExchangeRateDataSet, date: string) => {
  const exchange: Result = {
    result: {
      date,
    },
  }

  const currencies = new Set(['EUR', 'USD', 'GBP', 'CHF'])

  const rates = parseExchangeRatesDataSet(dataset)

  for (const rate of rates) {
    if (!currencies.has(rate.currencyCode)) continue

    const currency = rate.currencyCode.toLowerCase() as Currency

    exchange.result![currency] = {
      kup: rate.buyingRate,
      pro: rate.sellingRate,
    }
  }

  return exchange
}

const parseExchangeRatesDataSet = (dataset: ExchangeRateDataSet) => {
  const results: ParsedExchangeRate[] = []

  core.startGroup('parseExchangeRatesDataSet')
  core.info(`dataset: ${dataset}`)

  if (!dataset.ExchangeRateDataSet?.ExchangeRate) {
    core.endGroup()
    return results
  }

  for (const exchangeRate of dataset.ExchangeRateDataSet.ExchangeRate) {
    core.info(`exchangeRate: ${exchangeRate}`)

    const { CurrencyCodeAlfaChar, BuyingRate, SellingRate } = exchangeRate
    if (!CurrencyCodeAlfaChar || !BuyingRate || !SellingRate) continue

    results.push({
      currencyCode: CurrencyCodeAlfaChar,
      buyingRate: BuyingRate,
      sellingRate: SellingRate,
    })
  }

  core.endGroup()

  return results
}

export default parseSOAPResponse