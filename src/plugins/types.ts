interface PluginResult {
  data: unknown
  xml?: string
}

export interface Plugin {
  id: string
  execute: () => Promise<PluginResult>
}
