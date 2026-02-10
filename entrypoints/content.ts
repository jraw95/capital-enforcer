import { toUppercasePreserveEszett } from '@/utils/uppercase'

type TextField = HTMLInputElement | HTMLTextAreaElement

interface FieldHandlers {
  input: () => void
  paste: (e: ClipboardEvent) => void
}

const handlerMap = new WeakMap<TextField, FieldHandlers>()
const processedFields = new Set<TextField>()
let observer: MutationObserver | null = null

export function enforceUppercase(element: TextField): void {
  const start = element.selectionStart
  const end = element.selectionEnd
  element.value = toUppercasePreserveEszett(element.value)
  if (start !== null && end !== null) {
    element.setSelectionRange(start, end)
  }
}

export function attachListeners(field: TextField): void {
  if (handlerMap.has(field)) return

  const inputHandler = (): void => {
    enforceUppercase(field)
  }

  const pasteHandler = (e: ClipboardEvent): void => {
    e.preventDefault()
    const pastedText = e.clipboardData?.getData('text') ?? ''
    const start = field.selectionStart ?? 0
    const end = field.selectionEnd ?? 0
    const currentValue = field.value

    field.value =
      currentValue.substring(0, start) +
      toUppercasePreserveEszett(pastedText) +
      currentValue.substring(end)

    const newPosition = start + pastedText.length
    field.setSelectionRange(newPosition, newPosition)
    field.dispatchEvent(new Event('input', { bubbles: true }))
  }

  field.addEventListener('input', inputHandler)
  field.addEventListener('paste', pasteHandler)
  handlerMap.set(field, { input: inputHandler, paste: pasteHandler })
  processedFields.add(field)

  if (field.value) {
    enforceUppercase(field)
  }
}

export function detachListeners(field: TextField): void {
  const handlers = handlerMap.get(field)
  if (!handlers) return
  field.removeEventListener('input', handlers.input)
  field.removeEventListener('paste', handlers.paste)
  handlerMap.delete(field)
  processedFields.delete(field)
}

function isTextField(el: Element): el is TextField {
  return (
    (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'text') ||
    el.tagName === 'TEXTAREA'
  )
}

function processAllTextFields(): void {
  const fields = document.querySelectorAll<TextField>(
    'input[type="text"], textarea',
  )
  fields.forEach((field) => attachListeners(field))
}

function startObserver(): void {
  if (observer) return
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue
        const el = node as Element
        if (isTextField(el)) {
          attachListeners(el)
        }
        el.querySelectorAll<TextField>('input[type="text"], textarea').forEach(
          (field) => attachListeners(field),
        )
      }
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

function stopObserver(): void {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

function activate(): void {
  processAllTextFields()
  startObserver()
}

function deactivate(): void {
  stopObserver()
  for (const field of processedFields) {
    detachListeners(field)
  }
}

export default defineContentScript({
  matches: ['https://test-trackingplus.acc-cjs.net/*'],
  runAt: 'document_end',

  main() {
    chrome.storage.local.get({ enabled: true }, (result) => {
      if (result.enabled) {
        activate()
      }
    })

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes.enabled) return
      if (changes.enabled.newValue) {
        activate()
      } else {
        deactivate()
      }
    })
  },
})
