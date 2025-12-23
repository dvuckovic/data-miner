import * as core from '@actions/core'

import parseThree from './fcast3/parseThree'
import generateFeed from './fcast3/generateFeed'

import type { Plugin } from './types'

const BASE_URL = 'https' + '://' + 'www' + '.' + 'hidmet' + '.' + 'gov' + '.' + 'rs'

export default {
  id: 'fcast3',

  execute: async () => {
    try {
      const fetchUrl = new URL('/ciril/prognoza/index.php', BASE_URL)

      core.info(`Fetching forecast from ${fetchUrl.href} ...`)

      const result = await fetch(fetchUrl.href)

      if (!result.ok) {
        core.setFailed(result.statusText)
        return {}
      }

      const body = await result.text()

      const data = parseThree(body)

      if (data.status === 'not_ok') {
        core.warning('Parsing exception...')
        core.warning(`e: ${data.e}`)
        core.startGroup('Source')
        core.info(body)
        core.endGroup()
      }

      const xml = generateFeed(data)

      return {
        data,
        xml,
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      core.setFailed(errorMessage)
      return {}
    }
  },
} as Plugin
