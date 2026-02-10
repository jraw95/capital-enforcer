# Capital Enforcer

A Chrome extension that forces all text inputs to uppercase across Veryon Tracking+.

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- Chrome or Chromium-based browser

## Setup

```bash
bun install
```

## Development

Start the development server with hot module replacement:

```bash
bun run dev
```

This opens Chrome with the extension loaded. Changes to source files are reflected immediately.

## Build

Create a production build:

```bash
bun run build
```

Output is written to `.output/chrome-mv3/`.

To build for Firefox:

```bash
bun run build:firefox
```

To create a distributable zip:

```bash
bun run zip
```

## Testing

Run the test suite:

```bash
bun run test
```

Run tests in watch mode:

```bash
bun run test:watch
```

## Loading the Extension

1. Run `bun run build`
2. Open `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the `.output/chrome-mv3/` directory

## Project Structure

```
├── entrypoints/
│   ├── content.ts              # Content script — uppercase enforcement
│   └── popup/
│       ├── index.html          # Popup HTML
│       ├── main.ts             # Popup toggle logic
│       └── style.css           # Tailwind CSS styles
├── utils/
│   └── uppercase.ts            # Shared uppercase utility
├── public/
│   └── icons/                  # Extension icons (16, 48, 128px)
├── tests/
│   ├── uppercase.test.ts       # Utility tests
│   ├── content.test.ts         # Content script tests
│   └── popup.test.ts           # Popup tests
├── wxt.config.ts               # WXT + Tailwind configuration
├── vitest.config.ts            # Test configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

## How It Works

The extension injects a content script into Veryon Tracking+ pages that:

1. Finds all `<input type="text">` and `<textarea>` elements
2. Attaches `input` and `paste` event listeners to enforce uppercase
3. Uses a `MutationObserver` to handle dynamically added fields
4. Preserves cursor position during transformation
5. Preserves the German Eszett (ß) character instead of converting to SS

The popup provides a toggle to enable/disable enforcement, persisted via `chrome.storage.local`.
