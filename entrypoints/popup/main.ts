export function updateUI(
  toggle: HTMLInputElement,
  statusText: HTMLElement,
  enabled: boolean,
): void {
  toggle.checked = enabled
  statusText.textContent = enabled ? 'Active' : 'Inactive'
}

export function parseExemptSelectors(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function loadExemptUI(): void {
  const toggleBtn = document.getElementById('exempt-toggle')!
  const arrow = document.getElementById('exempt-arrow')!
  const panel = document.getElementById('exempt-panel')!
  const input = document.getElementById('exempt-input') as HTMLTextAreaElement
  const saveBtn = document.getElementById('exempt-save')!

  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('hidden')
    arrow.classList.toggle('open')
  })

  chrome.storage.local.get({ exemptSelectors: [] }, (result) => {
    input.value = (result.exemptSelectors as string[]).join('\n')
  })

  saveBtn.addEventListener('click', () => {
    const selectors = parseExemptSelectors(input.value)
    chrome.storage.local.set({ exemptSelectors: selectors })
  })
}

export function initPopup(): void {
  const toggle = document.getElementById('toggle') as HTMLInputElement
  const statusText = document.getElementById('status') as HTMLElement

  chrome.storage.local.get({ enabled: true }, (result) => {
    updateUI(toggle, statusText, result.enabled)
  })

  toggle.addEventListener('change', () => {
    const enabled = toggle.checked
    chrome.storage.local.set({ enabled })
    updateUI(toggle, statusText, enabled)
  })

  loadExemptUI()
}

if (!import.meta.env.VITEST) {
  initPopup()
}
