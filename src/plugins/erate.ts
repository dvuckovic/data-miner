import * as core from '@actions/core'

import getSOAPResponse from './erate/getSOAPResponse'
import parseSOAPResponse from './erate/parseSOAPResponse'

import type { Plugin } from './types'

export default {
  id: 'erate',

  execute: async () => {
    try {
      const response = await getSOAPResponse()
      const data = parseSOAPResponse(response)

      return { data }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      core.setFailed(errorMessage)
      return {}
    }
  },
} as Plugin
