import { describe, expect, it, beforeEach, vi } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import {
  enforceUppercase,
  attachListeners,
  detachListeners,
  isCombobox,
  isExempt,
  _setExemptSelectorsForTesting,
} from '@/entrypoints/content'

function createInput(value = ''): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'text'
  input.value = value
  document.body.appendChild(input)
  return input
}

function createTextarea(value = ''): HTMLTextAreaElement {
  const textarea = document.createElement('textarea')
  textarea.value = value
  document.body.appendChild(textarea)
  return textarea
}

describe('enforceUppercase', () => {
  it('converts input value to uppercase', () => {
    const input = createInput('hello')
    enforceUppercase(input)
    expect(input.value).toBe('HELLO')
  })

  it('preserves cursor position', () => {
    const input = createInput('hello')
    input.setSelectionRange(3, 3)
    enforceUppercase(input)
    expect(input.selectionStart).toBe(3)
    expect(input.selectionEnd).toBe(3)
  })

  it('preserves selection range', () => {
    const input = createInput('hello world')
    input.setSelectionRange(2, 7)
    enforceUppercase(input)
    expect(input.value).toBe('HELLO WORLD')
    expect(input.selectionStart).toBe(2)
    expect(input.selectionEnd).toBe(7)
  })

  it('works with textarea elements', () => {
    const textarea = createTextarea('hello')
    enforceUppercase(textarea)
    expect(textarea.value).toBe('HELLO')
  })
})

describe('attachListeners / detachListeners', () => {
  it('uppercases on input event', () => {
    const input = createInput()
    attachListeners(input)

    input.value = 'hello'
    input.dispatchEvent(new Event('input'))
    expect(input.value).toBe('HELLO')
  })

  it('does not double-attach listeners', () => {
    const input = createInput()
    attachListeners(input)
    attachListeners(input)

    input.value = 'test'
    input.dispatchEvent(new Event('input'))
    expect(input.value).toBe('TEST')
  })

  it('uppercases existing value on attach', () => {
    const input = createInput('existing')
    attachListeners(input)
    expect(input.value).toBe('EXISTING')
  })

  it('removes listeners on detach', () => {
    const input = createInput()
    attachListeners(input)
    detachListeners(input)

    input.value = 'hello'
    input.dispatchEvent(new Event('input'))
    expect(input.value).toBe('hello')
  })

  it('handles paste event with uppercase conversion', () => {
    const input = createInput('hello world')
    input.setSelectionRange(5, 5)
    attachListeners(input)

    const clipboardData = new DataTransfer()
    clipboardData.setData('text', ' there')
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData,
      cancelable: true,
    })

    input.dispatchEvent(pasteEvent)
    expect(pasteEvent.defaultPrevented).toBe(true)
  })

  it('detach is safe to call when not attached', () => {
    const input = createInput()
    expect(() => detachListeners(input)).not.toThrow()
  })
})

describe('enforceUppercase optimization', () => {
  it('skips .value set when already uppercase', () => {
    const input = createInput('HELLO')
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!
    const setter = vi.fn(descriptor.set!)
    Object.defineProperty(input, 'value', {
      get: descriptor.get!,
      set: setter,
      configurable: true,
    })

    enforceUppercase(input)
    expect(setter).not.toHaveBeenCalled()
  })

  it('sets .value when conversion is needed', () => {
    const input = createInput('hello')
    enforceUppercase(input)
    expect(input.value).toBe('HELLO')
  })
})

describe('isCombobox', () => {
  it('returns true for ruscombo_ prefix IDs', () => {
    const input = createInput()
    input.id = 'ruscombo_location'
    expect(isCombobox(input)).toBe(true)
  })

  it('returns false for other IDs', () => {
    const input = createInput()
    input.id = 'rustextarea_notes'
    expect(isCombobox(input)).toBe(false)
  })

  it('returns false for empty ID', () => {
    const input = createInput()
    expect(isCombobox(input)).toBe(false)
  })
})

describe('combobox fields are skipped', () => {
  function createCombobox(value = ''): HTMLInputElement {
    const input = createInput(value)
    input.id = 'ruscombo_location'
    return input
  }

  it('does not attach any listeners to combobox fields', () => {
    const combo = createCombobox()
    attachListeners(combo)

    combo.value = 'hello'
    combo.dispatchEvent(new Event('input'))
    expect(combo.value).toBe('hello')
  })

  it('does not uppercase existing value on attach', () => {
    const combo = createCombobox('hello')
    attachListeners(combo)
    expect(combo.value).toBe('hello')
  })
})

describe('exempt fields', () => {
  beforeEach(() => {
    _setExemptSelectorsForTesting([])
  })

  it('skips exempt fields', () => {
    _setExemptSelectorsForTesting(['#skip-me'])
    const input = createInput()
    input.id = 'skip-me'
    attachListeners(input)

    input.value = 'hello'
    input.dispatchEvent(new Event('input'))
    expect(input.value).toBe('hello')
  })

  it('attaches to non-exempt fields normally', () => {
    _setExemptSelectorsForTesting(['#skip-me'])
    const input = createInput()
    input.id = 'keep-me'
    attachListeners(input)

    input.value = 'hello'
    input.dispatchEvent(new Event('input'))
    expect(input.value).toBe('HELLO')
  })

  it('handles invalid selectors without crashing', () => {
    _setExemptSelectorsForTesting(['[invalid!!!'])
    const input = createInput()
    expect(() => attachListeners(input)).not.toThrow()
    expect(isExempt(input)).toBe(false)
  })

  it('supports class selectors', () => {
    _setExemptSelectorsForTesting(['.no-uppercase'])
    const input = createInput()
    input.classList.add('no-uppercase')
    expect(isExempt(input)).toBe(true)
  })

  it('supports attribute selectors', () => {
    _setExemptSelectorsForTesting(['[data-skip-caps]'])
    const input = createInput()
    input.setAttribute('data-skip-caps', '')
    expect(isExempt(input)).toBe(true)
  })
})

describe('storage integration', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  it('fakeBrowser storage is available', async () => {
    await fakeBrowser.storage.local.set({ enabled: true })
    const result = await fakeBrowser.storage.local.get('enabled')
    expect(result.enabled).toBe(true)
  })

  it('storage change events can be triggered', async () => {
    const listener = vi.fn()
    fakeBrowser.storage.onChanged.addListener(listener)

    await fakeBrowser.storage.local.set({ enabled: false })
    expect(listener).toHaveBeenCalled()
  })
})
