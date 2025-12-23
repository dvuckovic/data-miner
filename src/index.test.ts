import { vi, describe, it, expect } from 'vitest'

import { run } from './main'

vi.mock('./main')

describe('Entrypoint', () => {
  it('calls main function', async () => {
    vi.mocked(run)

    await import('./index')

    expect(run).toHaveBeenCalledOnce()
  })
})
