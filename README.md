# AJ++

A Chrome extension that adds missing quality-of-life features to the
[AJ Investment Research](https://www.ajinvestmentresearch.com/) dashboard.

> Unofficial community project — not affiliated with AJ Investment Research.
> It only rearranges what your own logged-in browser already displays; it does
> not scrape, store, or transmit any data.

The dashboard table on that page is actually a Plotly Dash app embedded as an
iframe from `https://consolidated.ajinvestmentresearch.com/`, so the content
script targets that origin with `all_frames: true`.

## Features

1. **Sort by ranking** — click either "Ranking" column header.
   - 1st click: ascending (rank 1 at top)
   - 2nd click: descending
   - 3rd click: back to the original (alphabetical) order

2. **Sort by upside** — click either "1-Year Target Price" column header to
   sort by the upside/downside % shown next to the target price
   (▲ = positive, ▼ = negative).
   - 1st click: highest upside at top
   - 2nd click: lowest first
   - 3rd click: back to the original order

An ▲/▼ indicator on the header shows the active sort column and direction.

## Install (unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select the `extension/` folder
4. Reload the dashboard page

After editing files, click the reload icon on the extension card and refresh the page.

## Files

- `extension/manifest.json` — MV3 manifest
- `extension/dashboard-sort.js` — content script (sorting)
- `extension/dashboard-sort.css` — header hover/sort indicator styles

## License

MIT
