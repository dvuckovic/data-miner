import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import generateFeed from './generateFeed'

import type { Result } from './parseThree'

const fixtureJson: Result = JSON.parse(
  readFileSync(resolve(__dirname, '__fixtures__', 'fcast3.json'), 'utf8'),
)

describe('generateFeed', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-12-26T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders RSS feed from passed JSON input', () => {
    const xml = generateFeed(fixtureJson)

    expect(xml).toBeTypeOf('string')
    expect(xml).toContain('<rss')
    expect(xml).toContain('<channel>')
    expect(xml).toContain('<title>RHMZ</title>')
    expect(xml).toContain('<description>Weather Forecast for Serbia</description>')
    expect(xml).toContain('© 2025 Copyright RHMZ Serbia')

    // One item per city in the fixture.
    expect(xml.match(/<item>/g)?.length).toBe(10)

    // Spot-check a known city item and its description content.
    expect(xml).toMatch(/<title><!\[CDATA\[Belgrade\]\]><\/title>/)
    expect(xml).toContain('fcast-7.png')
    expect(xml).toContain('Max: 2°C')
    expect(xml).toContain('Min: 0°C')
    expect(xml).toContain('Max: 4°C')

    // Ensure UTF-8 content survives (diacritics).
    expect(xml).toContain('Palić')
  })

  it('renders a single error item when status is not ok', () => {
    const errorJson: Result = {
      status: 'not_ok',
      e: 3,
    }

    const xml = generateFeed(errorJson)

    expect(xml).toBeTypeOf('string')
    expect(xml).toContain('<rss')
    expect(xml).toContain('<channel>')
    expect(xml).toContain('<title>RHMZ</title>')

    // Single error item.
    expect(xml.match(/<item>/g)?.length).toBe(1)
    expect(xml).toContain('<title><![CDATA[Error]]></title>')
    expect(xml).toContain('Error: 3')
  })
})
