import * as core from '@actions/core'

import getPlugins from './plugins'

export async function run(): Promise<void> {
  try {
    const plugins = await getPlugins()

    if (process.env.TEST_MODE === 'true') {
      core.info('Running in test mode...')
      core.info(`Loaded ${plugins.length} plugins`)
      core.info(`Plugins: ${plugins.map((p) => p.id).join(', ')}`)
      core.info('Skipping plugin execution in test mode')
      process.exit(core.ExitCode.Success)
    }

    const result = await Promise.all(
      plugins.map(async (plugin) => {
        const pluginResult = await plugin.execute()

        core.info(`Plugin ${plugin.id} executed with data`)

        return {
          id: plugin.id,
          data: pluginResult.data,
          xml: pluginResult.xml,
        }
      })
    )

    core.setOutput('result', result)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('Unknown error occurred')
    }
  }
}
