'use strict';

// ============================================================
//  DATA
// ============================================================

const BOARD_META = {
  starting:          { name: 'Starting Board',        icon: '⭐', legendaryId: 'starting_legendary',          rareIds: ['rare_starting_1','rare_starting_2','rare_starting_3','rare_starting_4'] },
  deadly_ambush:     { name: 'Deadly Ambush',         icon: '💥', legendaryId: 'deadly_ambush_legendary',     rareIds: ['rare_deadly_ambush_1','rare_deadly_ambush_2','rare_deadly_ambush_3','rare_deadly_ambush_4','rare_deadly_ambush_5','rare_deadly_ambush_6'] },
  eldritch_bounty:   { name: 'Eldritch Bounty',       icon: '✨', legendaryId: 'eldritch_bounty_legendary',   rareIds: ['rare_eldritch_bounty_1','rare_eldritch_bounty_2','rare_eldritch_bounty_3','rare_eldritch_bounty_4','rare_eldritch_bounty_5','rare_eldritch_bounty_6'] },
  cheap_shot:        { name: 'Cheap Shot',            icon: '🎯', legendaryId: 'cheap_shot_legendary',        rareIds: ['rare_cheap_shot_1','rare_cheap_shot_2','rare_cheap_shot_3','rare_cheap_shot_4','rare_cheap_shot_5','rare_cheap_shot_6'] },
  no_witnesses:      { name: 'No Witnesses',          icon: '☠️', legendaryId: 'no_witnesses_legendary',      rareIds: ['rare_no_witnesses_1','rare_no_witnesses_2','rare_no_witnesses_3','rare_no_witnesses_4','rare_no_witnesses_5','rare_no_witnesses_6'] },
  cunning_stratagem: { name: 'Cunning Stratagem',     icon: '🧠', legendaryId: 'cunning_stratagem_legendary', rareIds: ['rare_cunning_stratagem_1','rare_cunning_stratagem_2','rare_cunning_stratagem_3','rare_cunning_stratagem_4','rare_cunning_stratagem_5','rare_cunning_stratagem_6'] },
  tricks_of_trade:   { name: 'Tricks of the Trade',   icon: '🃏', legendaryId: 'tricks_legendary',            rareIds: ['rare_tricks_1','rare_tricks_2','rare_tricks_3','rare_tricks_4','rare_tricks_5','rare_tricks_6'] },
  exploit_weakness:  { name: 'Exploit Weakness',      icon: '💢', legendaryId: 'exploit_legendary',           rareIds: ['rare_exploit_weakness_1','rare_exploit_weakness_2','rare_exploit_weakness_3','rare_exploit_weakness_4','rare_exploit_weakness_5','rare_exploit_weakness_6'] },
  leyrana_instinct:  { name: "Leyrana's Instinct",    icon: '👁️', legendaryId: 'leyrana_instinct_legendary',  rareIds: ['rare_leyrana_instinct_1','rare_leyrana_instinct_2','rare_leyrana_instinct_3','rare_leyrana_instinct_4','rare_leyrana_instinct_5','rare_leyrana_instinct_6'] },
  danse_macabre:     { name: 'Danse Macabre',         icon: '💃', legendaryId: 'danse_macabre_legendary',    rareIds: ['rare_danse_macabre_1','rare_danse_macabre_2','rare_danse_macabre_3','rare_danse_macabre_4','rare_danse_macabre_5','rare_danse_macabre_6'] },
};

const MAX_POINTS = 220;

// ============================================================
//  STATE
// ============================================================

const state = {
  boards: ['starting'],
  boardData: {
    starting: { glyphId: null, activeRares: new Set() }
  }
};

// Loaded paragon data
let DATA = {};

// ============================================================
//  LOAD DATA
// ============================================================

async function loadData() {
  try {
    const res = await fetch('paragon-data.json');
    DATA = await res.json();
  } catch (e) {
    DATA = { glyphs: [], legendaryNodes: {}, rareNodes: {} };
  }
  init();
}

// ============================================================
//  STATS CALCULATION
// ============================================================

function calcStats() {
  const t = {
    dexterity: 0, strength: 0, intelligence: 0, willpower: 0,
    life: 0, armor: 0, damage: 0, vulnerable: 0, critdmg: 0, poison: 0, trap: 0
  };

  state.boards.forEach(function(bid) {
    const bdata = state.boardData[bid];
    const base = bid === 'starting' ? 40 : 75;
    t.dexterity += Math.floor(base * 0.5);
    t.strength  += Math.floor(base * 0.15);

    bdata.activeRares.forEach(function(rid) {
      const rn = DATA.rareNodes && DATA.rareNodes[rid];
      if (rn && rn.bonus) {
        Object.entries(rn.bonus).forEach(function([k, v]) {
          t[k] = (t[k] || 0) + v;
        });
      }
    });

    if (bdata.glyphId) {
      const g = DATA.glyphs && DATA.glyphs.find(function(g) { return g.id === bdata.glyphId; });
      if (g) applyGlyph(g, t);
    }
  });

  // Derived
  t.damage     += Math.floor(t.dexterity * 0.12);
  t.critdmg    += Math.floor(t.dexterity * 0.09);
  t.vulnerable += Math.floor(t.intelligence * 0.07);
  t.life       += Math.floor(t.willpower * 2);
  t.armor      += Math.floor(t.strength * 0.6);
  t.poison     += Math.floor((t.dexterity + t.intelligence) * 0.04);
  t.trap       += Math.floor(t.dexterity * 0.07);
  return t;
}

function applyGlyph(g, t) {
  const bonus = 17;
  const map = {
    headhunter: 'damage', ambush: 'trap', bane_rogue: 'poison', canny: 'damage',
    chip: 'damage', closer: 'damage', combat: 'critdmg', control_rogue: 'damage',
    devious: 'damage', diminish: 'damage', efficacy: 'damage', exploit_rogue: 'vulnerable',
    explosive: 'damage', fluidity: 'damage', frostfeeder: 'damage', infusion: 'damage',
    nightstalker: 'poison', pride: 'damage', ranger: 'damage', snare: 'trap',
    tracker_rogue: 'poison', turf: 'armor', versatility: 'damage',
  };
  const key = map[g.id] || 'damage';
  t[key] = (t[key] || 0) + bonus;
}

function calcPointsUsed() {
  let used = 0;
  state.boards.forEach(function(bid) {
    const base = bid === 'starting' ? 40 : 75;
    used += base + (state.boardData[bid].activeRares.size);
  });
  return used;
}

// ============================================================
//  SHARE CODE
// ============================================================

function buildShareCode() {
  const d = {
    v: 2,
    b: state.boards.map(function(bid) {
      return {
        id: bid,
        g: state.boardData[bid].glyphId,
        r: Array.from(state.boardData[bid].activeRares),
      };
    })
  };
  return btoa(encodeURIComponent(JSON.stringify(d)));
}

function loadShareCode(code) {
  const d = JSON.parse(decodeURIComponent(atob(code)));
  if (d.v !== 2 || !Array.isArray(d.b)) throw new Error('Invalid share code');
  state.boards = [];
  state.boardData = {};
  d.b.forEach(function(bd) {
    if (!BOARD_META[bd.id]) return;
    state.boards.push(bd.id);
    state.boardData[bd.id] = { glyphId: bd.g || null, activeRares: new Set(bd.r || []) };
  });
  if (!state.boards.includes('starting')) {
    state.boards.unshift('starting');
    state.boardData.starting = { glyphId: null, activeRares: new Set() };
  }
}

// ============================================================
//  RENDER
// ============================================================

function render() {
  renderChips();
  renderBoards();
  renderStats();
}

// --- Chips ---

function renderChips() {
  const scroll = document.getElementById('chips-scroll');
  // Remove all existing chips (but not the add button)
  const existing = scroll.querySelectorAll('.chip:not(.chip-add)');
  existing.forEach(function(el) { el.remove(); });

  const addBtn = scroll.querySelector('.chip-add');

  state.boards.forEach(function(bid, idx) {
    const meta = BOARD_META[bid];
    if (!meta) return;
    const chip = document.createElement('button');
    chip.className = 'chip chip-active';
    chip.textContent = meta.icon + ' ' + meta.name;
    chip.setAttribute('aria-label', 'Jump to ' + meta.name);
    chip.addEventListener('click', function() {
      const card = document.getElementById('card-' + bid);
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    scroll.insertBefore(chip, addBtn);
  });
}

// --- Board cards ---

function renderBoards() {
  const list = document.getElementById('boards-list');
  list.innerHTML = '';

  state.boards.forEach(function(bid, idx) {
    const card = buildBoardCard(bid, idx);
    list.appendChild(card);
  });
}

function buildBoardCard(bid, idx) {
  const meta = BOARD_META[bid];
  const bdata = state.boardData[bid];
  const legNode = DATA.legendaryNodes && DATA.legendaryNodes[meta.legendaryId];
  const isStarting = bid === 'starting';

  const card = document.createElement('div');
  card.className = 'board-card';
  card.id = 'card-' + bid;

  // --- Header ---
  const header = document.createElement('div');
  header.className = 'card-header';
  header.setAttribute('role', 'button');
  header.setAttribute('tabindex', '0');
  header.setAttribute('aria-expanded', 'true');

  const badge = document.createElement('span');
  badge.className = 'card-badge';
  badge.textContent = String(idx + 1);

  const icon = document.createElement('span');
  icon.className = 'card-icon';
  icon.textContent = meta.icon;

  const title = document.createElement('span');
  title.className = 'card-title';
  title.textContent = meta.name;

  const chevron = document.createElement('span');
  chevron.className = 'card-chevron';
  chevron.textContent = '▾'; // down-pointing triangle

  header.appendChild(badge);
  header.appendChild(icon);
  header.appendChild(title);
  if (!isStarting) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-icon';
    removeBtn.style.cssText = 'width:36px;height:36px;color:var(--txt2);font-size:15px;';
    removeBtn.setAttribute('aria-label', 'Remove ' + meta.name);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      removeBoard(bid);
    });
    header.appendChild(removeBtn);
  }
  header.appendChild(chevron);

  header.addEventListener('click', function() {
    card.classList.toggle('collapsed');
    const expanded = !card.classList.contains('collapsed');
    header.setAttribute('aria-expanded', String(expanded));
  });

  card.appendChild(header);

  // --- Body ---
  const body = document.createElement('div');
  body.className = 'card-body';

  // Legendary section
  if (legNode) {
    const legSec = document.createElement('div');
    legSec.className = 'card-section legendary-section';

    const secLabel = document.createElement('div');
    secLabel.className = 'section-label';
    secLabel.textContent = 'Legendary Node';

    const legName = document.createElement('div');
    legName.className = 'legendary-name';
    legName.textContent = legNode.name;

    const legDesc = document.createElement('div');
    legDesc.className = 'legendary-desc';
    legDesc.textContent = legNode.description;

    legSec.appendChild(secLabel);
    legSec.appendChild(legName);
    legSec.appendChild(legDesc);
    body.appendChild(legSec);
  }

  // Glyph section
  const glyphSec = document.createElement('div');
  glyphSec.className = 'card-section';

  const glyphLabel = document.createElement('div');
  glyphLabel.className = 'section-label';
  glyphLabel.textContent = 'Glyph';

  const glyphSelect = document.createElement('select');
  glyphSelect.className = 'glyph-select';
  glyphSelect.setAttribute('aria-label', 'Select glyph for ' + meta.name);

  const noneOpt = document.createElement('option');
  noneOpt.value = '';
  noneOpt.textContent = '-- No Glyph --';
  glyphSelect.appendChild(noneOpt);

  if (DATA.glyphs) {
    DATA.glyphs.forEach(function(g) {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = '⬡ ' + g.name + ' (r' + g.radius + ')';
      if (g.id === bdata.glyphId) opt.selected = true;
      glyphSelect.appendChild(opt);
    });
  }

  const glyphInfo = document.createElement('div');
  glyphInfo.className = 'glyph-info';
  glyphInfo.hidden = !bdata.glyphId;

  function updateGlyphInfo(gid) {
    if (!gid || !DATA.glyphs) {
      glyphInfo.hidden = true;
      return;
    }
    const g = DATA.glyphs.find(function(g) { return g.id === gid; });
    if (!g) {
      glyphInfo.hidden = true;
      return;
    }
    glyphInfo.hidden = false;
    glyphInfo.innerHTML = '';
    if (g.description) {
      const d = document.createElement('div');
      d.className = 'glyph-info-desc';
      d.textContent = g.description;
      glyphInfo.appendChild(d);
    }
    if (g.bonusEffect) {
      const b = document.createElement('div');
      b.className = 'glyph-info-bonus';
      b.textContent = '★ ' + g.bonusEffect;
      glyphInfo.appendChild(b);
    }
  }

  // Initial render
  if (bdata.glyphId) updateGlyphInfo(bdata.glyphId);

  glyphSelect.addEventListener('change', function() {
    const gid = glyphSelect.value || null;
    state.boardData[bid].glyphId = gid;
    updateGlyphInfo(gid);
    renderStats();
  });

  glyphSec.appendChild(glyphLabel);
  glyphSec.appendChild(glyphSelect);
  glyphSec.appendChild(glyphInfo);
  body.appendChild(glyphSec);

  // Rare nodes section
  if (meta.rareIds && meta.rareIds.length > 0) {
    const rareSec = document.createElement('div');
    rareSec.className = 'card-section';

    const rareLabel = document.createElement('div');
    rareLabel.className = 'section-label';
    rareLabel.textContent = 'Rare Nodes';

    rareSec.appendChild(rareLabel);

    meta.rareIds.forEach(function(rid) {
      const rn = DATA.rareNodes && DATA.rareNodes[rid];
      if (!rn) return;

      const row = document.createElement('div');
      row.className = 'rare-node-row' + (bdata.activeRares.has(rid) ? ' active' : '');
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.setAttribute('aria-pressed', String(bdata.activeRares.has(rid)));

      const check = document.createElement('div');
      check.className = 'rare-check';
      const mark = document.createElement('span');
      mark.className = 'rare-check-mark';
      mark.textContent = '✓';
      check.appendChild(mark);

      const textWrap = document.createElement('div');
      textWrap.className = 'rare-node-text';

      const rName = document.createElement('div');
      rName.className = 'rare-node-name';
      rName.textContent = rn.name;

      const rDesc = document.createElement('div');
      rDesc.className = 'rare-node-desc';
      rDesc.textContent = rn.description;

      textWrap.appendChild(rName);
      textWrap.appendChild(rDesc);
      row.appendChild(check);
      row.appendChild(textWrap);

      function toggleRare() {
        if (bdata.activeRares.has(rid)) {
          bdata.activeRares.delete(rid);
          row.classList.remove('active');
          row.setAttribute('aria-pressed', 'false');
        } else {
          bdata.activeRares.add(rid);
          row.classList.add('active');
          row.setAttribute('aria-pressed', 'true');
        }
        renderStats();
        updatePointsBar();
      }

      row.addEventListener('click', toggleRare);
      row.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRare(); }
      });

      rareSec.appendChild(row);
    });

    body.appendChild(rareSec);
  }

  card.appendChild(body);
  return card;
}

// --- Stats bar ---

function renderStats() {
  const stats = calcStats();
  updatePointsBar();

  // Summary line
  const summary = document.getElementById('stats-summary');
  summary.textContent =
    'DEX ' + stats.dexterity +
    '  DMG +' + stats.damage + '%' +
    '  CRIT +' + stats.critdmg + '%' +
    '  VUL +' + stats.vulnerable + '%';

  // Expanded grid
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';

  const statDefs = [
    { key: 'dexterity',   label: 'DEX',  fmt: function(v) { return String(v); } },
    { key: 'strength',    label: 'STR',  fmt: function(v) { return String(v); } },
    { key: 'intelligence',label: 'INT',  fmt: function(v) { return String(v); } },
    { key: 'willpower',   label: 'WIL',  fmt: function(v) { return String(v); } },
    { key: 'life',        label: 'LIFE', fmt: function(v) { return '+' + v; } },
    { key: 'armor',       label: 'ARM',  fmt: function(v) { return '+' + v; } },
    { key: 'damage',      label: 'DMG',  fmt: function(v) { return '+' + v + '%'; } },
    { key: 'critdmg',     label: 'CRIT', fmt: function(v) { return '+' + v + '%'; } },
    { key: 'vulnerable',  label: 'VUL',  fmt: function(v) { return '+' + v + '%'; } },
    { key: 'poison',      label: 'PSN',  fmt: function(v) { return '+' + v + '%'; } },
    { key: 'trap',        label: 'TRAP', fmt: function(v) { return '+' + v + '%'; } },
  ];

  statDefs.forEach(function(def) {
    const val = stats[def.key] || 0;
    const item = document.createElement('div');
    item.className = 'stat-item';

    const name = document.createElement('span');
    name.className = 'stat-item-name';
    name.textContent = def.label;

    const value = document.createElement('span');
    value.className = 'stat-item-value';
    value.textContent = def.fmt(val);

    item.appendChild(name);
    item.appendChild(value);
    grid.appendChild(item);
  });
}

function updatePointsBar() {
  const used = calcPointsUsed();
  const pct = Math.min(100, Math.round(used / MAX_POINTS * 100));
  const el = document.getElementById('points-used');
  const fill = document.getElementById('points-bar-fill');
  if (el) el.textContent = String(used);
  if (fill) fill.style.width = pct + '%';
}

// ============================================================
//  ADD / REMOVE BOARDS
// ============================================================

function addBoard(bid) {
  if (state.boards.includes(bid)) return;
  state.boards.push(bid);
  state.boardData[bid] = { glyphId: null, activeRares: new Set() };
  render();
  closeAllSheets();
}

function removeBoard(bid) {
  if (bid === 'starting') return;
  state.boards = state.boards.filter(function(b) { return b !== bid; });
  delete state.boardData[bid];
  render();
}

// ============================================================
//  MODALS / SHEETS
// ============================================================

let statsExpanded = false;

function openSheet(sheetId) {
  const overlay = document.getElementById('modal-overlay');
  const sheet = document.getElementById(sheetId);
  overlay.hidden = false;
  sheet.hidden = false;
}

function closeAllSheets() {
  document.getElementById('modal-overlay').hidden = true;
  document.querySelectorAll('.bottom-sheet').forEach(function(s) { s.hidden = true; });
}

function openAddBoardSheet() {
  const list = document.getElementById('add-board-list');
  list.innerHTML = '';

  Object.entries(BOARD_META).forEach(function([bid, meta]) {
    const legNode = DATA.legendaryNodes && DATA.legendaryNodes[meta.legendaryId];
    const alreadyAdded = state.boards.includes(bid);

    const row = document.createElement('div');
    row.className = 'add-board-row' + (alreadyAdded ? ' already-added' : '');

    const iconEl = document.createElement('span');
    iconEl.className = 'add-board-icon';
    iconEl.textContent = meta.icon;

    const info = document.createElement('div');
    info.className = 'add-board-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'add-board-name';
    nameEl.textContent = meta.name;

    info.appendChild(nameEl);

    if (legNode) {
      const legEl = document.createElement('div');
      legEl.className = 'add-board-legendary';
      legEl.textContent = legNode.name;
      info.appendChild(legEl);
    }

    row.appendChild(iconEl);
    row.appendChild(info);

    if (alreadyAdded) {
      const checkEl = document.createElement('span');
      checkEl.className = 'add-board-check';
      checkEl.textContent = '✓ Added';
      row.appendChild(checkEl);
    }

    if (!alreadyAdded) {
      row.addEventListener('click', function() {
        addBoard(bid);
      });
    }

    list.appendChild(row);
  });

  openSheet('sheet-add-board');
}

function openShareSheet() {
  const codeOut = document.getElementById('share-code-out');
  codeOut.value = buildShareCode();
  const errEl = document.getElementById('share-error');
  errEl.hidden = true;
  const confirmEl = document.getElementById('copy-confirm');
  confirmEl.hidden = true;
  document.getElementById('share-code-in').value = '';
  openSheet('sheet-share');
}

// ============================================================
//  RESET
// ============================================================

function resetState() {
  if (!window.confirm('Reset all boards and start over?')) return;
  state.boards = ['starting'];
  state.boardData = { starting: { glyphId: null, activeRares: new Set() } };
  render();
}

// ============================================================
//  STATS BAR TOGGLE
// ============================================================

function toggleStats() {
  statsExpanded = !statsExpanded;
  const bar = document.getElementById('stats-bar');
  const collapsed = document.getElementById('stats-collapsed');
  const expanded = document.getElementById('stats-expanded');
  const chevron = document.getElementById('stats-chevron');

  if (statsExpanded) {
    bar.classList.add('expanded');
    expanded.hidden = false;
    chevron.textContent = '▼'; // down arrow when expanded (chevron flipped by CSS)
  } else {
    bar.classList.remove('expanded');
    expanded.hidden = true;
    chevron.textContent = '▲';
  }
}

// ============================================================
//  URL HASH IMPORT
// ============================================================

function checkUrlHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  try {
    loadShareCode(hash);
  } catch (e) {
    // ignore invalid hash
  }
}

// ============================================================
//  EVENT WIRING
// ============================================================

function wireEvents() {
  // Header buttons
  document.getElementById('btn-share').addEventListener('click', openShareSheet);
  document.getElementById('btn-reset').addEventListener('click', resetState);
  document.getElementById('btn-add-board').addEventListener('click', openAddBoardSheet);

  // Close sheets
  document.getElementById('btn-close-add-board').addEventListener('click', closeAllSheets);
  document.getElementById('btn-close-share').addEventListener('click', closeAllSheets);
  document.getElementById('modal-overlay').addEventListener('click', closeAllSheets);

  // Share: copy
  document.getElementById('btn-copy-code').addEventListener('click', function() {
    const codeOut = document.getElementById('share-code-out');
    const confirmEl = document.getElementById('copy-confirm');
    navigator.clipboard.writeText(codeOut.value).then(function() {
      confirmEl.hidden = false;
      setTimeout(function() { confirmEl.hidden = true; }, 2000);
    }).catch(function() {
      codeOut.select();
      document.execCommand('copy');
      confirmEl.hidden = false;
      setTimeout(function() { confirmEl.hidden = true; }, 2000);
    });
  });

  // Share: load
  document.getElementById('btn-load-code').addEventListener('click', function() {
    const codeIn = document.getElementById('share-code-in');
    const errEl = document.getElementById('share-error');
    const code = codeIn.value.trim();
    if (!code) { errEl.textContent = 'Please paste a code first.'; errEl.hidden = false; return; }
    try {
      loadShareCode(code);
      errEl.hidden = true;
      closeAllSheets();
      render();
    } catch (e) {
      errEl.textContent = 'Invalid code. Please check and try again.';
      errEl.hidden = false;
    }
  });

  // Stats bar toggle
  document.getElementById('stats-bar').addEventListener('click', toggleStats);
}

// ============================================================
//  INIT
// ============================================================

function init() {
  checkUrlHash();
  wireEvents();
  render();
}

// Boot
loadData();
