import { describe, expect, it } from 'vitest'
import { toUppercasePreserveEszett } from '@/utils/uppercase'

describe('toUppercasePreserveEszett', () => {
  it('converts lowercase text to uppercase', () => {
    expect(toUppercasePreserveEszett('hello world')).toBe('HELLO WORLD')
  })

  it('preserves German Eszett (ß)', () => {
    expect(toUppercasePreserveEszett('straße')).toBe('STRAßE')
  })

  it('handles already-uppercase text', () => {
    expect(toUppercasePreserveEszett('HELLO')).toBe('HELLO')
  })

  it('handles mixed case text', () => {
    expect(toUppercasePreserveEszett('HeLLo WoRLd')).toBe('HELLO WORLD')
  })

  it('returns empty string for empty input', () => {
    expect(toUppercasePreserveEszett('')).toBe('')
  })

  it('handles single character', () => {
    expect(toUppercasePreserveEszett('a')).toBe('A')
    expect(toUppercasePreserveEszett('ß')).toBe('ß')
  })

  it('preserves numbers and symbols', () => {
    expect(toUppercasePreserveEszett('test-123!')).toBe('TEST-123!')
  })

  it('handles multiple Eszett characters', () => {
    expect(toUppercasePreserveEszett('straße maße')).toBe('STRAßE MAßE')
  })
})
