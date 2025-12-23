import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

import parseThree from './parseThree'

describe('parseThree', () => {
  beforeEach(() => {
    // The module parses dates without year (DD.MM.), so we freeze time before each example
    //   to the year matching the captured fixture HTML.
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('parses 2-day layout, no tmin on day1', () => {
    vi.setSystemTime(new Date('2025-12-26T12:00:00.000Z'))

    const fixtureHtml = readFileSync(
      resolve(__dirname, '__fixtures__', 'index-2-day-no-tmin.html'),
      'utf8',
    )

    const result = parseThree(fixtureHtml)

    expect(result.status).toBe('ok')
    expect(result.data).toBeDefined()

    const data = result.data!

    expect(Object.keys(data).sort()).toEqual(
      [
        '13067', // Palić
        '13168', // Novi Sad
        '13262', // Loznica
        '13274', // Belgrade
        '13278', // Kragujevac
        '13295', // Negotin
        '13367', // Zlatibor
        '13376', // Kraljevo
        '13378', // Pristina
        '13388', // Niš
      ].sort(),
    )

    // The captured page is a 2-day layout where day1 omits tmin.
    expect(data['13274'].days).toBe(2)
    expect(data['13274'].date).toBe('2025-12-26')
    expect(data['13274'].time).toBe('05:10')
    expect(data['13274'].day1).toEqual({
      date: '2025-12-26',
      tmin: null,
      tmax: '2',
      type: '7',
    })
    expect(data['13274'].day2).toEqual({
      date: '2025-12-27',
      tmin: '0',
      tmax: '4',
      type: '4',
    })

    // Spot-check another city to ensure rows are parsed correctly.
    expect(data['13168'].day1).toMatchObject({ tmin: null, tmax: '4', type: '10' })
    expect(data['13168'].day2).toMatchObject({ tmin: '-1', tmax: '4', type: '4' })
  })

  it('parses 3-day layout, no tmin on day1', () => {
    vi.setSystemTime(new Date('2025-12-26T14:00:00.000Z'))

    const fixtureHtml = readFileSync(
      resolve(__dirname, '__fixtures__', 'index-3-day-no-tmin.html'),
      'utf8',
    )

    const result = parseThree(fixtureHtml)

    expect(result.status).toBe('ok')
    expect(result.data).toBeDefined()

    const data = result.data!

    expect(Object.keys(data).sort()).toEqual(
      [
        '13067', // Palić
        '13168', // Novi Sad
        '13262', // Loznica
        '13274', // Belgrade
        '13278', // Kragujevac
        '13295', // Negotin
        '13367', // Zlatibor
        '13376', // Kraljevo
        '13378', // Pristina
        '13388', // Niš
      ].sort(),
    )

    // The captured page is a 3-day layout where day1 omits tmin.
    expect(data['13274'].days).toBe(3)
    expect(data['13274'].date).toBe('2025-12-26')
    expect(data['13274'].time).toBe('11:42')
    expect(data['13274'].day1).toEqual({
      date: '2025-12-26',
      tmin: null,
      tmax: '2',
      type: '7',
    })
    expect(data['13274'].day2).toEqual({
      date: '2025-12-27',
      tmin: '0',
      tmax: '4',
      type: '4',
    })
    expect(data['13274'].day3).toEqual({
      date: '2025-12-28',
      tmin: '0',
      tmax: '4',
      type: '10',
    })

    // Spot-check another city to ensure rows are parsed correctly.
    expect(data['13168'].day1).toMatchObject({ tmin: null, tmax: '4', type: '10' })
    expect(data['13168'].day2).toMatchObject({ tmin: '-1', tmax: '4', type: '4' })
    expect(data['13168'].day3).toMatchObject({ tmin: '-1', tmax: '5', type: '4' })
  })
})
