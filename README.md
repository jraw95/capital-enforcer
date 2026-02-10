# Capital Enforcer

Chrome extension that forces text inputs to uppercase on Veryon Tracking+.

## Install

Download the latest zip from [Releases](../../releases/latest), unzip, then load as an unpacked extension in `chrome://extensions/` (Developer mode).

## Development

Requires [Bun](https://bun.sh/).

```bash
bun install          # install dependencies
bun run dev          # dev mode with HMR
bun run build        # production build → .output/chrome-mv3/
bun run test         # run tests
bun run zip          # create distributable zip
```

## How It Works

A content script attaches `input` and `paste` listeners to all text fields, converting values to uppercase while preserving cursor position and the German Eszett (ß). A `MutationObserver` handles dynamically added fields. The popup provides a toggle persisted via `chrome.storage.local`.

## License

[MIT](LICENSE)
