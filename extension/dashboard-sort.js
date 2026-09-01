// AJ Investment Research Enhancer — content script
// Runs inside the consolidated dashboard (Plotly Dash app) that the main
// site embeds as an iframe at /maindashboard/.
//
// Feature 1: click either "Ranking" header to sort rows by that ranking.
//   asc (rank 1 first) -> desc -> original order
// Feature 2: click either "1-Year Target Price" header to sort rows by the
//   upside % shown next to the target price (▲ = positive, ▼ = negative).
//   desc (highest upside first) -> asc -> original order
(function () {
  'use strict';

  const ROW_SEL = '.consolidated-row';
  const HEADER_SEL = '.consolidated-header';
  const VIEW_SEL = '.consolidated-view';
  const RANK_SEL = '.consolidated-rank__circle';
  const DELTA_SEL = '.consolidated-target__delta';

  // Sortable column types. `firstDir` is the direction used on first click:
  // rankings read best-first as ascending (1,2,3…), upside as descending.
  const SORT_TYPES = [
    { label: 'Ranking', firstDir: 'asc', value: rankOf },
    { label: '1-Year Target Price', firstDir: 'desc', value: upsideOf },
  ];

  // state: { type: index into SORT_TYPES, col: 0|1, dir: 'asc'|'desc' } or null
  let sortState = null;
  let originalOrder = null; // Array<HTMLElement>
  let headers = [];         // [{el, type, col}]

  function rowsContainer() {
    const row = document.querySelector(ROW_SEL);
    return row ? row.parentElement : null;
  }

  function viewOf(row, col) {
    return row.querySelectorAll(VIEW_SEL)[col] || null;
  }

  // Lower is better; missing values return null.
  function rankOf(row, col) {
    const view = viewOf(row, col);
    const circle = view && view.querySelector(RANK_SEL);
    const n = circle ? parseInt(circle.textContent.trim(), 10) : NaN;
    return Number.isFinite(n) ? n : null;
  }

  // Upside percentage as a signed number: "▲ 65%" -> 65, "▼ 24%" -> -24.
  function upsideOf(row, col) {
    const view = viewOf(row, col);
    const delta = view && view.querySelector(DELTA_SEL);
    if (!delta) return null;
    const m = delta.textContent.trim().match(/([▲▼])?\s*(-?[\d.]+)\s*%/);
    if (!m) return null;
    let n = parseFloat(m[2]);
    if (!Number.isFinite(n)) return null;
    if (m[1] === '▼' && n > 0) n = -n;
    return n;
  }

  function applySort() {
    const container = rowsContainer();
    if (!container) return;
    const rows = Array.from(container.querySelectorAll(':scope > ' + ROW_SEL));
    if (!rows.length) return;

    let ordered;
    if (!sortState) {
      ordered = (originalOrder || rows).filter(r => r.isConnected);
    } else {
      const { type, col, dir } = sortState;
      const valueFn = SORT_TYPES[type].value;
      const keyed = rows.map((row, i) => ({ row, v: valueFn(row, col), i }));
      keyed.sort((a, b) => {
        // rows without a value always sink to the bottom
        if (a.v === null && b.v === null) return a.i - b.i;
        if (a.v === null) return 1;
        if (b.v === null) return -1;
        if (a.v !== b.v) return dir === 'asc' ? a.v - b.v : b.v - a.v;
        return a.i - b.i; // stable
      });
      ordered = keyed.map(k => k.row);
    }

    // Re-append in order (moving nodes, not cloning, so Plotly graphs keep working)
    const frag = document.createDocumentFragment();
    ordered.forEach(r => frag.appendChild(r));
    container.appendChild(frag);

    headers.forEach(h => {
      const active = !!sortState && sortState.type === h.type && sortState.col === h.col;
      h.el.classList.toggle('ajx-sorted-asc', active && sortState.dir === 'asc');
      h.el.classList.toggle('ajx-sorted-desc', active && sortState.dir === 'desc');
    });
  }

  function onHeaderClick(type, col) {
    const firstDir = SORT_TYPES[type].firstDir;
    const secondDir = firstDir === 'asc' ? 'desc' : 'asc';
    if (!sortState || sortState.type !== type || sortState.col !== col) {
      sortState = { type, col, dir: firstDir };
    } else if (sortState.dir === firstDir) {
      sortState = { type, col, dir: secondDir };
    } else {
      sortState = null;
    }
    applySort();
  }

  function findHeaders() {
    const header = document.querySelector(HEADER_SEL);
    if (!header) return [];
    const found = [];
    SORT_TYPES.forEach((t, typeIdx) => {
      const els = Array.from(header.querySelectorAll('div')).filter(
        d => d.children.length === 0 && d.textContent.trim() === t.label
      );
      els.forEach((el, colIdx) => found.push({ el, type: typeIdx, col: colIdx }));
    });
    return found;
  }

  function init() {
    const found = findHeaders();
    const container = rowsContainer();
    // expect 2 Ranking + 2 Target Price headers
    if (found.length < 4 || !container) return false;

    headers = found;
    // Remember the page's native order (only re-capture if the rows were re-rendered)
    if (!originalOrder || !originalOrder.every(r => r.isConnected)) {
      originalOrder = Array.from(container.querySelectorAll(':scope > ' + ROW_SEL));
    }

    headers.forEach(h => {
      if (h.el.dataset.ajxBound) return;
      h.el.dataset.ajxBound = '1';
      h.el.classList.add('ajx-sortable');
      h.el.title = h.type === 0
        ? 'Click to sort by this ranking'
        : 'Click to sort by upside potential';
      h.el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onHeaderClick(h.type, h.col);
      });
    });
    return true;
  }

  // Dash renders asynchronously: wait for the table to appear, and re-bind if
  // the app ever re-renders the header/rows.
  let initialized = false;
  const tryInit = () => {
    const headerPresent = document.querySelector(HEADER_SEL + ' .ajx-sortable');
    if (!initialized || !headerPresent) {
      if (init()) {
        initialized = true;
        if (sortState) applySort();
      }
    }
  };

  const mo = new MutationObserver(() => {
    // cheap debounce
    clearTimeout(mo._t);
    mo._t = setTimeout(tryInit, 150);
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  tryInit();
})();
