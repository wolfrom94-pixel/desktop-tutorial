'use strict';

// ============================================================
//  DATA
// ============================================================

const BOARD_META = {
  starting:          { name: 'Starting Board',        icon: '⭐', legendaryId: 'starting_legendary',          rareIds: ['Generic_Rare_001','Generic_Rare_051','Generic_Rare_075','Rogue_Rare_037'] },
  eldritch_bounty:   { name: 'Eldritch Bounty',       icon: '✨', legendaryId: 'eldritch_bounty_legendary',   rareIds: ['Generic_Rare_019','Generic_Rare_042','Rogue_Rare_009','Rogue_Rare_010','Rogue_Rare_012','Rogue_Rare_038'] },
  tricks_of_trade:   { name: 'Tricks of the Trade',   icon: '🃏', legendaryId: 'tricks_legendary',            rareIds: ['Generic_Rare_007','Generic_Rare_046','Rogue_Rare_016','Rogue_Rare_018','Rogue_Rare_039','Rogue_Rare_040'] },
  cheap_shot:        { name: 'Cheap Shot',            icon: '🎯', legendaryId: 'cheap_shot_legendary',        rareIds: ['Generic_Rare_011','Generic_Rare_016','Generic_Rare_018','Generic_Rare_021','Generic_Rare_096','Rogue_Rare_041'] },
  deadly_ambush:     { name: 'Deadly Ambush',         icon: '💥', legendaryId: 'deadly_ambush_legendary',     rareIds: ['Generic_Rare_041','Rogue_Rare_008','Rogue_Rare_027','Rogue_Rare_028','Rogue_Rare_029','Rogue_Rare_042'] },
  leyrana_instinct:  { name: "Leyrana's Instinct",    icon: '👁️', legendaryId: 'leyrana_instinct_legendary',  rareIds: ['Generic_Rare_002','Generic_Rare_019','Generic_Rare_041','Generic_Rare_042','Generic_Rare_100','Rogue_Rare_044'] },
  no_witnesses:      { name: 'No Witnesses',          icon: '☠️', legendaryId: 'no_witnesses_legendary',      rareIds: ['Generic_Rare_006','Generic_Rare_030','Generic_Rare_033','Generic_Rare_051','Generic_Rare_082','Rogue_Rare_045'] },
  exploit_weakness:  { name: 'Exploit Weakness',      icon: '💢', legendaryId: 'exploit_legendary',           rareIds: ['Generic_Rare_012','Generic_Rare_049','Generic_Rare_096','Generic_Rare_106','Necromancer_Rare_011','Rogue_Rare_046'] },
  cunning_stratagem: { name: 'Cunning Stratagem',     icon: '🧠', legendaryId: 'cunning_stratagem_legendary', rareIds: ['Generic_Rare_067','Rogue_Rare_005','Rogue_Rare_011','Rogue_Rare_014','Rogue_Rare_040','Sorcerer_Rare_034'] },
  danse_macabre:     { name: 'Danse Macabre',         icon: '💃', legendaryId: 'danse_macabre_legendary',     rareIds: ['rare_danse_macabre_1','rare_danse_macabre_2','rare_danse_macabre_3','rare_danse_macabre_4','rare_danse_macabre_5','rare_danse_macabre_6'] },
};

// Maps board IDs to their board-raw grid files (Rogue_09 not available)
const BOARD_FILE_MAP = {
  starting:          'board-raw/Rogue_00.json',
  eldritch_bounty:   'board-raw/Rogue_01.json',
  tricks_of_trade:   'board-raw/Rogue_02.json',
  cheap_shot:        'board-raw/Rogue_03.json',
  deadly_ambush:     'board-raw/Rogue_04.json',
  leyrana_instinct:  'board-raw/Rogue_05.json',
  no_witnesses:      'board-raw/Rogue_06.json',
  exploit_weakness:  'board-raw/Rogue_07.json',
  cunning_stratagem: 'board-raw/Rogue_08.json',
};

const MAX_POINTS = 300;
const MAX_BOARDS = 5;

// ============================================================
//  STATE
// ============================================================

const state = {
  boards: ['starting'],
  boardData: {
    starting: { glyphId: null, glyphLevel: 1, activeRares: new Set() }
  }
};

// Loaded paragon data
let DATA = {};

// Loaded board grid data: bid → { nWidth, arEntries, socketIdx }
const BOARD_GRIDS = {};

// ============================================================
//  BOARD GRID RENDERING
// ============================================================

const GCELL = 15;
const GPAD  = 4;

function nodeCategory(name) {
  if (!name) return null;
  if (name.includes('StartNode'))    return 'start';
  if (name.includes('_Gate'))        return 'gate';
  if (name.includes('_Socket'))      return 'socket';
  if (name.includes('_Legendary_')) return 'legendary';
  if (name.includes('_Rare_'))       return 'rare';
  if (name.includes('_Magic_'))      return 'magic';
  return 'normal';
}

const GSTYLE = {
  start:     { fill: '#22c55e', r: 6 },
  gate:      { fill: '#22d3ee', r: 4, diamond: true },
  socket:    { fill: '#a855f7', r: 5, hex: true },
  legendary: { fill: '#f59e0b', r: 6, diamond: true },
  rare:      { fill: '#eab308', r: 5 },
  magic:     { fill: '#60a5fa', r: 3 },
  normal:    { fill: '#4b5563', r: 2.5 },
};

function buildBoardSVG(gridData, activeRadius) {
  const W = gridData.nWidth;
  const E = gridData.arEntries;
  const dim = W * GCELL + 2 * GPAD;
  let out = '';

  // Connection lines between adjacent filled cells
  for (let i = 0; i < E.length; i++) {
    if (!E[i]) continue;
    const x = i % W;
    const y = Math.floor(i / W);
    const cx = GPAD + x * GCELL + GCELL / 2;
    const cy = GPAD + y * GCELL + GCELL / 2;
    if (x < W - 1 && E[i + 1]) {
      out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + GCELL) + '" y2="' + cy + '" stroke="#1e1216" stroke-width="2"/>';
    }
    if (y < W - 1 && E[i + W]) {
      out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy + GCELL) + '" stroke="#1e1216" stroke-width="2"/>';
    }
  }

  // Glyph radius ring around socket
  if (activeRadius > 0 && gridData.socketIdx >= 0) {
    const sx = gridData.socketIdx % W;
    const sy = Math.floor(gridData.socketIdx / W);
    const scx = GPAD + sx * GCELL + GCELL / 2;
    const scy = GPAD + sy * GCELL + GCELL / 2;
    const pr = activeRadius * GCELL;
    out += '<circle cx="' + scx + '" cy="' + scy + '" r="' + pr + '" fill="rgba(168,85,247,0.08)" stroke="rgba(168,85,247,0.5)" stroke-width="1" stroke-dasharray="4,3"/>';
  }

  // Node shapes
  for (let i = 0; i < E.length; i++) {
    if (!E[i]) continue;
    const cat = nodeCategory(E[i]);
    if (!cat) continue;
    const s = GSTYLE[cat];
    const x = i % W;
    const y = Math.floor(i / W);
    const cx = GPAD + x * GCELL + GCELL / 2;
    const cy = GPAD + y * GCELL + GCELL / 2;

    if (s.diamond) {
      const r = s.r;
      out += '<polygon points="' + cx + ',' + (cy - r) + ' ' + (cx + r) + ',' + cy + ' ' + cx + ',' + (cy + r) + ' ' + (cx - r) + ',' + cy + '" fill="' + s.fill + '"/>';
    } else if (s.hex) {
      const pts = [];
      for (let k = 0; k < 6; k++) {
        const a = Math.PI / 6 + k * Math.PI / 3;
        pts.push((cx + s.r * Math.cos(a)).toFixed(1) + ',' + (cy + s.r * Math.sin(a)).toFixed(1));
      }
      out += '<polygon points="' + pts.join(' ') + '" fill="' + s.fill + '"/>';
    } else {
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + s.r + '" fill="' + s.fill + '"/>';
    }
  }

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + dim + '" height="' + dim + '" viewBox="0 0 ' + dim + ' ' + dim + '">' + out + '</svg>';
}

// ============================================================
//  LOAD DATA
// ============================================================

async function loadBoardGrids() {
  await Promise.all(
    Object.entries(BOARD_FILE_MAP).map(function(entry) {
      const bid = entry[0];
      const file = entry[1];
      return fetch(file)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          BOARD_GRIDS[bid] = {
            nWidth:    data.nWidth,
            arEntries: data.arEntries,
            socketIdx: data.arEntries.findIndex(function(e) { return e && e.includes('Socket'); }),
          };
        })
        .catch(function(e) { console.warn('Grid load failed:', bid, e.message); });
    })
  );
}

async function loadData() {
  try {
    await Promise.all([
      fetch('paragon-data.json').then(function(r) { return r.json(); }).then(function(d) { DATA = d; }),
      loadBoardGrids(),
    ]);
  } catch (e) {
    if (!DATA.glyphs) DATA = { glyphs: [], legendaryNodes: {}, rareNodes: {} };
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
      if (g) applyGlyph(g, t, bdata.glyphLevel || 1);
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

function glyphRadius(level) {
  if (level >= 51) return 5;
  if (level >= 25) return 4;
  return 3;
}

function applyGlyph(g, t, level) {
  const lvl = level || 1;
  const bonus = Math.round(17 * (1 + (lvl - 1) / 30));
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
    v: 3,
    b: state.boards.map(function(bid) {
      return {
        id: bid,
        g: state.boardData[bid].glyphId,
        gl: state.boardData[bid].glyphLevel || 1,
        r: Array.from(state.boardData[bid].activeRares),
      };
    })
  };
  return btoa(encodeURIComponent(JSON.stringify(d)));
}

function loadShareCode(code) {
  const d = JSON.parse(decodeURIComponent(atob(code)));
  if (![2, 3].includes(d.v) || !Array.isArray(d.b)) throw new Error('Invalid share code');
  state.boards = [];
  state.boardData = {};
  d.b.forEach(function(bd) {
    if (!BOARD_META[bd.id]) return;
    state.boards.push(bd.id);
    state.boardData[bd.id] = { glyphId: bd.g || null, glyphLevel: bd.gl || 1, activeRares: new Set(bd.r || []) };
  });
  if (!state.boards.includes('starting')) {
    state.boards.unshift('starting');
    state.boardData.starting = { glyphId: null, glyphLevel: 1, activeRares: new Set() };
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
  const existing = scroll.querySelectorAll('.chip:not(.chip-add)');
  existing.forEach(function(el) { el.remove(); });

  const addBtn = scroll.querySelector('.chip-add');

  state.boards.forEach(function(bid) {
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
  const meta   = BOARD_META[bid];
  const bdata  = state.boardData[bid];
  const legNode  = DATA.legendaryNodes && DATA.legendaryNodes[meta.legendaryId];
  const isStarting = bid === 'starting';
  const gridData = BOARD_GRIDS[bid];

  // Forward-declare so glyph handlers can call it after grid section is built
  let refreshGrid = null;

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
  chevron.textContent = '▾';

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

  // --- Visual board grid (first in body) ---
  if (gridData) {
    const gridSec = document.createElement('div');
    gridSec.className = 'card-section board-grid-section';

    const gridLabel = document.createElement('div');
    gridLabel.className = 'section-label';
    gridLabel.textContent = 'Board Layout';

    const gridWrap = document.createElement('div');
    gridWrap.className = 'board-grid-wrap';

    refreshGrid = function() {
      const radius = bdata.glyphId ? glyphRadius(bdata.glyphLevel || 1) : 0;
      gridWrap.innerHTML = buildBoardSVG(gridData, radius);
    };
    refreshGrid();

    const gridLegend = document.createElement('div');
    gridLegend.className = 'board-grid-legend';
    gridLegend.innerHTML =
      '<span class="legend-item"><span class="legend-node" style="background:#22c55e;border-radius:50%"></span>Start</span>' +
      '<span class="legend-item"><span class="legend-node legend-diamond" style="background:#f59e0b"></span>Legendary</span>' +
      '<span class="legend-item"><span class="legend-node" style="background:#eab308;border-radius:50%"></span>Rare</span>' +
      '<span class="legend-item"><span class="legend-node" style="background:#60a5fa;border-radius:50%"></span>Magic</span>' +
      '<span class="legend-item"><span class="legend-node" style="background:#4b5563;border-radius:50%"></span>Normal</span>' +
      '<span class="legend-item"><span class="legend-node legend-diamond" style="background:#22d3ee"></span>Gate</span>' +
      '<span class="legend-item"><span class="legend-node legend-hex" style="background:#a855f7"></span>Socket</span>';

    gridSec.appendChild(gridLabel);
    gridSec.appendChild(gridWrap);
    gridSec.appendChild(gridLegend);
    body.appendChild(gridSec);
  }

  // --- Legendary section ---
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

  // --- Glyph section ---
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

  // Glyph level stepper
  const glyphLevelRow = document.createElement('div');
  glyphLevelRow.className = 'glyph-level-row';
  glyphLevelRow.hidden = !bdata.glyphId;

  const lvlLabel = document.createElement('span');
  lvlLabel.className = 'glyph-level-label';
  lvlLabel.textContent = 'Level';

  const lvlMinus = document.createElement('button');
  lvlMinus.className = 'glyph-lvl-btn';
  lvlMinus.textContent = '−';

  const lvlVal = document.createElement('span');
  lvlVal.className = 'glyph-lvl-val';
  lvlVal.textContent = String(bdata.glyphLevel || 1);

  const lvlPlus = document.createElement('button');
  lvlPlus.className = 'glyph-lvl-btn';
  lvlPlus.textContent = '+';

  const radiusBadge = document.createElement('span');
  radiusBadge.className = 'glyph-radius-badge';

  function updateRadiusBadge(level) {
    const r = glyphRadius(level);
    const isLeg = level >= 51;
    radiusBadge.textContent = 'r' + r + (isLeg ? ' ✦' : '');
    radiusBadge.className = 'glyph-radius-badge' + (isLeg ? ' legendary' : '');
  }
  updateRadiusBadge(bdata.glyphLevel || 1);

  function setGlyphLevel(newLvl) {
    newLvl = Math.max(1, Math.min(150, newLvl));
    state.boardData[bid].glyphLevel = newLvl;
    lvlVal.textContent = String(newLvl);
    updateRadiusBadge(newLvl);
    if (refreshGrid) refreshGrid();
    renderStats();
  }

  lvlMinus.addEventListener('click', function() { setGlyphLevel((state.boardData[bid].glyphLevel || 1) - 1); });
  lvlPlus.addEventListener('click',  function() { setGlyphLevel((state.boardData[bid].glyphLevel || 1) + 1); });

  let lvlInterval = null;
  function startHold(delta) { lvlInterval = setInterval(function() { setGlyphLevel((state.boardData[bid].glyphLevel || 1) + delta); }, 120); }
  function stopHold() { clearInterval(lvlInterval); }
  lvlMinus.addEventListener('pointerdown', function() { startHold(-1); });
  lvlPlus.addEventListener('pointerdown',  function() { startHold(+1); });
  ['pointerup','pointerleave'].forEach(function(ev) {
    lvlMinus.addEventListener(ev, stopHold);
    lvlPlus.addEventListener(ev, stopHold);
  });

  glyphLevelRow.appendChild(lvlLabel);
  glyphLevelRow.appendChild(lvlMinus);
  glyphLevelRow.appendChild(lvlVal);
  glyphLevelRow.appendChild(lvlPlus);
  glyphLevelRow.appendChild(radiusBadge);

  const glyphInfo = document.createElement('div');
  glyphInfo.className = 'glyph-info';
  glyphInfo.hidden = !bdata.glyphId;

  function updateGlyphInfo(gid) {
    if (!gid || !DATA.glyphs) {
      glyphInfo.hidden = true;
      glyphLevelRow.hidden = true;
      return;
    }
    const g = DATA.glyphs.find(function(g) { return g.id === gid; });
    if (!g) {
      glyphInfo.hidden = true;
      glyphLevelRow.hidden = true;
      return;
    }
    glyphInfo.hidden = false;
    glyphLevelRow.hidden = false;
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

  if (bdata.glyphId) updateGlyphInfo(bdata.glyphId);

  glyphSelect.addEventListener('change', function() {
    const gid = glyphSelect.value || null;
    state.boardData[bid].glyphId = gid;
    updateGlyphInfo(gid);
    if (refreshGrid) refreshGrid();
    renderStats();
  });

  glyphSec.appendChild(glyphLabel);
  glyphSec.appendChild(glyphSelect);
  glyphSec.appendChild(glyphLevelRow);
  glyphSec.appendChild(glyphInfo);
  body.appendChild(glyphSec);

  // --- Rare nodes section ---
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

  const summary = document.getElementById('stats-summary');
  summary.textContent =
    'DEX ' + stats.dexterity +
    '  DMG +' + stats.damage + '%' +
    '  CRIT +' + stats.critdmg + '%' +
    '  VUL +' + stats.vulnerable + '%';

  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';

  const statDefs = [
    { key: 'dexterity',    label: 'DEX',  fmt: function(v) { return String(v); } },
    { key: 'strength',     label: 'STR',  fmt: function(v) { return String(v); } },
    { key: 'intelligence', label: 'INT',  fmt: function(v) { return String(v); } },
    { key: 'willpower',    label: 'WIL',  fmt: function(v) { return String(v); } },
    { key: 'life',         label: 'LIFE', fmt: function(v) { return '+' + v; } },
    { key: 'armor',        label: 'ARM',  fmt: function(v) { return '+' + v; } },
    { key: 'damage',       label: 'DMG',  fmt: function(v) { return '+' + v + '%'; } },
    { key: 'critdmg',      label: 'CRIT', fmt: function(v) { return '+' + v + '%'; } },
    { key: 'vulnerable',   label: 'VUL',  fmt: function(v) { return '+' + v + '%'; } },
    { key: 'poison',       label: 'PSN',  fmt: function(v) { return '+' + v + '%'; } },
    { key: 'trap',         label: 'TRAP', fmt: function(v) { return '+' + v + '%'; } },
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
  if (state.boards.length >= MAX_BOARDS) {
    alert('Maximum ' + MAX_BOARDS + ' boards (Season 6 limit).');
    return;
  }
  state.boards.push(bid);
  state.boardData[bid] = { glyphId: null, glyphLevel: 1, activeRares: new Set() };
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
  if (state.boards.length >= MAX_BOARDS) {
    alert('Du har allerede ' + MAX_BOARDS + ' boards — det er max i Season 6.');
    return;
  }
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
      row.addEventListener('click', function() { addBoard(bid); });
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
  const expanded = document.getElementById('stats-expanded');
  const chevron = document.getElementById('stats-chevron');

  if (statsExpanded) {
    bar.classList.add('expanded');
    expanded.hidden = false;
    chevron.textContent = '▼';
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
  document.getElementById('btn-share').addEventListener('click', openShareSheet);
  document.getElementById('btn-reset').addEventListener('click', resetState);
  document.getElementById('btn-add-board').addEventListener('click', openAddBoardSheet);

  document.getElementById('btn-close-add-board').addEventListener('click', closeAllSheets);
  document.getElementById('btn-close-share').addEventListener('click', closeAllSheets);
  document.getElementById('modal-overlay').addEventListener('click', closeAllSheets);

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
