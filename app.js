'use strict';

// ─────────────────────────────────────────────────
//  BOARD SHAPE DEFINITIONS
//  rowRanges: [minCol, maxCol] per row (null = skip)
//  specialNodes: { "col,row": nodeSpec }
// ─────────────────────────────────────────────────

const NODE_SIZE = 20;   // radius in px
const NODE_GAP  = 44;   // center-to-center px

// Stat distribution helper: deterministic per position
function getDefaultStat(col, row, boardId) {
  const h = ((col * 31 + row * 17 + (boardId.length * 7)) % 12);
  if (h < 5)  return 'dexterity';   // ~42% dex (Rogue primary)
  if (h < 8)  return 'strength';
  if (h < 11) return 'intelligence';
  return 'willpower';
}

// Magic node stat similarly varied
function getMagicStat(col, row, boardId) {
  const h = ((col * 13 + row * 29 + boardId.length) % 4);
  return ['dexterity','strength','intelligence','willpower'][h];
}

const BOARD_DEFS = {
  starting: {
    name: 'Starting Board',
    isStarting: true,
    width: 13, height: 15,
    // rowRanges[row] = [minCol, maxCol] or null
    rowRanges: [
      [6,6],[5,7],[4,8],[3,9],[2,10],[2,10],
      [1,11],[1,11],[1,11],[2,10],[3,9],[4,8],
      [5,7],[5,7],[6,6]
    ],
    specialNodes: {
      '6,0':  { type:'start', name:'Start' },
      '6,7':  { type:'legendary', id:'starting_legendary' },
      '6,9':  { type:'glyph' },
      '6,14': { type:'gate', direction:'south', connects:'south' },
      // Magic nodes
      '3,4':  { type:'magic' }, '9,4':  { type:'magic' },
      '2,6':  { type:'magic' }, '10,6': { type:'magic' },
      '1,8':  { type:'magic' }, '11,8': { type:'magic' },
      '3,10': { type:'magic' }, '9,10': { type:'magic' },
      // Rare nodes
      '4,5':  { type:'rare', id:'rare_starting_1' },
      '8,5':  { type:'rare', id:'rare_starting_2' },
      '4,10': { type:'rare', id:'rare_starting_3' },
      '8,10': { type:'rare', id:'rare_starting_4' },
    },
    gates: [
      { id:'gate_s', col:6, row:14, direction:'south' }
    ]
  },

  deadly_ambush: {
    name: 'Deadly Ambush',
    width: 21, height: 21,
    rowRanges: [
      null,[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],
      [0,20],[0,20],[0,20],
      [9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],null
    ],
    specialNodes: {
      '10,0':  { type:'gate', direction:'north', connects:'north' },
      '10,20': { type:'gate', direction:'south', connects:'south' },
      '0,10':  { type:'gate', direction:'west',  connects:'west' },
      '20,10': { type:'gate', direction:'east',  connects:'east' },
      '10,10': { type:'legendary', id:'deadly_ambush_legendary' },
      '10,4':  { type:'glyph' },
      // Magic nodes
      '9,2':  { type:'magic' }, '11,2': { type:'magic' },
      '9,6':  { type:'magic' }, '11,6': { type:'magic' },
      '3,9':  { type:'magic' }, '17,9': { type:'magic' },
      '3,11': { type:'magic' }, '17,11':{ type:'magic' },
      '9,13': { type:'magic' }, '11,13':{ type:'magic' },
      '9,17': { type:'magic' }, '11,17':{ type:'magic' },
      // Rare
      '9,3':  { type:'rare', id:'rare_deadly_ambush_1' },
      '11,3': { type:'rare', id:'rare_deadly_ambush_2' },
      '5,10': { type:'rare', id:'rare_deadly_ambush_3' },
      '15,10':{ type:'rare', id:'rare_deadly_ambush_4' },
      '9,16': { type:'rare', id:'rare_deadly_ambush_5' },
    },
    gates: [
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west' },
      { id:'gate_e', col:20, row:10, direction:'east' },
    ]
  },

  eldritch_bounty: {
    name: 'Eldritch Bounty',
    width: 21, height: 21,
    rowRanges: [
      null,[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],
      [0,20],[0,20],[0,20],
      [9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],null
    ],
    specialNodes: {
      '10,0':  { type:'gate', direction:'north', connects:'north' },
      '10,20': { type:'gate', direction:'south', connects:'south' },
      '0,10':  { type:'gate', direction:'west',  connects:'west' },
      '20,10': { type:'gate', direction:'east',  connects:'east' },
      '10,10': { type:'legendary', id:'eldritch_bounty_legendary' },
      '10,16': { type:'glyph' },
      '10,5':  { type:'magic' }, '9,5': { type:'magic' }, '11,5': { type:'magic' },
      '2,9':   { type:'magic' }, '18,9': { type:'magic' },
      '2,11':  { type:'magic' }, '18,11':{ type:'magic' },
      '9,15':  { type:'magic' }, '11,15':{ type:'magic' },
      '7,10':  { type:'rare', id:'rare_eldritch_bounty_1' },
      '13,10': { type:'rare', id:'rare_eldritch_bounty_2' },
      '10,7':  { type:'rare', id:'rare_eldritch_bounty_3' },
      '10,13': { type:'rare', id:'rare_eldritch_bounty_4' },
      '4,10':  { type:'rare', id:'rare_eldritch_bounty_5' },
    },
    gates: [
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west' },
      { id:'gate_e', col:20, row:10, direction:'east' },
    ]
  },

  cheap_shot: {
    name: 'Cheap Shot',
    width: 21, height: 21,
    rowRanges: [
      null,[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],
      [0,20],[0,20],[0,20],
      [9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],null
    ],
    specialNodes: {
      '10,0':  { type:'gate', direction:'north', connects:'north' },
      '10,20': { type:'gate', direction:'south', connects:'south' },
      '0,10':  { type:'gate', direction:'west',  connects:'west' },
      '20,10': { type:'gate', direction:'east',  connects:'east' },
      '10,10': { type:'legendary', id:'cheap_shot_legendary' },
      '10,7':  { type:'glyph' },
      '9,1':  { type:'magic' }, '11,1': { type:'magic' },
      '10,3': { type:'magic' },
      '4,9':  { type:'magic' }, '16,9': { type:'magic' },
      '4,11': { type:'magic' }, '16,11':{ type:'magic' },
      '10,12':{ type:'magic' }, '10,18':{ type:'magic' },
      '9,8':  { type:'rare', id:'rare_cheap_shot_1' },
      '11,8': { type:'rare', id:'rare_cheap_shot_2' },
      '6,10': { type:'rare', id:'rare_cheap_shot_3' },
      '14,10':{ type:'rare', id:'rare_cheap_shot_4' },
      '10,14':{ type:'rare', id:'rare_cheap_shot_5' },
    },
    gates: [
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west' },
      { id:'gate_e', col:20, row:10, direction:'east' },
    ]
  },

  no_witnesses: {
    name: 'No Witnesses',
    width: 21, height: 21,
    rowRanges: [
      null,[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],
      [0,20],[0,20],[0,20],
      [9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],null
    ],
    specialNodes: {
      '10,0':  { type:'gate', direction:'north', connects:'north' },
      '10,20': { type:'gate', direction:'south', connects:'south' },
      '0,10':  { type:'gate', direction:'west',  connects:'west' },
      '20,10': { type:'gate', direction:'east',  connects:'east' },
      '10,10': { type:'legendary', id:'no_witnesses_legendary' },
      '10,14': { type:'glyph' },
      '10,2': { type:'magic' },
      '9,4':  { type:'magic' }, '11,4': { type:'magic' },
      '1,10': { type:'magic' }, '19,10':{ type:'magic' },
      '6,9':  { type:'magic' }, '14,9': { type:'magic' },
      '6,11': { type:'magic' }, '14,11':{ type:'magic' },
      '10,16':{ type:'magic' },
      '9,7':  { type:'rare', id:'rare_no_witnesses_1' },
      '11,7': { type:'rare', id:'rare_no_witnesses_2' },
      '3,10': { type:'rare', id:'rare_no_witnesses_3' },
      '17,10':{ type:'rare', id:'rare_no_witnesses_4' },
      '10,19':{ type:'rare', id:'rare_no_witnesses_5' },
    },
    gates: [
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west' },
      { id:'gate_e', col:20, row:10, direction:'east' },
    ]
  },

  cunning_stratagem: {
    name: 'Cunning Stratagem',
    width: 21, height: 21,
    rowRanges: [
      null,[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],
      [0,20],[0,20],[0,20],
      [9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],null
    ],
    specialNodes: {
      '10,0':  { type:'gate', direction:'north', connects:'north' },
      '10,20': { type:'gate', direction:'south', connects:'south' },
      '0,10':  { type:'gate', direction:'west',  connects:'west' },
      '20,10': { type:'gate', direction:'east',  connects:'east' },
      '10,10': { type:'legendary', id:'cunning_stratagem_legendary' },
      '10,4':  { type:'glyph' },
      '9,2':   { type:'magic' }, '11,2': { type:'magic' },
      '10,6':  { type:'magic' },
      '2,10':  { type:'magic' }, '18,10':{ type:'magic' },
      '5,9':   { type:'magic' }, '15,9': { type:'magic' },
      '5,11':  { type:'magic' }, '15,11':{ type:'magic' },
      '10,15': { type:'magic' },
      '9,5':   { type:'rare', id:'rare_cunning_stratagem_1' },
      '11,5':  { type:'rare', id:'rare_cunning_stratagem_2' },
      '4,10':  { type:'rare', id:'rare_cunning_stratagem_3' },
      '16,10': { type:'rare', id:'rare_cunning_stratagem_4' },
      '10,17': { type:'rare', id:'rare_cunning_stratagem_5' },
    },
    gates: [
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west' },
      { id:'gate_e', col:20, row:10, direction:'east' },
    ]
  },

  tricks_of_trade: {
    name: 'Tricks of the Trade',
    width: 21, height: 21,
    rowRanges: [
      null,[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],
      [0,20],[0,20],[0,20],
      [9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],null
    ],
    specialNodes: {
      '10,0':  { type:'gate', direction:'north', connects:'north' },
      '10,20': { type:'gate', direction:'south', connects:'south' },
      '0,10':  { type:'gate', direction:'west',  connects:'west' },
      '20,10': { type:'gate', direction:'east',  connects:'east' },
      '10,10': { type:'legendary', id:'tricks_legendary' },
      '10,6':  { type:'glyph' },
      '10,1':  { type:'magic' },
      '9,3':   { type:'magic' }, '11,3': { type:'magic' },
      '3,9':   { type:'magic' }, '17,9': { type:'magic' },
      '3,11':  { type:'magic' }, '17,11':{ type:'magic' },
      '9,13':  { type:'magic' }, '11,13':{ type:'magic' },
      '10,18': { type:'magic' },
      '10,8':  { type:'rare', id:'rare_tricks_1' },
      '8,10':  { type:'rare', id:'rare_tricks_2' },
      '12,10': { type:'rare', id:'rare_tricks_3' },
      '9,11':  { type:'rare', id:'rare_tricks_4' },
      '11,11': { type:'rare', id:'rare_tricks_5' },
    },
    gates: [
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west' },
      { id:'gate_e', col:20, row:10, direction:'east' },
    ]
  },

  exploit_weakness: {
    name: 'Exploit Weakness',
    width: 21, height: 21,
    rowRanges: [
      null,[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],
      [0,20],[0,20],[0,20],
      [9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],null
    ],
    specialNodes: {
      '10,0':  { type:'gate', direction:'north', connects:'north' },
      '10,20': { type:'gate', direction:'south', connects:'south' },
      '0,10':  { type:'gate', direction:'west',  connects:'west' },
      '20,10': { type:'gate', direction:'east',  connects:'east' },
      '10,10': { type:'legendary', id:'exploit_legendary' },
      '10,16': { type:'glyph' },
      '9,2':   { type:'magic' }, '11,2': { type:'magic' },
      '10,5':  { type:'magic' },
      '1,9':   { type:'magic' }, '19,9': { type:'magic' },
      '1,11':  { type:'magic' }, '19,11':{ type:'magic' },
      '10,12': { type:'magic' }, '9,14': { type:'magic' }, '11,14':{ type:'magic' },
      '9,9':   { type:'rare', id:'rare_exploit_weakness_1' },
      '11,9':  { type:'rare', id:'rare_exploit_weakness_2' },
      '5,10':  { type:'rare', id:'rare_exploit_weakness_3' },
      '15,10': { type:'rare', id:'rare_exploit_weakness_4' },
      '10,11': { type:'rare', id:'rare_exploit_weakness_5' },
    },
    gates: [
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west' },
      { id:'gate_e', col:20, row:10, direction:'east' },
    ]
  },
};

// ─────────────────────────────────────────────────
//  STAT VALUES PER NODE TYPE
// ─────────────────────────────────────────────────
const STAT_VALUES = {
  normal: { dexterity:5, strength:2, intelligence:2, willpower:2 },
  magic:  { dexterity:8, strength:4, intelligence:4, willpower:4, life:36, armor:28, damage:3, critdmg:5, vulnerable:3, poison:3, trap:3 },
};

// Node colours
const NODE_COLORS = {
  start:     { fill:'#3d0a06', stroke:'#cc2200', active:'#7a1a10', activeStroke:'#ff4422' },
  gate:      { fill:'#0a1020', stroke:'#304080', active:'#142040', activeStroke:'#5070c0' },
  normal:    { fill:'#1a0f12', stroke:'#4a3040', active:'#2a1a22', activeStroke:'#9a6070' },
  magic:     { fill:'#0a1228', stroke:'#1a3080', active:'#152040', activeStroke:'#3060d0' },
  rare:      { fill:'#201400', stroke:'#806000', active:'#302000', activeStroke:'#d0a000' },
  legendary: { fill:'#3d0a00', stroke:'#c04000', active:'#5a1a00', activeStroke:'#ff6600' },
  glyph:     { fill:'#150828', stroke:'#6633bb', active:'#220e3a', activeStroke:'#9944ff' },
};

const STAT_COLORS = {
  dexterity:    '#3a90d0',
  strength:     '#d06030',
  intelligence: '#9060d0',
  willpower:    '#40a870',
};

const STAT_ICONS = {
  dexterity: '👣', strength: '🛡', intelligence: '💎', willpower: '🌿',
};

// ─────────────────────────────────────────────────
//  APPLICATION STATE
// ─────────────────────────────────────────────────
let DATA = null;   // loaded from paragon-data.json

const state = {
  // Which boards are in the build and their order
  activeBoards: ['starting'],
  // Per-board state: activatedNodes, rotation, glyph
  boards: {
    starting: { activatedNodes: new Set(), rotation: 0, glyphId: null }
  },
  // Currently selected board (for highlighting / glyph panel)
  selectedBoard: 'starting',
  // Currently hovered glyph socket: {boardId, nodeKey}
  selectedGlyphSocket: null,
  // Generated node lists per board (cached)
  _nodeCache: {},
  // Pan / zoom
  pan: { x: 0, y: 0 },
  zoom: 1,
  isPanning: false,
  panStart: { x: 0, y: 0 },
  viewMode: 'all',  // 'all' | 'single'
};

// ─────────────────────────────────────────────────
//  NODE GENERATION
// ─────────────────────────────────────────────────
function generateNodes(boardId) {
  if (state._nodeCache[boardId]) return state._nodeCache[boardId];
  const def = BOARD_DEFS[boardId];
  if (!def) return [];
  const nodes = [];
  def.rowRanges.forEach((range, row) => {
    if (!range) return;
    const [minCol, maxCol] = range;
    for (let col = minCol; col <= maxCol; col++) {
      const key = `${col},${row}`;
      const special = def.specialNodes[key];
      let nodeType, stat, id;
      if (special) {
        nodeType = special.type;
        stat = special.stat || (nodeType === 'magic' ? getMagicStat(col, row, boardId) : null);
        id = special.id || key;
      } else {
        nodeType = 'normal';
        stat = getDefaultStat(col, row, boardId);
        id = key;
      }
      nodes.push({ id, key, col, row, type: nodeType, stat, special: special || null });
    }
  });
  state._nodeCache[boardId] = nodes;
  return nodes;
}

function getNodeByKey(boardId, key) {
  return generateNodes(boardId).find(n => n.key === key);
}

// Check if a node key is adjacent to another key (4-directional)
function getAdjacentKeys(key) {
  const [c, r] = key.split(',').map(Number);
  return [`${c},${r-1}`, `${c},${r+1}`, `${c-1},${r}`, `${c+1},${r}`];
}

// Return all keys reachable from the start of a board through active nodes
function getReachableKeys(boardId) {
  const def = BOARD_DEFS[boardId];
  const bState = state.boards[boardId];
  const activated = bState.activatedNodes;
  const allNodes = new Set(generateNodes(boardId).map(n => n.key));

  // Find starting key (type=start or type=gate we entered from)
  let seedKeys;
  if (def.isStarting) {
    seedKeys = ['6,0'];
  } else {
    // Any activated gate in the board is a seed
    seedKeys = generateNodes(boardId)
      .filter(n => n.type === 'gate' && activated.has(n.key))
      .map(n => n.key);
    if (seedKeys.length === 0) return new Set();
  }

  const reachable = new Set();
  const queue = [...seedKeys.filter(k => activated.has(k) || def.isStarting)];
  if (def.isStarting) {
    // start node is always reachable
    queue.push('6,0');
  }
  while (queue.length) {
    const k = queue.shift();
    if (reachable.has(k)) continue;
    reachable.add(k);
    getAdjacentKeys(k).forEach(adj => {
      if (!reachable.has(adj) && activated.has(adj) && allNodes.has(adj)) {
        queue.push(adj);
      }
    });
  }
  return reachable;
}

// ─────────────────────────────────────────────────
//  BOARD LAYOUT  (positions for full multi-board view)
// ─────────────────────────────────────────────────
// Returns {x, y} pixel offset for each boardId in the canvas
function getBoardLayouts() {
  const layouts = {};
  const gap = NODE_GAP;
  // Starting board centred at origin
  // Additional boards placed to the right, then below, then left, then above
  const offsets = [
    { dx: 0, dy: 0 },    // starting always first
    { dx: 1, dy: 0 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 2, dy: 1 },
  ];
  state.activeBoards.forEach((bid, i) => {
    const def = BOARD_DEFS[bid];
    const o = offsets[i] || { dx: i, dy: 0 };
    // board width/height in px
    const bw = (def.width - 1) * gap;
    const bh = (def.height - 1) * gap;
    const boardSpacingX = bw + gap * 4;
    const boardSpacingY = bh + gap * 4;
    layouts[bid] = {
      x: o.dx * boardSpacingX,
      y: o.dy * boardSpacingY,
      bw, bh
    };
  });
  return layouts;
}

// Convert node col/row to svg pixel coords within a board
function nodeToSVG(col, row, boardOffset, rotation, boardDef) {
  const gap = NODE_GAP;
  let x = col * gap;
  let y = row * gap;
  // Apply rotation around board center
  const cx = ((boardDef.width - 1) / 2) * gap;
  const cy = ((boardDef.height - 1) / 2) * gap;
  if (rotation !== 0) {
    const dx = x - cx, dy = y - cy;
    const rad = rotation * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    x = cx + dx * cos - dy * sin;
    y = cy + dx * sin + dy * cos;
  }
  return { x: boardOffset.x + x, y: boardOffset.y + y };
}

// ─────────────────────────────────────────────────
//  RENDERING
// ─────────────────────────────────────────────────
const svg = document.getElementById('paragon-canvas');
const boardsLayer = document.getElementById('boards-layer');
const connectionsLayer = document.getElementById('connections-layer');
const glyphRadiusLayer = document.getElementById('glyph-radius-layer');
const canvasRoot = document.getElementById('canvas-root');

function render() {
  renderBoards();
  renderConnections();
  renderGlyphRadius();
  updateStatsPanel();
  updateLegendaryPanel();
  updateBoardList();
  updatePointsCounter();
}

function renderBoards() {
  boardsLayer.innerHTML = '';
  const layouts = getBoardLayouts();

  state.activeBoards.forEach(boardId => {
    const layout = layouts[boardId];
    const def = BOARD_DEFS[boardId];
    const bState = state.boards[boardId];
    const rotation = bState.rotation;
    const nodes = generateNodes(boardId);
    const activated = bState.activatedNodes;
    const reachable = getReachableKeys(boardId);

    const g = svgEl('g', { class: 'board-group', 'data-board': boardId });

    // Board background
    const bw = layout.bw + NODE_GAP * 1.5;
    const bh = layout.bh + NODE_GAP * 1.5;
    const bgRect = svgEl('rect', {
      x: layout.x - NODE_GAP * 0.75,
      y: layout.y - NODE_GAP * 0.75,
      width: bw, height: bh,
      fill: 'url(#board-bg-pattern)',
      stroke: boardId === state.selectedBoard ? '#6b2d3a' : '#1e0d14',
      'stroke-width': boardId === state.selectedBoard ? 2 : 1,
      rx: 4
    });
    g.appendChild(bgRect);

    // Board label
    const lbl = svgEl('text', {
      x: layout.x + layout.bw / 2,
      y: layout.y - NODE_GAP * 0.4,
      class: 'board-label',
    });
    lbl.textContent = def.name;
    g.appendChild(lbl);

    // Render each node
    nodes.forEach(node => {
      const pos = nodeToSVG(node.col, node.row, layout, rotation, def);
      const isActive = activated.has(node.key);
      const isReachable = node.type === 'start' || isActive;
      const canActivate = !isActive && (
        node.type === 'start' ||
        getAdjacentKeys(node.key).some(adj => activated.has(adj) || (def.isStarting && adj === '6,-1')) ||
        (def.isStarting && node.key === '6,0')
      );

      const ng = svgEl('g', {
        class: `node node-${node.type}`,
        'data-board': boardId,
        'data-key': node.key,
        'data-type': node.type,
        style: 'cursor:pointer'
      });

      const colors = NODE_COLORS[node.type] || NODE_COLORS.normal;
      const fill = isActive ? colors.active : colors.fill;
      const stroke = isActive ? colors.activeStroke : colors.stroke;
      const r = getNodeRadius(node.type);
      const sw = getStrokeWidth(node.type, isActive);
      const opacity = (!def.isStarting && !isReachable && node.type !== 'gate' && !canActivate) ? 0.4 : 1;

      // Outer ring (for legendary/rare/magic)
      if (node.type === 'legendary') {
        const ring = svgEl('circle', { cx: pos.x, cy: pos.y, r: r + 6, fill: 'none', stroke: '#ff6600', 'stroke-width': 1, opacity: 0.5 });
        if (isActive) ring.setAttribute('filter', 'url(#glow-legendary)');
        ng.appendChild(ring);
      }
      if (node.type === 'rare') {
        const ring = svgEl('circle', { cx: pos.x, cy: pos.y, r: r + 4, fill: 'none', stroke: '#d0a000', 'stroke-width': 1, opacity: 0.6 });
        ng.appendChild(ring);
      }

      // Main circle
      const circle = svgEl('circle', {
        cx: pos.x, cy: pos.y, r,
        fill, stroke, 'stroke-width': sw, opacity
      });
      if (isActive) {
        if (node.type === 'legendary') circle.setAttribute('filter', 'url(#glow-legendary)');
        else if (node.type === 'rare') circle.setAttribute('filter', 'url(#glow-rare)');
        else if (node.type === 'magic') circle.setAttribute('filter', 'url(#glow-magic)');
      }
      ng.appendChild(circle);

      // Node icon / symbol
      const icon = getNodeIcon(node);
      if (icon) {
        const txt = svgEl('text', {
          x: pos.x, y: pos.y,
          class: 'node-icon',
          fill: getIconColor(node, isActive),
          'font-size': getIconSize(node.type),
          opacity
        });
        txt.textContent = icon;
        ng.appendChild(txt);
      }

      // Stat colour bar (bottom of normal/magic nodes)
      if ((node.type === 'normal' || node.type === 'magic') && node.stat) {
        const bar = svgEl('rect', {
          x: pos.x - r * 0.6, y: pos.y + r - 5,
          width: r * 1.2, height: 3,
          fill: STAT_COLORS[node.stat] || '#888',
          rx: 1.5, opacity: opacity * (isActive ? 1 : 0.5)
        });
        ng.appendChild(bar);
      }

      // Active indicator dot (top)
      if (isActive && node.type !== 'gate' && node.type !== 'start') {
        const dot = svgEl('circle', {
          cx: pos.x, cy: pos.y - r + 3, r: 3,
          fill: colors.activeStroke, opacity: 0.9
        });
        ng.appendChild(dot);
      }

      ng.addEventListener('click', (e) => { e.stopPropagation(); onNodeClick(boardId, node.key); });
      ng.addEventListener('mouseenter', (e) => showTooltip(e, boardId, node));
      ng.addEventListener('mouseleave', hideTooltip);

      g.appendChild(ng);
    });

    boardsLayer.appendChild(g);
  });
}

function renderConnections() {
  connectionsLayer.innerHTML = '';
  const layouts = getBoardLayouts();

  state.activeBoards.forEach(boardId => {
    const layout = layouts[boardId];
    const def = BOARD_DEFS[boardId];
    const bState = state.boards[boardId];
    const activated = bState.activatedNodes;
    const rotation = bState.rotation;
    const nodes = generateNodes(boardId);

    nodes.forEach(node => {
      if (!activated.has(node.key)) return;
      // Draw lines to adjacent activated nodes (only down/right to avoid duplication)
      [{ dc: 1, dr: 0 }, { dc: 0, dr: 1 }].forEach(({ dc, dr }) => {
        const adjKey = `${node.col + dc},${node.row + dr}`;
        if (activated.has(adjKey)) {
          const pos1 = nodeToSVG(node.col, node.row, layout, rotation, def);
          const [ac, ar] = adjKey.split(',').map(Number);
          const pos2 = nodeToSVG(ac, ar, layout, rotation, def);
          const line = svgEl('line', {
            x1: pos1.x, y1: pos1.y, x2: pos2.x, y2: pos2.y,
            stroke: '#c84020', 'stroke-width': 3, opacity: 0.7,
            'stroke-linecap': 'round'
          });
          connectionsLayer.appendChild(line);
        }
      });
    });
  });

  // Draw board-to-board connector lines
  renderBoardConnectors(layouts);
}

function renderBoardConnectors(layouts) {
  const pairs = getBoardGatePairs();
  pairs.forEach(pair => {
    if (!layouts[pair.b1] || !layouts[pair.b2]) return;
    const def1 = BOARD_DEFS[pair.b1];
    const def2 = BOARD_DEFS[pair.b2];
    const rot1 = state.boards[pair.b1].rotation;
    const rot2 = state.boards[pair.b2].rotation;
    const p1 = nodeToSVG(pair.g1col, pair.g1row, layouts[pair.b1], rot1, def1);
    const p2 = nodeToSVG(pair.g2col, pair.g2row, layouts[pair.b2], rot2, def2);
    const both = state.boards[pair.b1].activatedNodes.has(pair.g1key)
               && state.boards[pair.b2].activatedNodes.has(pair.g2key);
    const line = svgEl('line', {
      x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
      stroke: both ? '#c84020' : '#2a1520',
      'stroke-width': 2,
      'stroke-dasharray': both ? 'none' : '6,4',
      opacity: both ? 0.7 : 0.4
    });
    connectionsLayer.appendChild(line);
  });
}

function getBoardGatePairs() {
  // Simple linear connection: each board connects to the next via south->north
  const pairs = [];
  for (let i = 0; i < state.activeBoards.length - 1; i++) {
    const b1 = state.activeBoards[i];
    const b2 = state.activeBoards[i + 1];
    const def1 = BOARD_DEFS[b1];
    const def2 = BOARD_DEFS[b2];
    // Find south gate of b1 and north gate of b2
    const g1 = def1.gates.find(g => g.direction === 'south') || def1.gates[0];
    const g2 = def2.gates ? (def2.gates.find(g => g.direction === 'north') || def2.gates[0]) : null;
    if (g1 && g2) {
      pairs.push({
        b1, b2,
        g1col: g1.col, g1row: g1.row, g1key: `${g1.col},${g1.row}`,
        g2col: g2.col, g2row: g2.row, g2key: `${g2.col},${g2.row}`,
      });
    }
  }
  return pairs;
}

function renderGlyphRadius() {
  glyphRadiusLayer.innerHTML = '';
  const layouts = getBoardLayouts();

  state.activeBoards.forEach(boardId => {
    const bState = state.boards[boardId];
    const glyphId = bState.glyphId;
    if (!glyphId || !DATA) return;
    const glyph = DATA.glyphs.find(g => g.id === glyphId);
    if (!glyph) return;

    // Find glyph socket in board
    const def = BOARD_DEFS[boardId];
    const glyphNode = generateNodes(boardId).find(n => n.type === 'glyph');
    if (!glyphNode) return;

    const layout = layouts[boardId];
    const rotation = bState.rotation;
    const center = nodeToSVG(glyphNode.col, glyphNode.row, layout, rotation, def);
    const radius = glyph.radius;
    const radiusPx = radius * NODE_GAP;

    // Draw radius circle
    const rc = svgEl('circle', {
      cx: center.x, cy: center.y, r: radiusPx,
      fill: 'rgba(100,50,200,0.06)',
      stroke: '#7744cc',
      'stroke-width': 1,
      'stroke-dasharray': '4,3',
      opacity: 0.6,
      class: 'glyph-radius-circle'
    });
    glyphRadiusLayer.appendChild(rc);
  });
}

// ─────────────────────────────────────────────────
//  NODE INTERACTION
// ─────────────────────────────────────────────────
function onNodeClick(boardId, key) {
  const def = BOARD_DEFS[boardId];
  const bState = state.boards[boardId];
  const node = getNodeByKey(boardId, key);
  if (!node) return;

  // Select glyph socket
  if (node.type === 'glyph') {
    selectGlyphSocket(boardId, key);
    state.selectedBoard = boardId;
    render();
    return;
  }

  // Gates: activate to enable board connection
  if (node.type === 'gate') {
    toggleNode(boardId, key);
    render();
    return;
  }

  // Start node: always active for starting board
  if (node.type === 'start') {
    bState.activatedNodes.add(key);
    render();
    return;
  }

  // For non-starting boards, must have at least one gate active to be accessible
  if (!def.isStarting) {
    const hasActiveGate = def.gates.some(g => bState.activatedNodes.has(`${g.col},${g.row}`));
    if (!hasActiveGate) {
      // Auto-activate entry gate
      const entryGate = def.gates.find(g => g.direction === 'north') || def.gates[0];
      if (entryGate) bState.activatedNodes.add(`${entryGate.col},${entryGate.row}`);
    }
  }

  const activated = bState.activatedNodes;

  // Check adjacency for activation
  if (!activated.has(key)) {
    // Can only activate if adjacent to already-active node
    const isAdjacentToActive = getAdjacentKeys(key).some(adj => activated.has(adj)) ||
      (def.isStarting && key === '6,0');
    if (!isAdjacentToActive && !def.isStarting) return;
    if (def.isStarting && !isAdjacentToActive && key !== '6,0') return;
    activated.add(key);
  } else {
    // Deactivate: cannot deactivate if it would disconnect other active nodes
    if (!canDeactivate(boardId, key)) {
      flashNode(boardId, key);
      return;
    }
    activated.delete(key);
    // Also handle glyph socket deselect
    if (state.selectedGlyphSocket && state.selectedGlyphSocket.boardId === boardId
        && state.selectedGlyphSocket.key === key) {
      state.selectedGlyphSocket = null;
    }
  }

  state.selectedBoard = boardId;
  render();
}

function toggleNode(boardId, key) {
  const bState = state.boards[boardId];
  if (bState.activatedNodes.has(key)) {
    if (!canDeactivate(boardId, key)) return;
    bState.activatedNodes.delete(key);
  } else {
    bState.activatedNodes.add(key);
  }
}

function canDeactivate(boardId, key) {
  const def = BOARD_DEFS[boardId];
  const bState = state.boards[boardId];
  const activated = bState.activatedNodes;

  // Temporarily remove the node and check connectivity
  const testSet = new Set(activated);
  testSet.delete(key);

  // Find seeds
  let seedKeys;
  if (def.isStarting) {
    seedKeys = ['6,0'];
  } else {
    seedKeys = def.gates.filter(g => testSet.has(`${g.col},${g.row}`)).map(g => `${g.col},${g.row}`);
    if (seedKeys.length === 0) return true;
  }

  // BFS from seeds
  const reachable = new Set();
  const queue = [...seedKeys.filter(k => testSet.has(k))];
  if (def.isStarting) queue.push('6,0');
  const allNodes = new Set(generateNodes(boardId).map(n => n.key));
  while (queue.length) {
    const k = queue.shift();
    if (reachable.has(k)) continue;
    reachable.add(k);
    getAdjacentKeys(k).forEach(adj => {
      if (!reachable.has(adj) && testSet.has(adj) && allNodes.has(adj)) queue.push(adj);
    });
  }

  // All activated nodes (minus the removed one) must still be reachable
  for (const k of testSet) {
    if (!reachable.has(k)) return false;
  }
  return true;
}

function flashNode(boardId, key) {
  const el = boardsLayer.querySelector(`[data-board="${boardId}"][data-key="${key}"]`);
  if (!el) return;
  el.style.transition = 'opacity 0.1s';
  el.style.opacity = '0.3';
  setTimeout(() => { el.style.opacity = ''; }, 200);
}

// ─────────────────────────────────────────────────
//  GLYPH SYSTEM
// ─────────────────────────────────────────────────
function selectGlyphSocket(boardId, key) {
  state.selectedGlyphSocket = { boardId, key };
  updateGlyphPanel();
}

function updateGlyphPanel() {
  const noMsg = document.getElementById('no-glyph-msg');
  const controls = document.getElementById('glyph-controls');
  const glyphInfo = document.getElementById('glyph-info');

  if (!state.selectedGlyphSocket || !DATA) {
    noMsg.classList.remove('hidden');
    controls.classList.add('hidden');
    return;
  }

  noMsg.classList.add('hidden');
  controls.classList.remove('hidden');

  const { boardId } = state.selectedGlyphSocket;
  const bState = state.boards[boardId];
  document.getElementById('glyph-board-label').textContent = `Board: ${BOARD_DEFS[boardId].name}`;

  const sel = document.getElementById('glyph-select');
  sel.innerHTML = '<option value="">— None —</option>';
  (DATA.glyphs || []).forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = `${g.name} (r${g.radius})`;
    if (bState.glyphId === g.id) opt.selected = true;
    sel.appendChild(opt);
  });

  // Show glyph info
  const glyphId = bState.glyphId;
  if (glyphId && DATA) {
    const glyph = DATA.glyphs.find(g => g.id === glyphId);
    if (glyph) {
      glyphInfo.classList.remove('hidden');
      document.getElementById('glyph-info-name').textContent = glyph.name;
      document.getElementById('glyph-info-radius').textContent = glyph.radius;
      document.getElementById('glyph-info-desc').textContent = glyph.description || '';
      document.getElementById('glyph-info-bonus').textContent = glyph.bonusEffect || '';
      const req = document.getElementById('glyph-info-req');
      const threshold = glyph.bonusThreshold || 0;
      const inRadius = countStatInRadius(boardId, glyphId, glyph.bonusStat, glyph.radius);
      if (threshold > 0) {
        req.textContent = `Requires ${threshold} ${glyph.bonusStat || 'attribute'} in radius (${inRadius}/${threshold})`;
        req.className = 'glyph-req ' + (inRadius >= threshold ? 'met' : 'unmet');
      } else {
        req.textContent = '';
      }
    } else {
      glyphInfo.classList.add('hidden');
    }
  } else {
    glyphInfo.classList.add('hidden');
  }
}

function countStatInRadius(boardId, glyphId, stat, radius) {
  if (!stat) return 0;
  const glyphNode = generateNodes(boardId).find(n => n.type === 'glyph');
  if (!glyphNode) return 0;
  const bState = state.boards[boardId];
  const activated = bState.activatedNodes;
  return generateNodes(boardId).filter(n => {
    if (!activated.has(n.key)) return false;
    const dist = Math.abs(n.col - glyphNode.col) + Math.abs(n.row - glyphNode.row);
    return dist <= radius && n.stat === stat;
  }).reduce((sum, n) => {
    return sum + (STAT_VALUES.normal[n.stat] || 0);
  }, 0);
}

// ─────────────────────────────────────────────────
//  STAT CALCULATION
// ─────────────────────────────────────────────────
function calculateStats() {
  const totals = {
    dexterity: 0, strength: 0, intelligence: 0, willpower: 0,
    life: 0, armor: 0, damage: 0, vulnerable: 0, critdmg: 0, poison: 0, trap: 0
  };

  state.activeBoards.forEach(boardId => {
    const bState = state.boards[boardId];
    const activated = bState.activatedNodes;
    generateNodes(boardId).forEach(node => {
      if (!activated.has(node.key)) return;
      if (node.type === 'normal' && node.stat) {
        totals[node.stat] = (totals[node.stat] || 0) + (STAT_VALUES.normal[node.stat] || 0);
        // Secondary stats from normal nodes
        const secondaryVal = 2;
        ['dexterity','strength','intelligence','willpower'].forEach(s => {
          if (s !== node.stat) totals[s] = (totals[s] || 0) + (secondaryVal * 0.1 | 0); // small secondary
        });
      } else if (node.type === 'magic' && node.stat) {
        totals[node.stat] = (totals[node.stat] || 0) + (STAT_VALUES.magic[node.stat] || 5);
        // Magic nodes also give secondary bonuses from their type
      } else if (node.type === 'rare' && DATA) {
        const rareData = DATA.rareNodes && DATA.rareNodes[node.id];
        if (rareData && rareData.bonus) {
          Object.entries(rareData.bonus).forEach(([k, v]) => {
            totals[k] = (totals[k] || 0) + v;
          });
        }
      }
      // Life / armor from magic nodes
      if (node.type === 'magic') {
        totals.life  += 6;
        totals.armor += 4;
      }
    });

    // Glyph bonus
    const glyphId = bState.glyphId;
    if (glyphId && DATA) {
      const glyph = DATA.glyphs.find(g => g.id === glyphId);
      if (glyph) {
        // Apply glyph effects based on type
        applyGlyphStats(glyph, boardId, totals);
      }
    }
  });

  // Derive bonuses from primary stats
  totals.damage    += Math.floor(totals.dexterity * 0.1);
  totals.critdmg   += Math.floor(totals.dexterity * 0.08);
  totals.vulnerable+= Math.floor(totals.intelligence * 0.06);
  totals.life      += Math.floor(totals.willpower * 1.5);
  totals.armor     += Math.floor(totals.strength * 0.5);
  totals.poison    += Math.floor(totals.dexterity * 0.04 + totals.intelligence * 0.04);
  totals.trap      += Math.floor(totals.dexterity * 0.06);

  return totals;
}

function applyGlyphStats(glyph, boardId, totals) {
  const level = 1; // Glyphs at level 1 for now
  const baseEffect = 15 + level * 2;
  switch (glyph.id) {
    case 'ambush':     totals.trap      += baseEffect; break;
    case 'cutthroat':  totals.damage    += baseEffect; break;
    case 'marksman':   totals.damage    += baseEffect; break;
    case 'bladedancer':totals.damage    += baseEffect - 3; totals.dexterity += 8; break;
    case 'control':    totals.damage    += baseEffect; break;
    case 'exploit':    totals.vulnerable+= baseEffect + 5; break;
    case 'efficacy':   totals.damage    += baseEffect - 5; break;
    case 'domination': totals.damage    += baseEffect; break;
    case 'turf':       totals.armor     += 30; totals.dexterity += 5; break;
    case 'revenge':    totals.damage    += baseEffect - 5; break;
    case 'imp':        totals.poison    += baseEffect; break;
    case 'territorial':totals.dexterity += 10; totals.strength  += 5; break;
    case 'torch':      totals.damage    += baseEffect; break;
    case 'elementalist':totals.intelligence += 10; totals.damage += 10; break;
    case 'ranger':     totals.damage    += baseEffect; break;
    case 'subtlety':   totals.damage    += baseEffect; break;
    default:           totals.damage    += 10; break;
  }
}

function updateStatsPanel() {
  const stats = calculateStats();
  document.getElementById('stat-dexterity').textContent    = stats.dexterity;
  document.getElementById('stat-strength').textContent     = stats.strength;
  document.getElementById('stat-intelligence').textContent = stats.intelligence;
  document.getElementById('stat-willpower').textContent    = stats.willpower;
  document.getElementById('stat-life').textContent         = '+' + stats.life;
  document.getElementById('stat-armor').textContent        = '+' + stats.armor;
  document.getElementById('stat-damage').textContent       = '+' + stats.damage + '%';
  document.getElementById('stat-vulnerable').textContent   = '+' + stats.vulnerable + '%';
  document.getElementById('stat-critdmg').textContent      = '+' + stats.critdmg + '%';
  document.getElementById('stat-poison').textContent       = '+' + stats.poison + '%';
  document.getElementById('stat-trap').textContent         = '+' + stats.trap + '%';
}

function updatePointsCounter() {
  let used = 0;
  state.activeBoards.forEach(bid => {
    used += state.boards[bid].activatedNodes.size;
  });
  document.getElementById('points-used').textContent = used;
}

function updateLegendaryPanel() {
  const list = document.getElementById('legendary-list');
  list.innerHTML = '';
  const legendaries = [];

  state.activeBoards.forEach(boardId => {
    const bState = state.boards[boardId];
    const legNode = generateNodes(boardId).find(n => n.type === 'legendary');
    if (legNode && bState.activatedNodes.has(legNode.key) && DATA) {
      const legData = DATA.legendaryNodes && DATA.legendaryNodes[legNode.id];
      if (legData) {
        legendaries.push({ boardId, data: legData });
      }
    }
  });

  if (legendaries.length === 0) {
    list.innerHTML = '<div class="empty-msg">Allocate the Legendary Node on each board to unlock its power.</div>';
    return;
  }

  legendaries.forEach(({ boardId, data }) => {
    const item = document.createElement('div');
    item.className = 'legendary-item';
    item.innerHTML = `
      <div class="legendary-item-name">${data.name}</div>
      <div class="legendary-item-board">${BOARD_DEFS[boardId].name}</div>
      <div class="legendary-item-desc">${data.description}</div>
    `;
    list.appendChild(item);
  });
}

function updateBoardList() {
  const list = document.getElementById('board-list');
  list.innerHTML = '';
  state.activeBoards.forEach(boardId => {
    const def = BOARD_DEFS[boardId];
    const bState = state.boards[boardId];
    const count = bState.activatedNodes.size;
    const item = document.createElement('div');
    item.className = 'board-item' + (boardId === state.selectedBoard ? ' active' : '');
    item.dataset.board = boardId;
    item.innerHTML = `
      <div class="board-item-dot"></div>
      <span class="board-item-name">${def.name}</span>
      <span class="board-item-nodes">${count}</span>
    `;
    item.addEventListener('click', () => {
      state.selectedBoard = boardId;
      updateBoardInfoPanel();
      render();
    });
    list.appendChild(item);
  });

  updateAvailableBoards();
}

function updateAvailableBoards() {
  const container = document.getElementById('available-boards');
  container.innerHTML = '';
  const allBoards = Object.keys(BOARD_DEFS).filter(id => !BOARD_DEFS[id].isStarting);
  allBoards.forEach(boardId => {
    const def = BOARD_DEFS[boardId];
    const added = state.activeBoards.includes(boardId);
    const btn = document.createElement('button');
    btn.className = 'avail-board-btn' + (added ? ' added' : '');
    btn.innerHTML = `<span class="add-icon">${added ? '✓' : '+'}</span>${def.name}`;
    if (!added) {
      btn.addEventListener('click', () => addBoard(boardId));
    }
    container.appendChild(btn);
  });
}

function updateBoardInfoPanel() {
  const boardId = state.selectedBoard;
  const def = BOARD_DEFS[boardId];
  document.getElementById('info-board-name').textContent = def.name;

  // Update rotation buttons
  const rotBtns = document.querySelectorAll('.rot-btn');
  const currentRot = state.boards[boardId] ? state.boards[boardId].rotation : 0;
  const isStarting = def.isStarting;
  rotBtns.forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.rotation) === currentRot);
    btn.disabled = isStarting;
    btn.style.opacity = isStarting ? '0.4' : '1';
  });
}

// ─────────────────────────────────────────────────
//  BOARD MANAGEMENT
// ─────────────────────────────────────────────────
function addBoard(boardId) {
  if (state.activeBoards.includes(boardId)) return;
  state.activeBoards.push(boardId);
  state.boards[boardId] = { activatedNodes: new Set(), rotation: 0, glyphId: null };
  // Auto-activate entry gate
  const def = BOARD_DEFS[boardId];
  const entryGate = def.gates.find(g => g.direction === 'north') || def.gates[0];
  if (entryGate) state.boards[boardId].activatedNodes.add(`${entryGate.col},${entryGate.row}`);
  state.selectedBoard = boardId;
  updateBoardInfoPanel();
  render();
}

function removeBoard(boardId) {
  if (boardId === 'starting') return;
  state.activeBoards = state.activeBoards.filter(b => b !== boardId);
  delete state.boards[boardId];
  if (state.selectedBoard === boardId) {
    state.selectedBoard = 'starting';
  }
  render();
}

// ─────────────────────────────────────────────────
//  ZOOM & PAN
// ─────────────────────────────────────────────────
function applyTransform() {
  canvasRoot.setAttribute('transform', `translate(${state.pan.x},${state.pan.y}) scale(${state.zoom})`);
  document.getElementById('zoom-label').textContent = Math.round(state.zoom * 100) + '%';
}

function fitToScreen() {
  const wrapper = document.getElementById('svg-wrapper');
  const rect = wrapper.getBoundingClientRect();
  const layouts = getBoardLayouts();
  if (state.activeBoards.length === 0) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  state.activeBoards.forEach(bid => {
    const l = layouts[bid];
    minX = Math.min(minX, l.x - NODE_GAP);
    minY = Math.min(minY, l.y - NODE_GAP);
    maxX = Math.max(maxX, l.x + l.bw + NODE_GAP);
    maxY = Math.max(maxY, l.y + l.bh + NODE_GAP);
  });

  const contentW = maxX - minX;
  const contentH = maxY - minY;
  const scaleX = rect.width / contentW;
  const scaleY = rect.height / contentH;
  state.zoom = Math.min(scaleX, scaleY, 2) * 0.9;
  state.pan.x = (rect.width / 2)  - (minX + contentW / 2) * state.zoom;
  state.pan.y = (rect.height / 2) - (minY + contentH / 2) * state.zoom;
  applyTransform();
}

// ─────────────────────────────────────────────────
//  TOOLTIP
// ─────────────────────────────────────────────────
const tooltip = document.getElementById('node-tooltip');

function showTooltip(e, boardId, node) {
  const wrapper = document.getElementById('svg-wrapper');
  const wRect = wrapper.getBoundingClientRect();
  const x = e.clientX - wRect.left;
  const y = e.clientY - wRect.top;

  tooltip.querySelector('.tooltip-name').textContent = getNodeDisplayName(boardId, node);
  tooltip.querySelector('.tooltip-type').textContent = getTypeLabel(node.type);
  tooltip.querySelector('.tooltip-type').className = 'tooltip-type ' + node.type;
  tooltip.querySelector('.tooltip-stat').textContent  = getStatLine(node);
  tooltip.querySelector('.tooltip-effect').textContent = getEffectText(boardId, node);
  tooltip.querySelector('.tooltip-hint').textContent  = getHintText(node);

  tooltip.classList.remove('hidden');
  // Position avoiding edges
  let tx = x + 12, ty = y - 10;
  if (tx + 270 > wRect.width) tx = x - 270;
  if (ty + 140 > wRect.height) ty = y - 140;
  tooltip.style.left = tx + 'px';
  tooltip.style.top  = ty + 'px';
}

function hideTooltip() { tooltip.classList.add('hidden'); }

function getNodeDisplayName(boardId, node) {
  if (node.type === 'start') return 'Starting Node';
  if (node.type === 'gate') return 'Board Gate';
  if (node.type === 'glyph') return 'Glyph Socket';
  if (node.type === 'legendary' && DATA) {
    const ld = DATA.legendaryNodes && DATA.legendaryNodes[node.id];
    return ld ? ld.name : 'Legendary Node';
  }
  if (node.type === 'rare' && DATA) {
    const rd = DATA.rareNodes && DATA.rareNodes[node.id];
    return rd ? rd.name : 'Rare Node';
  }
  if (node.stat) return capitalize(node.stat) + ' Node';
  return 'Paragon Node';
}

function getTypeLabel(type) {
  const labels = { start:'Start', gate:'Gate', normal:'Normal', magic:'Magic',
                   rare:'Rare', legendary:'Legendary', glyph:'Glyph' };
  return labels[type] || type;
}

function getStatLine(node) {
  if (node.type === 'normal' && node.stat) {
    return `+${STAT_VALUES.normal[node.stat]} ${capitalize(node.stat)}`;
  }
  if (node.type === 'magic' && node.stat) {
    return `+${STAT_VALUES.magic[node.stat] || 5} ${capitalize(node.stat)} + bonuses`;
  }
  return '';
}

function getEffectText(boardId, node) {
  if (node.type === 'legendary' && DATA) {
    const ld = DATA.legendaryNodes && DATA.legendaryNodes[node.id];
    return ld ? ld.description : 'Powerful legendary effect';
  }
  if (node.type === 'rare' && DATA) {
    const rd = DATA.rareNodes && DATA.rareNodes[node.id];
    return rd ? rd.description : 'Rare bonus node';
  }
  if (node.type === 'glyph') return 'Click to assign a Glyph';
  if (node.type === 'gate') return 'Connects to adjacent board';
  if (node.type === 'magic') return '+Bonus stat effect';
  return '';
}

function getHintText(node) {
  const isActive = state.boards[state.selectedBoard]?.activatedNodes.has(node.key);
  if (node.type === 'glyph') return 'Click to select glyph';
  if (isActive) return 'Click to deactivate';
  return 'Click to activate';
}

// ─────────────────────────────────────────────────
//  EXPORT / IMPORT
// ─────────────────────────────────────────────────
function exportBuild() {
  const data = {
    version: '1.0',
    class: 'rogue',
    activeBoards: state.activeBoards,
    boards: {}
  };
  state.activeBoards.forEach(bid => {
    const bs = state.boards[bid];
    data.boards[bid] = {
      activatedNodes: [...bs.activatedNodes],
      rotation: bs.rotation,
      glyphId: bs.glyphId
    };
  });
  return data;
}

function importBuild(data) {
  if (!data || data.class !== 'rogue') throw new Error('Invalid build data');
  state.activeBoards = data.activeBoards || ['starting'];
  state.boards = {};
  state._nodeCache = {};
  state.activeBoards.forEach(bid => {
    const bs = data.boards[bid] || {};
    state.boards[bid] = {
      activatedNodes: new Set(bs.activatedNodes || []),
      rotation: bs.rotation || 0,
      glyphId: bs.glyphId || null
    };
  });
  state.selectedBoard = state.activeBoards[0];
  updateBoardInfoPanel();
}

function generateShareCode(buildData) {
  try {
    const json = JSON.stringify(buildData);
    return btoa(encodeURIComponent(json));
  } catch { return ''; }
}

function decodeShareCode(code) {
  try {
    return JSON.parse(decodeURIComponent(atob(code)));
  } catch { throw new Error('Invalid share code'); }
}

// ─────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function getNodeRadius(type) {
  const radii = { start:18, gate:16, legendary:18, rare:16, magic:14, glyph:17, normal:13 };
  return radii[type] || 13;
}

function getStrokeWidth(type, active) {
  if (type === 'legendary') return active ? 3 : 2;
  if (type === 'rare') return active ? 2.5 : 2;
  if (type === 'magic') return active ? 2 : 1.5;
  return active ? 2 : 1.5;
}

function getNodeIcon(node) {
  switch (node.type) {
    case 'start':     return '⚔';
    case 'gate':      return '🏛';
    case 'legendary': return '★';
    case 'glyph':     return '◈';
    case 'rare':      return '◆';
    case 'magic':     return STAT_ICONS[node.stat] || '◉';
    case 'normal':    return STAT_ICONS[node.stat] || '·';
    default: return '';
  }
}

function getIconColor(node, isActive) {
  if (node.type === 'legendary') return isActive ? '#ffaa00' : '#c04000';
  if (node.type === 'rare')      return isActive ? '#ffd700' : '#a08000';
  if (node.type === 'glyph')     return isActive ? '#bb88ff' : '#7744cc';
  if (node.type === 'start')     return isActive ? '#ff8866' : '#cc4422';
  if (node.type === 'gate')      return isActive ? '#8899dd' : '#445588';
  if (node.stat) return isActive ? (STAT_COLORS[node.stat] + 'ff') : (STAT_COLORS[node.stat] + '88');
  return isActive ? '#888' : '#444';
}

function getIconSize(type) {
  const sizes = { start:12, gate:11, legendary:14, rare:10, glyph:13, magic:9, normal:8 };
  return sizes[type] || 8;
}

function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }

// ─────────────────────────────────────────────────
//  EVENT WIRING
// ─────────────────────────────────────────────────
function setupEvents() {
  // Zoom
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    state.zoom = Math.min(state.zoom * 1.2, 4);
    applyTransform();
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    state.zoom = Math.max(state.zoom / 1.2, 0.2);
    applyTransform();
  });
  document.getElementById('btn-zoom-fit').addEventListener('click', fitToScreen);

  // Wheel zoom
  const wrapper = document.getElementById('svg-wrapper');
  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = wrapper.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(state.zoom * factor, 0.2), 4);
    state.pan.x = mx - (mx - state.pan.x) * (newZoom / state.zoom);
    state.pan.y = my - (my - state.pan.y) * (newZoom / state.zoom);
    state.zoom = newZoom;
    applyTransform();
  }, { passive: false });

  // Pan
  wrapper.addEventListener('mousedown', (e) => {
    if (e.target.closest('.node')) return;
    state.isPanning = true;
    state.panStart = { x: e.clientX - state.pan.x, y: e.clientY - state.pan.y };
    wrapper.classList.add('dragging');
  });
  window.addEventListener('mousemove', (e) => {
    if (!state.isPanning) return;
    state.pan.x = e.clientX - state.panStart.x;
    state.pan.y = e.clientY - state.panStart.y;
    applyTransform();
  });
  window.addEventListener('mouseup', () => {
    state.isPanning = false;
    wrapper.classList.remove('dragging');
  });

  // Touch pan/zoom
  let lastTouchDist = 0;
  let lastTouchCenter = { x: 0, y: 0 };
  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      state.isPanning = true;
      state.panStart = { x: e.touches[0].clientX - state.pan.x, y: e.touches[0].clientY - state.pan.y };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.sqrt(dx*dx + dy*dy);
      lastTouchCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    }
  }, { passive: true });
  wrapper.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && state.isPanning) {
      state.pan.x = e.touches[0].clientX - state.panStart.x;
      state.pan.y = e.touches[0].clientY - state.panStart.y;
      applyTransform();
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const factor = dist / (lastTouchDist || dist);
      const rect = wrapper.getBoundingClientRect();
      const cx = lastTouchCenter.x - rect.left;
      const cy = lastTouchCenter.y - rect.top;
      const newZoom = Math.min(Math.max(state.zoom * factor, 0.2), 4);
      state.pan.x = cx - (cx - state.pan.x) * (newZoom / state.zoom);
      state.pan.y = cy - (cy - state.pan.y) * (newZoom / state.zoom);
      state.zoom = newZoom;
      lastTouchDist = dist;
      applyTransform();
    }
  }, { passive: false });
  wrapper.addEventListener('touchend', () => { state.isPanning = false; });

  // Rotation buttons
  document.getElementById('rotation-btns').addEventListener('click', (e) => {
    const btn = e.target.closest('.rot-btn');
    if (!btn) return;
    const rotation = parseInt(btn.dataset.rotation);
    const boardId = state.selectedBoard;
    if (BOARD_DEFS[boardId].isStarting) return;
    state.boards[boardId].rotation = rotation;
    state._nodeCache[boardId] = null; // clear cache (rotation doesn't affect grid, only display)
    updateBoardInfoPanel();
    render();
  });

  // Glyph select
  document.getElementById('glyph-select').addEventListener('change', (e) => {
    if (!state.selectedGlyphSocket) return;
    const { boardId } = state.selectedGlyphSocket;
    state.boards[boardId].glyphId = e.target.value || null;
    updateGlyphPanel();
    render();
  });

  // Reset
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Reset all activated nodes?')) return;
    state.activeBoards.forEach(bid => {
      state.boards[bid].activatedNodes.clear();
      if (bid === 'starting') state.boards[bid].activatedNodes.add('6,0');
      else {
        const def = BOARD_DEFS[bid];
        const eg = def.gates.find(g => g.direction === 'north') || def.gates[0];
        if (eg) state.boards[bid].activatedNodes.add(`${eg.col},${eg.row}`);
      }
    });
    state.selectedGlyphSocket = null;
    updateGlyphPanel();
    render();
  });

  // Export
  document.getElementById('btn-export').addEventListener('click', () => {
    const buildData = exportBuild();
    document.getElementById('export-json').value = JSON.stringify(buildData, null, 2);
    document.getElementById('share-code-input').value = generateShareCode(buildData);
    showModal('export');
  });
  document.getElementById('btn-copy-code').addEventListener('click', () => {
    copyText(document.getElementById('share-code-input').value);
  });
  document.getElementById('btn-copy-json').addEventListener('click', () => {
    copyText(document.getElementById('export-json').value);
  });

  // Import
  document.getElementById('btn-import').addEventListener('click', () => showModal('import'));
  document.getElementById('btn-import-code').addEventListener('click', () => {
    const code = document.getElementById('import-code-input').value.trim();
    try {
      const data = decodeShareCode(code);
      importBuild(data);
      hideModal();
      render();
    } catch (err) {
      showImportError(err.message);
    }
  });
  document.getElementById('btn-import-json').addEventListener('click', () => {
    const json = document.getElementById('import-json').value.trim();
    try {
      const data = JSON.parse(json);
      importBuild(data);
      hideModal();
      render();
    } catch (err) {
      showImportError(err.message);
    }
  });

  // Modal close
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', hideModal);
  });
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideModal();
  });

  // View mode
  document.getElementById('btn-view-single').addEventListener('click', () => {
    state.viewMode = 'single';
    document.getElementById('btn-view-single').classList.add('active');
    document.getElementById('btn-view-all').classList.remove('active');
    render();
    fitToScreen();
  });
  document.getElementById('btn-view-all').addEventListener('click', () => {
    state.viewMode = 'all';
    document.getElementById('btn-view-all').classList.add('active');
    document.getElementById('btn-view-single').classList.remove('active');
    render();
    fitToScreen();
  });
}

function showModal(name) {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  document.getElementById(`modal-${name}`).classList.remove('hidden');
}

function hideModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  document.getElementById('import-error').classList.add('hidden');
}

function showImportError(msg) {
  const el = document.getElementById('import-error');
  el.textContent = 'Error: ' + msg;
  el.classList.remove('hidden');
}

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

// ─────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────
async function init() {
  // Load game data
  try {
    const resp = await fetch('paragon-data.json');
    DATA = await resp.json();
  } catch (e) {
    console.warn('Could not load paragon-data.json, using defaults:', e.message);
    DATA = { glyphs: [], boards: [], legendaryNodes: {}, rareNodes: {} };
  }

  // Populate glyph dropdown with data
  if (DATA && DATA.glyphs && DATA.glyphs.length) {
    const sel = document.getElementById('glyph-select');
    sel.innerHTML = '<option value="">— None —</option>';
    DATA.glyphs.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = `${g.name} (radius ${g.radius})`;
      sel.appendChild(opt);
    });
  }

  // Init starting board
  state.boards.starting.activatedNodes.add('6,0');

  setupEvents();
  updateBoardInfoPanel();

  // Initial render then fit
  render();
  setTimeout(() => {
    fitToScreen();
    applyTransform();
  }, 100);
}

document.addEventListener('DOMContentLoaded', init);
