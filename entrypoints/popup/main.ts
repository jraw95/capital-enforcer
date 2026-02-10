export function updateUI(
  toggle: HTMLInputElement,
  statusText: HTMLElement,
  enabled: boolean,
): void {
  toggle.checked = enabled
  statusText.textContent = enabled ? 'Active' : 'Inactive'
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
}

if (!import.meta.env.VITEST) {
  initPopup()
}
