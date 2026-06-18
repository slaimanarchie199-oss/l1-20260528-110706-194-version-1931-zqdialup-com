
async function initPlayers() {
  const videos = Array.from(document.querySelectorAll('video[data-hls-src]'));
  if (!videos.length) return;
  let HlsCtor = null;
  try {
    const mod = await import('./hls-vendor.js');
    HlsCtor = mod.H;
  } catch (err) {
    console.warn('HLS module load failed:', err);
  }

  videos.forEach((video) => {
    const src = video.dataset.hlsSrc;
    const wrap = video.closest('.player-wrap');
    const overlay = wrap ? wrap.querySelector('[data-play-overlay]') : null;

    const showOverlay = () => {
      if (overlay) overlay.hidden = false;
    };
    const hideOverlay = () => {
      if (overlay) overlay.hidden = true;
    };

    if (HlsCtor && HlsCtor.isSupported()) {
      const hls = new HlsCtor({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video.dataset.hlsAttached = '1';
    } else if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);

    if (overlay) {
      overlay.addEventListener('click', () => {
        video.play().catch(() => {});
      });
    }
  });
}

function normalize(text) {
  return (text || '').toLowerCase().trim();
}

function applyFilter(input, grid, cards) {
  const query = normalize(input.value);
  let visible = 0;
  cards.forEach((card) => {
    const hay = card.dataset.search || '';
    const match = !query || hay.includes(query);
    card.classList.toggle('hidden', !match);
    if (match) visible += 1;
  });
  const counter = input.closest('[data-filter-shell]')?.querySelector('[data-filter-count]');
  if (counter) counter.textContent = String(visible);
}

function initFilterBoxes() {
  document.querySelectorAll('[data-filter-input]').forEach((input) => {
    const selector = input.dataset.filterTarget;
    const grid = document.querySelector(selector);
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('[data-card]'));
    input.addEventListener('input', () => applyFilter(input, grid, cards));
    applyFilter(input, grid, cards);
  });
}

function sortCards(grid, mode) {
  const cards = Array.from(grid.querySelectorAll('[data-card]'));
  const compare = {
    newest: (a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0),
    oldest: (a, b) => Number(a.dataset.year || 0) - Number(b.dataset.year || 0),
    title: (a, b) => (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN'),
    region: (a, b) => (a.dataset.region || '').localeCompare(b.dataset.region || '', 'zh-Hans-CN'),
  }[mode] || ((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
  cards.sort(compare).forEach((card) => grid.appendChild(card));
}

function initSortBoxes() {
  document.querySelectorAll('[data-sort-select]').forEach((select) => {
    const selector = select.dataset.sortTarget;
    const grid = document.querySelector(selector);
    if (!grid) return;
    select.addEventListener('change', () => sortCards(grid, select.value));
  });
}

function initFilterButtons() {
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const grid = document.querySelector(group.dataset.filterTarget);
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('[data-card]'));
    const buttons = Array.from(group.querySelectorAll('[data-filter-btn]'));
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const value = (btn.dataset.filterBtn || 'all').toLowerCase();
        cards.forEach((card) => {
          const text = card.dataset.search || '';
          const match = value === 'all' || text.includes(value);
          card.classList.toggle('hidden', !match);
        });
        const counter = group.querySelector('[data-filter-count]');
        if (counter) counter.textContent = String(cards.filter((c) => !c.classList.contains('hidden')).length);
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFilterBoxes();
  initSortBoxes();
  initFilterButtons();
  initPlayers();
});
