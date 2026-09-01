# AJ++

A browser extension that adds missing quality-of-life features to the
[AJ Investment Research](https://www.ajinvestmentresearch.com/) dashboard.

> Unofficial community project — not affiliated with AJ Investment Research.
> It only rearranges data already displayed in your logged-in browser; it does
> not scrape, store, or transmit any data.

The dashboard table on that page is a Plotly Dash app embedded as an iframe
from `https://consolidated.ajinvestmentresearch.com/`, so the content script
targets that origin with `all_frames: true`.

## Features

1. **Sort by ranking** — click either "Ranking" column header.
   - 1st click: ascending (rank 1 at top)
   - 2nd click: descending
   - 3rd click: back to the original order

2. **Sort by upside** — click either "1-Year Target Price" column header to
   sort by the upside/downside percentage shown next to the target price
   (▲ = positive, ▼ = negative).
   - 1st click: highest upside at top
   - 2nd click: lowest first
   - 3rd click: back to the original order

An ▲/▼ indicator on the header shows the active sort column and direction.

## Installation

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Select **This Firefox**
3. Click **Load Temporary Add-on...**
4. Select `extension/manifest.json`
5. Reload the AJ Investment Research dashboard.

The extension will remain installed until Firefox is restarted or the
temporary extension is removed.

### Chrome / Chromium

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Reload the AJ Investment Research dashboard.

After editing files, reload the extension from the browser's extension
management page and refresh the dashboard.

## Development

The extension uses Manifest V3 and currently consists of:

- `extension/manifest.json` — browser extension manifest
- `extension/dashboard-sort.js` — content script containing the sorting logic
- `extension/dashboard-sort.css` — header hover and sort indicator styles

The content script uses standard browser DOM APIs and does not depend on
Chrome-specific extension APIs.

## License

MIT
