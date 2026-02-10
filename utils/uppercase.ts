/**
 * Converts text to uppercase while preserving the German Eszett (ß).
 *
 * Standard `String.prototype.toUpperCase()` converts ß → SS per Unicode rules,
 * which is undesirable for this extension's use case on Veryon Tracking+.
 */
export function toUppercasePreserveEszett(text: string): string {
  return text
    .split('')
    .map((c) => (c === 'ß' ? 'ß' : c.toUpperCase()))
    .join('')
}
