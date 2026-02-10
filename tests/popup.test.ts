import { describe, expect, it, beforeEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing'
import { updateUI } from '@/entrypoints/popup/main'

function createToggle(): HTMLInputElement {
  const toggle = document.createElement('input')
  toggle.type = 'checkbox'
  toggle.id = 'toggle'
  return toggle
}

function createStatusText(): HTMLSpanElement {
  const span = document.createElement('span')
  span.id = 'status'
  return span
}

describe('updateUI', () => {
  it('sets checkbox to checked when enabled', () => {
    const toggle = createToggle()
    const status = createStatusText()

    updateUI(toggle, status, true)
    expect(toggle.checked).toBe(true)
    expect(status.textContent).toBe('Active')
  })

  it('sets checkbox to unchecked when disabled', () => {
    const toggle = createToggle()
    const status = createStatusText()

    updateUI(toggle, status, false)
    expect(toggle.checked).toBe(false)
    expect(status.textContent).toBe('Inactive')
  })
})

describe('popup storage integration', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  it('can read enabled state from storage', async () => {
    await fakeBrowser.storage.local.set({ enabled: true })
    const result = await fakeBrowser.storage.local.get({ enabled: true })
    expect(result.enabled).toBe(true)
  })

  it('can toggle enabled state in storage', async () => {
    await fakeBrowser.storage.local.set({ enabled: false })
    const result = await fakeBrowser.storage.local.get('enabled')
    expect(result.enabled).toBe(false)
  })
})
