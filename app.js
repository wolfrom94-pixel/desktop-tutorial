'use strict';
// ═══════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════
const G   = 44;    // grid spacing px (node center-to-center)
const R   = 18;    // default node radius px
const BOARD_GAP = G * 2.5;   // gap between connected boards

const OPP = { north:'south', south:'north', east:'west', west:'east' };
const DIR_ARROW = { north:'▲', south:'▼', east:'▶', west:'◀' };
const DIR_LABEL = { north:'N', south:'S', east:'E', west:'W' };

// Stat colours
const SCOL = { dexterity:'#3a90d0', strength:'#d06030', intelligence:'#9060d0', willpower:'#40a870' };
const SICON = { dexterity:'👣', strength:'🛡', intelligence:'💎', willpower:'🌿' };

// ═══════════════════════════════════════════════
//  BOARD DEFINITIONS
//  rowRanges[row] = [minCol, maxCol] | null
//  specialNodes   = { 'col,row': {type, ...} }
// ═══════════════════════════════════════════════
const BOARD_DEFS = {

  /* ── Starting Board ── 13 wide × 15 tall diamond shape */
  starting: {
    name: 'Starting Board', isStarting: true,
    width: 13, height: 15,
    rowRanges: [
      [6,6],  // 0  – start node
      [5,7],  // 1
      [4,8],  // 2
      [3,9],  // 3
      [2,10], // 4
      [2,10], // 5
      [1,11], // 6
      [1,11], // 7  – legendary
      [1,11], // 8
      [2,10], // 9  – glyph socket
      [3,9],  // 10
      [4,8],  // 11
      [5,7],  // 12
      [5,7],  // 13
      [6,6],  // 14 – south gate
    ],
    specialNodes: {
      '6,0':  { type:'start' },
      '6,7':  { type:'legendary', id:'starting_legendary' },
      '6,9':  { type:'glyph' },
      '6,14': { type:'gate', direction:'south' },
      // Magic nodes (scattered across board)
      '3,3':{ type:'magic' }, '9,3': { type:'magic' },
      '2,5':{ type:'magic' }, '10,5':{ type:'magic' },
      '1,7':{ type:'magic' }, '11,7':{ type:'magic' },
      '2,9':{ type:'magic' }, '10,9':{ type:'magic' },
      '4,11':{ type:'magic' },'8,11':{ type:'magic' },
      // Rare nodes
      '4,4': { type:'rare', id:'rare_starting_1' },
      '8,4': { type:'rare', id:'rare_starting_2' },
      '4,10':{ type:'rare', id:'rare_starting_3' },
      '8,10':{ type:'rare', id:'rare_starting_4' },
    },
    gates: [{ id:'gate_s', col:6, row:14, direction:'south' }],
  },

  /* ── Standard additional boards: 21 × 21 cross shape ─────────────────
     Cross arms 5 wide, full horizontal in center rows 8-12, transition rows.
     Gate positions: N(10,0) S(10,20) W(0,10) E(20,10)
  ──────────────────────────────────────────────────────────────────────── */
  deadly_ambush: {
    name:'Deadly Ambush', width:21, height:21,
    rowRanges:_cross(),
    specialNodes:{
      '10,0': { type:'gate', direction:'north' },
      '10,20':{ type:'gate', direction:'south' },
      '0,10': { type:'gate', direction:'west'  },
      '20,10':{ type:'gate', direction:'east'  },
      '10,10':{ type:'legendary', id:'deadly_ambush_legendary' },
      '10,4': { type:'glyph' },
      '9,2':{ type:'magic' },'11,2':{ type:'magic' },
      '9,7':{ type:'magic' },'11,7':{ type:'magic' },
      '3,9':{ type:'magic' },'17,9':{ type:'magic' },
      '3,11':{ type:'magic' },'17,11':{ type:'magic' },
      '9,14':{ type:'magic' },'11,14':{ type:'magic' },
      '9,18':{ type:'magic' },'11,18':{ type:'magic' },
      '9,3': { type:'rare', id:'rare_deadly_ambush_1' },
      '11,3':{ type:'rare', id:'rare_deadly_ambush_2' },
      '5,10':{ type:'rare', id:'rare_deadly_ambush_3' },
      '15,10':{ type:'rare', id:'rare_deadly_ambush_4' },
      '9,16':{ type:'rare', id:'rare_deadly_ambush_5' },
      '11,16':{ type:'rare', id:'rare_deadly_ambush_6' },
    },
    gates:[
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west'  },
      { id:'gate_e', col:20, row:10, direction:'east'  },
    ],
  },

  eldritch_bounty: {
    name:'Eldritch Bounty', width:21, height:21,
    rowRanges:_cross(),
    specialNodes:{
      '10,0': { type:'gate', direction:'north' },
      '10,20':{ type:'gate', direction:'south' },
      '0,10': { type:'gate', direction:'west'  },
      '20,10':{ type:'gate', direction:'east'  },
      '10,10':{ type:'legendary', id:'eldritch_bounty_legendary' },
      '10,16':{ type:'glyph' },
      '10,3':{ type:'magic' },
      '9,6':{ type:'magic' },'11,6':{ type:'magic' },
      '2,9':{ type:'magic' },'18,9':{ type:'magic' },
      '2,11':{ type:'magic' },'18,11':{ type:'magic' },
      '9,15':{ type:'magic' },'11,15':{ type:'magic' },
      '9,19':{ type:'magic' },'11,19':{ type:'magic' },
      '7,10':{ type:'rare', id:'rare_eldritch_bounty_1' },
      '13,10':{ type:'rare', id:'rare_eldritch_bounty_2' },
      '10,7': { type:'rare', id:'rare_eldritch_bounty_3' },
      '10,13':{ type:'rare', id:'rare_eldritch_bounty_4' },
      '4,10': { type:'rare', id:'rare_eldritch_bounty_5' },
      '16,10':{ type:'rare', id:'rare_eldritch_bounty_6' },
    },
    gates:[
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west'  },
      { id:'gate_e', col:20, row:10, direction:'east'  },
    ],
  },

  cheap_shot: {
    name:'Cheap Shot', width:21, height:21,
    rowRanges:_cross(),
    specialNodes:{
      '10,0': { type:'gate', direction:'north' },
      '10,20':{ type:'gate', direction:'south' },
      '0,10': { type:'gate', direction:'west'  },
      '20,10':{ type:'gate', direction:'east'  },
      '10,10':{ type:'legendary', id:'cheap_shot_legendary' },
      '10,7': { type:'glyph' },
      '10,2':{ type:'magic' },
      '9,5':{ type:'magic' },'11,5':{ type:'magic' },
      '4,9':{ type:'magic' },'16,9':{ type:'magic' },
      '4,11':{ type:'magic' },'16,11':{ type:'magic' },
      '9,12':{ type:'magic' },'11,12':{ type:'magic' },
      '10,17':{ type:'magic' },
      '9,8':{ type:'rare', id:'rare_cheap_shot_1' },
      '11,8':{ type:'rare', id:'rare_cheap_shot_2' },
      '6,10':{ type:'rare', id:'rare_cheap_shot_3' },
      '14,10':{ type:'rare', id:'rare_cheap_shot_4' },
      '10,14':{ type:'rare', id:'rare_cheap_shot_5' },
      '10,12':{ type:'rare', id:'rare_cheap_shot_6' },
    },
    gates:[
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west'  },
      { id:'gate_e', col:20, row:10, direction:'east'  },
    ],
  },

  no_witnesses: {
    name:'No Witnesses', width:21, height:21,
    rowRanges:_cross(),
    specialNodes:{
      '10,0': { type:'gate', direction:'north' },
      '10,20':{ type:'gate', direction:'south' },
      '0,10': { type:'gate', direction:'west'  },
      '20,10':{ type:'gate', direction:'east'  },
      '10,10':{ type:'legendary', id:'no_witnesses_legendary' },
      '10,14':{ type:'glyph' },
      '10,1':{ type:'magic' },
      '9,4':{ type:'magic' },'11,4':{ type:'magic' },
      '1,10':{ type:'magic' },'19,10':{ type:'magic' },
      '6,9':{ type:'magic' },'14,9':{ type:'magic' },
      '6,11':{ type:'magic' },'14,11':{ type:'magic' },
      '10,17':{ type:'magic' },
      '9,7':{ type:'rare', id:'rare_no_witnesses_1' },
      '11,7':{ type:'rare', id:'rare_no_witnesses_2' },
      '3,10':{ type:'rare', id:'rare_no_witnesses_3' },
      '17,10':{ type:'rare', id:'rare_no_witnesses_4' },
      '10,19':{ type:'rare', id:'rare_no_witnesses_5' },
      '11,13':{ type:'rare', id:'rare_no_witnesses_6' },
    },
    gates:[
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west'  },
      { id:'gate_e', col:20, row:10, direction:'east'  },
    ],
  },

  cunning_stratagem: {
    name:'Cunning Stratagem', width:21, height:21,
    rowRanges:_cross(),
    specialNodes:{
      '10,0': { type:'gate', direction:'north' },
      '10,20':{ type:'gate', direction:'south' },
      '0,10': { type:'gate', direction:'west'  },
      '20,10':{ type:'gate', direction:'east'  },
      '10,10':{ type:'legendary', id:'cunning_stratagem_legendary' },
      '10,4': { type:'glyph' },
      '9,1':{ type:'magic' },'11,1':{ type:'magic' },
      '10,6':{ type:'magic' },
      '2,10':{ type:'magic' },'18,10':{ type:'magic' },
      '5,9':{ type:'magic' },'15,9':{ type:'magic' },
      '5,11':{ type:'magic' },'15,11':{ type:'magic' },
      '10,16':{ type:'magic' },
      '9,5':{ type:'rare', id:'rare_cunning_stratagem_1' },
      '11,5':{ type:'rare', id:'rare_cunning_stratagem_2' },
      '4,10':{ type:'rare', id:'rare_cunning_stratagem_3' },
      '16,10':{ type:'rare', id:'rare_cunning_stratagem_4' },
      '10,18':{ type:'rare', id:'rare_cunning_stratagem_5' },
      '9,14':{ type:'rare', id:'rare_cunning_stratagem_6' },
    },
    gates:[
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west'  },
      { id:'gate_e', col:20, row:10, direction:'east'  },
    ],
  },

  tricks_of_trade: {
    name:'Tricks of the Trade', width:21, height:21,
    rowRanges:_cross(),
    specialNodes:{
      '10,0': { type:'gate', direction:'north' },
      '10,20':{ type:'gate', direction:'south' },
      '0,10': { type:'gate', direction:'west'  },
      '20,10':{ type:'gate', direction:'east'  },
      '10,10':{ type:'legendary', id:'tricks_legendary' },
      '10,6': { type:'glyph' },
      '9,2':{ type:'magic' },'11,2':{ type:'magic' },
      '9,5':{ type:'magic' },'11,5':{ type:'magic' },
      '3,9':{ type:'magic' },'17,9':{ type:'magic' },
      '3,11':{ type:'magic' },'17,11':{ type:'magic' },
      '9,14':{ type:'magic' },'11,14':{ type:'magic' },
      '10,18':{ type:'magic' },
      '10,8':{ type:'rare', id:'rare_tricks_1' },
      '8,10':{ type:'rare', id:'rare_tricks_2' },
      '12,10':{ type:'rare', id:'rare_tricks_3' },
      '9,11':{ type:'rare', id:'rare_tricks_4' },
      '11,11':{ type:'rare', id:'rare_tricks_5' },
      '10,13':{ type:'rare', id:'rare_tricks_6' },
    },
    gates:[
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west'  },
      { id:'gate_e', col:20, row:10, direction:'east'  },
    ],
  },

  exploit_weakness: {
    name:'Exploit Weakness', width:21, height:21,
    rowRanges:_cross(),
    specialNodes:{
      '10,0': { type:'gate', direction:'north' },
      '10,20':{ type:'gate', direction:'south' },
      '0,10': { type:'gate', direction:'west'  },
      '20,10':{ type:'gate', direction:'east'  },
      '10,10':{ type:'legendary', id:'exploit_legendary' },
      '10,16':{ type:'glyph' },
      '9,2':{ type:'magic' },'11,2':{ type:'magic' },
      '10,5':{ type:'magic' },
      '1,9':{ type:'magic' },'19,9':{ type:'magic' },
      '1,11':{ type:'magic' },'19,11':{ type:'magic' },
      '10,13':{ type:'magic' },
      '9,15':{ type:'magic' },'11,15':{ type:'magic' },
      '9,9':{ type:'rare', id:'rare_exploit_weakness_1' },
      '11,9':{ type:'rare', id:'rare_exploit_weakness_2' },
      '5,10':{ type:'rare', id:'rare_exploit_weakness_3' },
      '15,10':{ type:'rare', id:'rare_exploit_weakness_4' },
      '10,11':{ type:'rare', id:'rare_exploit_weakness_5' },
      '12,10':{ type:'rare', id:'rare_exploit_weakness_6' },
    },
    gates:[
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west'  },
      { id:'gate_e', col:20, row:10, direction:'east'  },
    ],
  },

  leyrana_instinct: {
    name:"Leyrana's Instinct", width:21, height:21,
    rowRanges:_cross(),
    specialNodes:{
      '10,0': { type:'gate', direction:'north' },
      '10,20':{ type:'gate', direction:'south' },
      '0,10': { type:'gate', direction:'west'  },
      '20,10':{ type:'gate', direction:'east'  },
      '10,10':{ type:'legendary', id:'leyrana_instinct_legendary' },
      '10,5': { type:'glyph' },
      '9,2':{ type:'magic' },'11,2':{ type:'magic' },
      '9,7':{ type:'magic' },'11,7':{ type:'magic' },
      '2,9':{ type:'magic' },'18,9':{ type:'magic' },
      '2,11':{ type:'magic' },'18,11':{ type:'magic' },
      '10,15':{ type:'magic' },
      '9,18':{ type:'magic' },'11,18':{ type:'magic' },
      '9,3':{ type:'rare', id:'rare_leyrana_instinct_1' },
      '11,3':{ type:'rare', id:'rare_leyrana_instinct_2' },
      '4,10':{ type:'rare', id:'rare_leyrana_instinct_3' },
      '16,10':{ type:'rare', id:'rare_leyrana_instinct_4' },
      '10,8':{ type:'rare', id:'rare_leyrana_instinct_5' },
      '10,13':{ type:'rare', id:'rare_leyrana_instinct_6' },
    },
    gates:[
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west'  },
      { id:'gate_e', col:20, row:10, direction:'east'  },
    ],
  },

  danse_macabre: {
    name:'Danse Macabre', width:21, height:21,
    rowRanges:_cross(),
    specialNodes:{
      '10,0': { type:'gate', direction:'north' },
      '10,20':{ type:'gate', direction:'south' },
      '0,10': { type:'gate', direction:'west'  },
      '20,10':{ type:'gate', direction:'east'  },
      '10,10':{ type:'legendary', id:'danse_macabre_legendary' },
      '10,16':{ type:'glyph' },
      '9,2':{ type:'magic' },'11,2':{ type:'magic' },
      '10,5':{ type:'magic' },
      '3,9':{ type:'magic' },'17,9':{ type:'magic' },
      '3,11':{ type:'magic' },'17,11':{ type:'magic' },
      '9,14':{ type:'magic' },'11,14':{ type:'magic' },
      '10,19':{ type:'magic' },
      '9,3':{ type:'rare', id:'rare_danse_macabre_1' },
      '11,3':{ type:'rare', id:'rare_danse_macabre_2' },
      '5,10':{ type:'rare', id:'rare_danse_macabre_3' },
      '15,10':{ type:'rare', id:'rare_danse_macabre_4' },
      '10,8':{ type:'rare', id:'rare_danse_macabre_5' },
      '10,13':{ type:'rare', id:'rare_danse_macabre_6' },
    },
    gates:[
      { id:'gate_n', col:10, row:0,  direction:'north' },
      { id:'gate_s', col:10, row:20, direction:'south' },
      { id:'gate_w', col:0,  row:10, direction:'west'  },
      { id:'gate_e', col:20, row:10, direction:'east'  },
    ],
  },
};

/* Generate cross rowRanges for 21×21 boards */
function _cross() {
  return Array.from({ length:21 }, (_,r) => {
    if (r === 0 || r === 20)  return [10,10];
    if (r >= 1  && r <= 7)   return [8,12];
    if (r === 8 || r === 12) return [6,14];
    return [0,20]; // rows 9,10,11
  });
}

// ═══════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════
const state = {
  // boardId -> { activated: Set<key>, rotation: 0|90|180|270, glyphId: null|string }
  boardStates: {
    starting: { activated: new Set(['6,0']), rotation:0, glyphId:null }
  },
  // 'boardId:direction' -> connectedBoardId
  connections: {},
  // Board we're currently showing in the sidebar info
  selectedBoard: 'starting',
  // Pending gate when board selection modal is open
  pendingGate: null,
  // Selected glyph socket (for right panel)
  selectedGlyphSocket: null,
  // Pan / zoom
  pan:{ x:0, y:0 }, zoom:1,
  isPanning:false, _panStart:{ x:0, y:0 },
};

// ═══════════════════════════════════════════════
//  GAME DATA (loaded from JSON)
// ═══════════════════════════════════════════════
let DATA = { glyphs:[], legendaryNodes:{}, rareNodes:{} };

// ═══════════════════════════════════════════════
//  NODE GENERATION  (cached per board)
// ═══════════════════════════════════════════════
const _nodeCache = {};

function generateNodes(boardId) {
  if (_nodeCache[boardId]) return _nodeCache[boardId];
  const def = BOARD_DEFS[boardId];
  const nodes = [];
  def.rowRanges.forEach((range, row) => {
    if (!range) return;
    const [mc, xc] = range;
    for (let col = mc; col <= xc; col++) {
      const key = `${col},${row}`;
      const sp  = def.specialNodes[key];
      let type, stat, id;
      if (sp) {
        type = sp.type;
        stat = sp.stat || (type === 'magic' ? _magicStat(col, row, boardId) : null);
        id   = sp.id || key;
      } else {
        type = 'normal';
        stat = _defaultStat(col, row, boardId);
        id   = key;
      }
      nodes.push({ id, key, col, row, type, stat, sp: sp||null });
    }
  });
  _nodeCache[boardId] = nodes;
  return nodes;
}

function _defaultStat(c, r, bid) {
  const h = (c*31 + r*17 + bid.length*7) % 12;
  return h<5 ? 'dexterity' : h<8 ? 'strength' : h<11 ? 'intelligence' : 'willpower';
}
function _magicStat(c, r, bid) {
  return ['dexterity','strength','intelligence','willpower'][(c*13+r*29+bid.length)%4];
}

function nodeByKey(boardId, key) {
  return generateNodes(boardId).find(n => n.key === key);
}

function adjacentKeys(key) {
  const [c,r] = key.split(',').map(Number);
  return [`${c},${r-1}`,`${c},${r+1}`,`${c-1},${r}`,`${c+1},${r}`];
}

// ═══════════════════════════════════════════════
//  BOARD TREE HELPERS
// ═══════════════════════════════════════════════
function activeBoardIds() {
  return Object.keys(state.boardStates);
}

function connectedBoard(boardId, dir) {
  return state.connections[`${boardId}:${dir}`] || null;
}

// All boards in BFS order from starting
function orderedBoards() {
  const result = [];
  const seen = new Set();
  const queue = ['starting'];
  while (queue.length) {
    const bid = queue.shift();
    if (seen.has(bid)) continue;
    seen.add(bid); result.push(bid);
    const def = BOARD_DEFS[bid];
    if (def && def.gates) {
      def.gates.forEach(g => {
        const nb = connectedBoard(bid, g.direction);
        if (nb && !seen.has(nb)) queue.push(nb);
      });
    }
  }
  return result;
}

// ═══════════════════════════════════════════════
//  BOARD POSITIONS  (tree-based layout)
// ═══════════════════════════════════════════════
function computePositions() {
  const pos = {};
  const visited = new Set();
  const queue = [{ bid:'starting', px:0, py:0 }];

  while (queue.length) {
    const { bid, px, py } = queue.shift();
    if (visited.has(bid)) continue;
    visited.add(bid);
    pos[bid] = { x:px, y:py };

    const def = BOARD_DEFS[bid];
    const bst = state.boardStates[bid];
    if (!def || !bst) continue;

    def.gates.forEach(gate => {
      const nbId = connectedBoard(bid, gate.direction);
      if (!nbId || visited.has(nbId)) return;
      const ndef = BOARD_DEFS[nbId];
      if (!ndef) return;

      // Gate position in current board (pixel offset within board)
      const rot = bst.rotation;
      const gp  = rotatePoint(gate.col * G, gate.row * G,
                              (def.width-1)*G/2, (def.height-1)*G/2, rot);

      // Entry gate in the new board (opposite direction)
      const entryDir  = OPP[gate.direction];
      const entryGate = ndef.gates.find(g => g.direction === entryDir) || ndef.gates[0];
      const nrot = state.boardStates[nbId]?.rotation || 0;
      const ep   = rotatePoint(entryGate.col*G, entryGate.row*G,
                               (ndef.width-1)*G/2, (ndef.height-1)*G/2, nrot);

      // The gate of the new board aligns to (px + gp) in world coords
      const gx = px + gp.x;
      const gy = py + gp.y;

      // Push new board so its entry gate lands at (gx + delta, gy + delta)
      const margin = BOARD_GAP;
      let nx, ny;
      switch (gate.direction) {
        case 'south': nx = gx - ep.x; ny = gy + margin; break;
        case 'north': nx = gx - ep.x; ny = gy - (ndef.height-1)*G - margin; break;
        case 'east':  nx = gx + margin; ny = gy - ep.y; break;
        case 'west':  nx = gx - (ndef.width-1)*G - margin; ny = gy - ep.y; break;
      }
      queue.push({ bid:nbId, px:nx, py:ny });
    });
  }
  return pos;
}

function rotatePoint(x, y, cx, cy, deg) {
  if (!deg) return { x, y };
  const rad = deg * Math.PI / 180;
  const dx = x - cx, dy = y - cy;
  return {
    x: cx + dx*Math.cos(rad) - dy*Math.sin(rad),
    y: cy + dx*Math.sin(rad) + dy*Math.cos(rad),
  };
}

function nodeWorldPos(boardId, col, row) {
  const pos = _posCache[boardId];
  if (!pos) return { x:0, y:0 };
  const def = BOARD_DEFS[boardId];
  const rot = state.boardStates[boardId]?.rotation || 0;
  const p = rotatePoint(col*G, row*G, (def.width-1)*G/2, (def.height-1)*G/2, rot);
  return { x: pos.x + p.x, y: pos.y + p.y };
}

// Cache positions (invalidated on state change)
let _posCache = {};
function refreshPositions() { _posCache = computePositions(); }

// ═══════════════════════════════════════════════
//  NODE COLOURS
// ═══════════════════════════════════════════════
const NC = {
  start:     { f:'#2a0600', s:'#aa1800', af:'#4a0e00', as:'#ff3020' },
  gate:      { f:'#080c1a', s:'#2a4080', af:'#142040', as:'#5080d0' },
  'gate-avail':{ f:'#0a2010',s:'#208040',af:'#153015',as:'#40e080' },
  'gate-conn': { f:'#0a2010',s:'#40e080',af:'#183020',as:'#60ffa0' },
  normal:    { f:'#160a0e', s:'#4a2a38', af:'#2a1820', as:'#9a6070' },
  magic:     { f:'#080e22', s:'#1a3090', af:'#182040', as:'#4080e0' },
  rare:      { f:'#1c1000', s:'#907000', af:'#302000', as:'#e0b000' },
  legendary: { f:'#3a0a00', s:'#c03800', af:'#5a1800', as:'#ff7020' },
  glyph:     { f:'#110828', s:'#6633bb', af:'#201040', as:'#aa55ff' },
};

function nodeColors(node, isActive, isGate, gateState) {
  let key = node.type;
  if (isGate) {
    if      (gateState === 'connected')  key = 'gate-conn';
    else if (gateState === 'available')  key = 'gate-avail';
    else                                 key = 'gate';
  }
  const c = NC[key] || NC.normal;
  return isActive ? { fill:c.af, stroke:c.as } : { fill:c.f, stroke:c.s };
}

// ═══════════════════════════════════════════════
//  PATH VALIDATION
// ═══════════════════════════════════════════════
// Returns Set<key> of all keys reachable from seeds through activated nodes
function reachableFrom(boardId) {
  const def  = BOARD_DEFS[boardId];
  const bs   = state.boardStates[boardId];
  if (!bs) return new Set();
  const act  = bs.activated;
  const all  = new Set(generateNodes(boardId).map(n=>n.key));

  const seeds = [];
  if (def.isStarting) {
    seeds.push('6,0');
  } else {
    // Entry gates (already activated from parent connection)
    def.gates.forEach(g => {
      const k = `${g.col},${g.row}`;
      if (act.has(k)) seeds.push(k);
    });
  }

  const reach = new Set();
  const q = [...seeds];
  while (q.length) {
    const k = q.shift();
    if (reach.has(k)) continue;
    reach.add(k);
    adjacentKeys(k).forEach(adj => {
      if (!reach.has(adj) && act.has(adj) && all.has(adj)) q.push(adj);
    });
  }
  return reach;
}

// Can we deactivate 'key' without disconnecting any other active node?
function canDeactivate(boardId, key) {
  const bs   = state.boardStates[boardId];
  const def  = BOARD_DEFS[boardId];
  const test = new Set(bs.activated);
  test.delete(key);
  const all  = new Set(generateNodes(boardId).map(n=>n.key));

  const seeds = [];
  if (def.isStarting) { seeds.push('6,0'); }
  else {
    def.gates.forEach(g => { const k=`${g.col},${g.row}`; if(test.has(k)) seeds.push(k); });
  }

  const reach = new Set();
  const q = [...seeds];
  while (q.length) {
    const k = q.shift();
    if (reach.has(k)) continue;
    reach.add(k);
    adjacentKeys(k).forEach(adj => {
      if (!reach.has(adj) && test.has(adj) && all.has(adj)) q.push(adj);
    });
  }
  for (const k of test) { if (!reach.has(k)) return false; }
  return true;
}

// When a node is deactivated, cascade-remove any nodes that become unreachable
function cascadeRemove(boardId) {
  const bs  = state.boardStates[boardId];
  const reach = reachableFrom(boardId);
  const toRemove = [...bs.activated].filter(k => !reach.has(k));
  toRemove.forEach(k => bs.activated.delete(k));
}

// ═══════════════════════════════════════════════
//  BOARD MANAGEMENT
// ═══════════════════════════════════════════════
function attachBoard(parentBoardId, parentDir, newBoardId) {
  const entryDir = OPP[parentDir];
  state.connections[`${parentBoardId}:${parentDir}`] = newBoardId;
  state.connections[`${newBoardId}:${entryDir}`]     = parentBoardId;

  // Init board state + auto-activate entry gate
  if (!state.boardStates[newBoardId]) {
    state.boardStates[newBoardId] = { activated: new Set(), rotation:0, glyphId:null };
  }
  const entryGate = BOARD_DEFS[newBoardId].gates.find(g => g.direction === entryDir);
  if (entryGate) {
    state.boardStates[newBoardId].activated.add(`${entryGate.col},${entryGate.row}`);
  }
  state.selectedBoard = newBoardId;
}

function removeBoard(boardId) {
  if (boardId === 'starting') return;
  _removeBoardRecursive(boardId, null);
  // Also remove the connection pointing to this board from its parent
  Object.keys(state.connections).forEach(k => {
    if (state.connections[k] === boardId && !k.startsWith(boardId+':')) {
      delete state.connections[k];
    }
  });
  if (state.selectedBoard === boardId) state.selectedBoard = 'starting';
  if (state.selectedGlyphSocket?.boardId === boardId) state.selectedGlyphSocket = null;
}

function _removeBoardRecursive(boardId, parentId) {
  const def = BOARD_DEFS[boardId];
  if (def && def.gates) {
    def.gates.forEach(g => {
      const nb = state.connections[`${boardId}:${g.direction}`];
      if (nb && nb !== parentId) _removeBoardRecursive(nb, boardId);
    });
  }
  Object.keys(state.connections).forEach(k => {
    if (k.startsWith(boardId+':') || state.connections[k] === boardId) delete state.connections[k];
  });
  delete state.boardStates[boardId];
}

function usedBoardIds() { return new Set(Object.keys(state.boardStates)); }

// ═══════════════════════════════════════════════
//  CLICK HANDLING
// ═══════════════════════════════════════════════
function onNodeClick(boardId, key) {
  const node = nodeByKey(boardId, key);
  if (!node) return;
  state.selectedBoard = boardId;

  // Glyph socket → open glyph modal
  if (node.type === 'glyph') {
    state.selectedGlyphSocket = { boardId, key };
    openGlyphModal(boardId, key);
    updateGlyphPanel();
    updateBoardInfoPanel();
    render();
    return;
  }

  // Gate → board selection or navigation
  if (node.type === 'gate') {
    const dir  = node.sp?.direction;
    const conn = connectedBoard(boardId, dir);
    const bs   = state.boardStates[boardId];

    if (conn) {
      // Already connected → navigate to that board
      state.selectedBoard = conn;
    } else {
      // Gate must be reached (activated) to connect a board
      if (!bs.activated.has(key) && !BOARD_DEFS[boardId].isStarting) {
        // Activate the gate first if adjacent to active nodes
        const canReach = adjacentKeys(key).some(adj => bs.activated.has(adj));
        if (!canReach) return;
        bs.activated.add(key);
      } else if (BOARD_DEFS[boardId].isStarting) {
        bs.activated.add(key);
      } else {
        bs.activated.add(key);
      }
      // Show board selection modal
      const used = usedBoardIds();
      const available = Object.keys(BOARD_DEFS)
        .filter(id => !BOARD_DEFS[id].isStarting && !used.has(id));

      if (available.length === 0) {
        updateBoardInfoPanel(); render(); return;
      }
      state.pendingGate = { boardId, direction: dir, gateKey: key };
      openBoardSelectModal(boardId, dir, available);
    }
    updateBoardInfoPanel();
    render();
    return;
  }

  // Start node → always active
  if (node.type === 'start') {
    state.boardStates[boardId].activated.add(key);
    render(); return;
  }

  // Normal / magic / rare / legendary nodes
  const bs  = state.boardStates[boardId];
  if (!bs) return;

  // For non-starting boards, ensure there's an active entry gate
  const def = BOARD_DEFS[boardId];
  if (!def.isStarting) {
    const hasGate = def.gates.some(g => bs.activated.has(`${g.col},${g.row}`));
    if (!hasGate) return;
  }

  const act = bs.activated;

  if (act.has(key)) {
    // DEACTIVATE – only if it doesn't disconnect the path
    if (node.type === 'start') return;
    if (!canDeactivate(boardId, key)) {
      _flash(boardId, key);
      return;
    }
    act.delete(key);
    cascadeRemove(boardId);
  } else {
    // ACTIVATE – must be adjacent to at least one active node
    const isAdj = def.isStarting
      ? (key === '6,0' || adjacentKeys(key).some(k2 => act.has(k2)))
      : adjacentKeys(key).some(k2 => act.has(k2));
    if (!isAdj) { _flash(boardId, key); return; }
    act.add(key);
  }

  updateBoardInfoPanel();
  render();
}

function _flash(boardId, key) {
  const el = document.querySelector(
    `[data-board="${boardId}"][data-key="${key}"] circle`);
  if (!el) return;
  el.style.transition = 'opacity .08s';
  el.style.opacity = '.2';
  setTimeout(() => { el.style.opacity = ''; }, 200);
}

// ═══════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════
function openBoardSelectModal(fromBoardId, dir, available) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('modal-board-select').classList.remove('hidden');
  document.getElementById('modal-export').classList.add('hidden');
  document.getElementById('modal-import').classList.add('hidden');
  document.getElementById('modal-glyph-select').classList.add('hidden');

  document.getElementById('modal-board-title').textContent =
    `Attach Board — ${BOARD_DEFS[fromBoardId].name} (${DIR_LABEL[dir]} Gate)`;
  document.getElementById('modal-board-sub').textContent =
    `Choose a board to connect at the ${dir.toUpperCase()} gate.`;

  const list = document.getElementById('board-choice-list');
  list.innerHTML = '';
  available.forEach(bid => {
    const def = BOARD_DEFS[bid];
    const btn = document.createElement('button');
    btn.className = 'board-choice-btn';
    btn.innerHTML = `<span class="bc-name">${def.name}</span>
                     <span class="bc-sub">4 gates · 1 Legendary · 1 Glyph</span>`;
    btn.addEventListener('click', () => {
      attachBoard(fromBoardId, dir, bid);
      state.pendingGate = null;
      closeModal();
      refreshPositions();
      render();
      fitToScreen();
    });
    list.appendChild(btn);
  });
}

function openGlyphModal(boardId, key) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('modal-glyph-select').classList.remove('hidden');
  document.getElementById('modal-board-select').classList.add('hidden');
  document.getElementById('modal-export').classList.add('hidden');
  document.getElementById('modal-import').classList.add('hidden');

  document.getElementById('modal-glyph-sub').textContent =
    `Board: ${BOARD_DEFS[boardId].name}`;

  const list = document.getElementById('glyph-choice-list');
  list.innerHTML = '';
  const equipped = state.boardStates[boardId]?.glyphId;

  DATA.glyphs.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'glyph-choice-btn' + (g.id === equipped ? ' equipped' : '');
    btn.innerHTML = `<span class="gc-name">${g.name}</span>
                     <span class="gc-radius">Radius ${g.radius}</span>
                     <span class="gc-desc">${(g.description||'').slice(0,60)}…</span>`;
    btn.addEventListener('click', () => {
      state.boardStates[boardId].glyphId = g.id;
      state.selectedGlyphSocket = { boardId, key };
      closeModal();
      updateGlyphPanel();
      render();
    });
    list.appendChild(btn);
  });
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

// ═══════════════════════════════════════════════
//  RENDERING
// ═══════════════════════════════════════════════
const SVG = document.getElementById('paragon-canvas');
const L_BG    = document.getElementById('layer-bg');
const L_CONN  = document.getElementById('layer-connectors');
const L_GRAD  = document.getElementById('layer-glyph-radius');
const L_EDGES = document.getElementById('layer-connections');
const L_NODES = document.getElementById('layer-nodes');
const L_LBLS  = document.getElementById('layer-labels');
const ROOT    = document.getElementById('canvas-root');

function render() {
  refreshPositions();
  L_BG.innerHTML = '';
  L_CONN.innerHTML = '';
  L_GRAD.innerHTML = '';
  L_EDGES.innerHTML = '';
  L_NODES.innerHTML = '';
  L_LBLS.innerHTML = '';

  const bids = orderedBoards();
  bids.forEach(bid => renderBoard(bid));
  renderGateBridges(bids);
}

function renderBoard(boardId) {
  const def  = BOARD_DEFS[boardId];
  const bs   = state.boardStates[boardId];
  if (!def || !bs) return;
  const pos  = _posCache[boardId];
  if (!pos) return;
  const act  = bs.activated;
  const rot  = bs.rotation;
  const nodes = generateNodes(boardId);
  const reach = reachableFrom(boardId);
  const isSelected = boardId === state.selectedBoard;

  // Board background
  const bw  = (def.width-1)  * G + G*1.2;
  const bh  = (def.height-1) * G + G*1.2;
  const bg  = el('rect', {
    x: pos.x - G*0.6, y: pos.y - G*0.6, width: bw, height: bh,
    fill: 'url(#board-bg)',
    stroke: isSelected ? '#7a3060' : '#1e0d1a',
    'stroke-width': isSelected ? 2 : 1, rx: 5,
  });
  L_BG.appendChild(bg);

  // Board label
  const lbl = el('text', {
    x: pos.x + (def.width-1)*G/2,
    y: pos.y - G*0.3,
    class: 'board-label-svg',
    fill: isSelected ? '#c09020' : '#705040',
  });
  lbl.textContent = def.name;
  L_LBLS.appendChild(lbl);

  // Node connections (edges between adjacent activated nodes)
  nodes.forEach(n => {
    if (!act.has(n.key)) return;
    [{ dc:1,dr:0 },{ dc:0,dr:1 }].forEach(({ dc,dr }) => {
      const adjKey = `${n.col+dc},${n.row+dr}`;
      if (!act.has(adjKey)) return;
      const p1 = nodeWorldPos(boardId, n.col, n.row);
      const [ac,ar] = adjKey.split(',').map(Number);
      const p2 = nodeWorldPos(boardId, ac, ar);
      const line = el('line',{
        x1:p1.x,y1:p1.y, x2:p2.x,y2:p2.y,
        stroke:'#c83030','stroke-width':3,opacity:.75,'stroke-linecap':'round',
      });
      L_EDGES.appendChild(line);
    });
  });

  // Glyph radius ring
  const glyphNode = nodes.find(n => n.type === 'glyph');
  if (glyphNode && bs.glyphId) {
    const glyph = DATA.glyphs.find(g => g.id === bs.glyphId);
    if (glyph) {
      const wp = nodeWorldPos(boardId, glyphNode.col, glyphNode.row);
      const ring = el('circle',{
        cx:wp.x, cy:wp.y, r: glyph.radius * G,
        class:'glyph-radius-ring',
      });
      L_GRAD.appendChild(ring);
    }
  }

  // Render nodes
  nodes.forEach(n => {
    const wp     = nodeWorldPos(boardId, n.col, n.row);
    const isAct  = act.has(n.key);
    const isGate = n.type === 'gate';
    const dir    = n.sp?.direction;
    const conn   = isGate ? connectedBoard(boardId, dir) : null;
    const gateState = isGate
      ? (conn ? 'connected' : (isAct ? 'available' : 'inactive'))
      : null;

    const col  = nodeColors(n, isAct, isGate, gateState);
    const nr   = nodeRadius(n.type);
    const sw   = isAct ? 2.5 : 1.5;

    const opacity = (!def.isStarting && !reach.has(n.key) && !isGate && n.type!=='glyph') ? 0.35 : 1;

    const g = el('g', {
      'data-board': boardId, 'data-key': n.key,
      class: `node node-${n.type}`,
      style: 'cursor:pointer',
    });

    // Outer glow ring for special nodes
    if (n.type === 'legendary' && isAct) {
      const ring = el('circle',{ cx:wp.x,cy:wp.y,r:nr+7,fill:'none',stroke:'#ff7020','stroke-width':1,opacity:.4,filter:'url(#glow-leg)' });
      g.appendChild(ring);
    }
    if (n.type === 'rare' && isAct) {
      const ring = el('circle',{ cx:wp.x,cy:wp.y,r:nr+5,fill:'none',stroke:'#e0b000','stroke-width':1,opacity:.5,filter:'url(#glow-rare)' });
      g.appendChild(ring);
    }
    if (isGate && gateState !== 'inactive') {
      const ring = el('circle',{ cx:wp.x,cy:wp.y,r:nr+5,fill:'none',stroke:gateState==='connected'?'#40e080':'#5080d0','stroke-width':1.5,opacity:.6,filter:'url(#glow-gate)' });
      g.appendChild(ring);
    }

    // Main circle
    const circle = el('circle',{
      cx:wp.x, cy:wp.y, r:nr,
      fill:col.fill, stroke:col.stroke, 'stroke-width':sw, opacity,
    });
    if (n.type==='legendary' && isAct) circle.setAttribute('filter','url(#glow-leg)');
    else if (n.type==='magic' && isAct) circle.setAttribute('filter','url(#glow-magic)');
    g.appendChild(circle);

    // Node icon
    const icon = nodeIcon(n, boardId, bs, gateState);
    if (icon) {
      const t = el('text',{
        x:wp.x, y:wp.y,
        'font-size': iconSize(n.type),
        fill: iconColor(n, isAct, gateState),
        'dominant-baseline':'central','text-anchor':'middle',
        'pointer-events':'none', opacity,
      });
      t.textContent = icon;
      g.appendChild(t);
    }

    // Stat colour bar
    if ((n.type==='normal'||n.type==='magic') && n.stat) {
      const bar = el('rect',{
        x:wp.x-nr*.55, y:wp.y+nr-5,
        width:nr*1.1, height:3,
        fill:SCOL[n.stat]||'#888', rx:1.5,
        opacity: opacity*(isAct?1:.4),
      });
      g.appendChild(bar);
    }

    // Gate: direction label + connected board name
    if (isGate) {
      // Direction arrow
      const arr = el('text',{
        x:wp.x, y:wp.y + nr + 12,
        class:'gate-dir-label',
        fill: gateState==='connected' ? '#60ffa0'
            : gateState==='available' ? '#5080d0' : '#2a4080',
      });
      arr.textContent = DIR_ARROW[dir] + ' ' + DIR_LABEL[dir];
      L_LBLS.appendChild(arr);

      if (conn) {
        const cl = el('text',{
          x:wp.x, y:wp.y + nr + 22,
          class:'gate-conn-label',
        });
        cl.textContent = BOARD_DEFS[conn]?.name?.slice(0,12) || conn;
        L_LBLS.appendChild(cl);
      } else if (gateState === 'available') {
        const cl = el('text',{
          x:wp.x, y:wp.y + nr + 22,
          class:'gate-conn-label',
          fill:'#4090c0',
        });
        cl.textContent = '[ Click to add ]';
        L_LBLS.appendChild(cl);
      }
    }

    g.addEventListener('click', e => { e.stopPropagation(); onNodeClick(boardId, n.key); });
    g.addEventListener('mouseenter', e => showTooltip(e, boardId, n, gateState));
    g.addEventListener('mouseleave', hideTooltip);
    L_NODES.appendChild(g);
  });
}

function renderGateBridges(bids) {
  bids.forEach(bid => {
    const def = BOARD_DEFS[bid];
    if (!def.gates) return;
    def.gates.forEach(gate => {
      const nb = connectedBoard(bid, gate.direction);
      if (!nb) return;
      const gp  = nodeWorldPos(bid, gate.col, gate.row);
      const def2 = BOARD_DEFS[nb];
      if (!def2) return;
      const entryDir = OPP[gate.direction];
      const eg = def2.gates.find(g=>g.direction===entryDir);
      if (!eg) return;
      const ep = nodeWorldPos(nb, eg.col, eg.row);
      const bs1 = state.boardStates[bid];
      const bs2 = state.boardStates[nb];
      const both = bs1?.activated.has(`${gate.col},${gate.row}`) &&
                   bs2?.activated.has(`${eg.col},${eg.row}`);
      const line = el('line',{
        x1:gp.x,y1:gp.y, x2:ep.x,y2:ep.y,
        stroke: both ? '#60e080' : '#2a4040',
        'stroke-width': 2,
        'stroke-dasharray': both ? 'none' : '5,4',
        opacity: both ? .8 : .4,
      });
      L_CONN.appendChild(line);
    });
  });
}

// ═══════════════════════════════════════════════
//  NODE VISUAL HELPERS
// ═══════════════════════════════════════════════
function nodeRadius(type) {
  return { start:18,gate:17,legendary:19,glyph:17,rare:15,magic:14,normal:13 }[type]||13;
}
function nodeIcon(n, boardId, bs, gateState) {
  if (n.type==='start')     return '⚔';
  if (n.type==='gate') {
    const dir = n.sp?.direction;
    const conn = connectedBoard(boardId, dir);
    return conn ? '⬡' : (gateState==='available' ? '◈' : '◇');
  }
  if (n.type==='legendary') return '★';
  if (n.type==='glyph') {
    const gid = bs.glyphId;
    return gid ? '⬡' : '⬡';
  }
  if (n.type==='rare')  return '◆';
  if (n.type==='magic') return SICON[n.stat]||'○';
  return SICON[n.stat]||'·';
}
function iconColor(n, isAct, gateState) {
  if (n.type==='legendary') return isAct ? '#ffaa00' : '#c04000';
  if (n.type==='rare')      return isAct ? '#ffd700' : '#a08000';
  if (n.type==='glyph')     return isAct ? '#bb88ff' : '#7744cc';
  if (n.type==='start')     return isAct ? '#ff8866' : '#cc4422';
  if (n.type==='gate') {
    if (gateState==='connected') return '#60ffa0';
    if (gateState==='available') return '#80b0ff';
    return '#304060';
  }
  if (n.stat) return isAct ? SCOL[n.stat] : SCOL[n.stat]+'88';
  return isAct ? '#888' : '#333';
}
function iconSize(type) {
  return { start:12,gate:12,legendary:14,glyph:13,rare:10,magic:9,normal:8 }[type]||8;
}

// ═══════════════════════════════════════════════
//  SVG UTILITY
// ═══════════════════════════════════════════════
function el(tag, attrs={}) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k,v));
  return e;
}

// ═══════════════════════════════════════════════
//  TOOLTIP
// ═══════════════════════════════════════════════
const TT = document.getElementById('tooltip');
function showTooltip(e, boardId, n, gateState) {
  const wr   = document.getElementById('svg-wrapper').getBoundingClientRect();
  const name = getNodeName(boardId, n);
  const type = getTypeLabel(n.type, gateState);
  const stat = getStatLine(n);
  const eff  = getEffectLine(boardId, n);
  const hint = getHint(n, boardId, gateState);

  TT.querySelector('.tt-name').textContent    = name;
  TT.querySelector('.tt-badge').textContent   = type;
  TT.querySelector('.tt-badge').className     = `tt-badge ${getBadgeClass(n.type, gateState)}`;
  TT.querySelector('.tt-stat').textContent    = stat;
  TT.querySelector('.tt-effect').textContent  = eff;
  TT.querySelector('.tt-hint').textContent    = hint;
  TT.classList.remove('hidden');

  let tx = e.clientX - wr.left + 12;
  let ty = e.clientY - wr.top  - 10;
  if (tx + 260 > wr.width)  tx = e.clientX - wr.left - 270;
  if (ty + 150 > wr.height) ty = e.clientY - wr.top  - 160;
  TT.style.left = tx+'px'; TT.style.top = ty+'px';
}
function hideTooltip() { TT.classList.add('hidden'); }

function getNodeName(boardId, n) {
  if (n.type==='start')     return 'Starting Node';
  if (n.type==='glyph')     return state.boardStates[boardId]?.glyphId
    ? (DATA.glyphs.find(g=>g.id===state.boardStates[boardId].glyphId)?.name || 'Glyph Socket')
    : 'Glyph Socket';
  if (n.type==='legendary') return DATA.legendaryNodes?.[n.id]?.name || 'Legendary Node';
  if (n.type==='rare')      return DATA.rareNodes?.[n.id]?.name || 'Rare Node';
  if (n.type==='gate') {
    const dir = n.sp?.direction;
    const conn = connectedBoard(boardId, dir);
    return conn ? `Gate → ${BOARD_DEFS[conn]?.name}` : `Gate (${dir?.toUpperCase()})`;
  }
  if (n.stat) return cap(n.stat)+' Node';
  return 'Paragon Node';
}
function getTypeLabel(type, gs) {
  if (type==='gate') return gs==='connected' ? 'Connected' : gs==='available' ? 'Available Gate' : 'Gate';
  return { start:'Start',normal:'Normal',magic:'Magic',rare:'Rare',legendary:'Legendary',glyph:'Glyph' }[type]||type;
}
function getBadgeClass(type, gs) {
  if (type==='gate') return gs==='available'||gs==='connected' ? 'gate-avail' : 'gate';
  return type;
}
function getStatLine(n) {
  if (n.type==='normal'&&n.stat) return `+5 ${cap(n.stat)}`;
  if (n.type==='magic' &&n.stat) return `+8 ${cap(n.stat)} + bonuses`;
  return '';
}
function getEffectLine(boardId, n) {
  if (n.type==='legendary') return DATA.legendaryNodes?.[n.id]?.description || 'Powerful legendary effect';
  if (n.type==='rare')      return DATA.rareNodes?.[n.id]?.description || 'Rare bonus';
  if (n.type==='glyph') {
    const gid = state.boardStates[boardId]?.glyphId;
    const g = gid ? DATA.glyphs.find(g=>g.id===gid) : null;
    return g ? g.description : 'Click to assign a Glyph to this socket';
  }
  if (n.type==='gate') {
    const dir = n.sp?.direction;
    const conn = connectedBoard(boardId, dir);
    return conn ? `Connected to: ${BOARD_DEFS[conn]?.name}` : 'Reach this gate to attach a new board';
  }
  return '';
}
function getHint(n, boardId, gs) {
  const act = state.boardStates[boardId]?.activated;
  const isAct = act?.has(n.key);
  if (n.type==='glyph') return 'Click to equip / change glyph';
  if (n.type==='gate' && gs==='connected') return 'Click to navigate to connected board';
  if (n.type==='gate' && gs==='available') return 'Click to choose a board to attach';
  if (n.type==='gate') return 'Activate nodes to reach this gate';
  if (isAct) return 'Click to deactivate';
  return 'Click to activate (must connect to existing path)';
}
function cap(s) { return s?s[0].toUpperCase()+s.slice(1):''; }

// ═══════════════════════════════════════════════
//  STATS CALCULATION
// ═══════════════════════════════════════════════
function calcStats() {
  const t = { dexterity:0,strength:0,intelligence:0,willpower:0,
               life:0,armor:0,damage:0,vulnerable:0,critdmg:0,poison:0,trap:0 };

  orderedBoards().forEach(bid => {
    const bs = state.boardStates[bid];
    if (!bs) return;
    generateNodes(bid).forEach(n => {
      if (!bs.activated.has(n.key)) return;
      if (n.type==='normal'&&n.stat)  { t[n.stat]=(t[n.stat]||0)+5; }
      if (n.type==='magic' &&n.stat)  { t[n.stat]=(t[n.stat]||0)+8; t.life+=8; t.armor+=5; }
      if (n.type==='rare') {
        const rd = DATA.rareNodes?.[n.id];
        if (rd?.bonus) Object.entries(rd.bonus).forEach(([k,v]) => { t[k]=(t[k]||0)+v; });
      }
    });
    // Glyph bonus
    if (bs.glyphId) {
      const g = DATA.glyphs.find(g=>g.id===bs.glyphId);
      if (g) applyGlyph(g, t);
    }
  });

  // Derived
  t.damage     += Math.floor(t.dexterity*.12);
  t.critdmg    += Math.floor(t.dexterity*.09);
  t.vulnerable += Math.floor(t.intelligence*.07);
  t.life       += Math.floor(t.willpower*2);
  t.armor      += Math.floor(t.strength*.6);
  t.poison     += Math.floor((t.dexterity+t.intelligence)*.04);
  t.trap       += Math.floor(t.dexterity*.07);
  return t;
}

function applyGlyph(g, t) {
  const b = 17;
  const m = {
    headhunter:'damage',
    ambush:'trap',
    bane_rogue:'poison',
    canny:'damage',
    chip:'damage',
    closer:'damage',
    combat:'critdmg',
    control_rogue:'damage',
    devious:'damage',
    diminish:'damage',
    efficacy:'damage',
    exploit_rogue:'vulnerable',
    explosive:'damage',
    fluidity:'damage',
    frostfeeder:'damage',
    infusion:'damage',
    nightstalker:'poison',
    pride:'damage',
    ranger:'damage',
    snare:'trap',
    tracker_rogue:'poison',
    turf:'armor',
    versatility:'damage',
  };
  const k = m[g.id]||'damage';
  t[k] = (t[k]||0)+b;
}

// ═══════════════════════════════════════════════
//  UI UPDATES
// ═══════════════════════════════════════════════
function updateAll() {
  updateBoardList();
  updateBoardInfoPanel();
  updateGlyphPanel();
  updateStatsPanel();
  updateLegendaryPanel();
  updatePointsCounter();
}

function updateBoardList() {
  const list = document.getElementById('board-list');
  list.innerHTML = '';
  orderedBoards().forEach(bid => {
    const def = BOARD_DEFS[bid];
    const bs  = state.boardStates[bid];
    const cnt = bs ? bs.activated.size : 0;
    const div = document.createElement('div');
    div.className = 'board-item'+(bid===state.selectedBoard?' active':'');
    div.dataset.board = bid;
    div.innerHTML = `
      <div class="board-item-dot"></div>
      <span class="board-item-name">${def.name}</span>
      <span class="board-item-count">${cnt}</span>
      ${!def.isStarting ? `<button class="board-item-remove" data-remove="${bid}" title="Remove board">✕</button>` : ''}
    `;
    div.addEventListener('click', e => {
      if (e.target.dataset.remove) return;
      state.selectedBoard = bid;
      updateBoardInfoPanel();
      render();
    });
    list.appendChild(div);
  });

  // Remove board buttons
  list.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const bid = e.target.dataset.remove;
      if (!bid) return;
      const name = BOARD_DEFS[bid]?.name || bid;
      if (!confirm(`Remove "${name}" and all boards connected through it?`)) return;
      removeBoard(bid);
      refreshPositions();
      updateAll();
      render();
      fitToScreen();
    });
  });
}

function updateBoardInfoPanel() {
  const bid = state.selectedBoard;
  const def = BOARD_DEFS[bid];
  document.getElementById('info-board-name').textContent = def?.name || '';
  const rot = state.boardStates[bid]?.rotation || 0;
  const isStart = def?.isStarting;
  document.querySelectorAll('.rot-btn').forEach(b => {
    const r = parseInt(b.dataset.rotation);
    b.classList.toggle('active', r === rot);
    b.disabled = isStart;
    b.style.opacity = isStart ? '.3' : '1';
  });
}

function updateGlyphPanel() {
  const emptyMsg = document.getElementById('glyph-empty-msg');
  const controls = document.getElementById('glyph-controls');
  const infoBox  = document.getElementById('glyph-info-box');

  if (!state.selectedGlyphSocket) {
    emptyMsg.classList.remove('hidden');
    controls.classList.add('hidden');
    return;
  }
  emptyMsg.classList.add('hidden');
  controls.classList.remove('hidden');

  const { boardId } = state.selectedGlyphSocket;
  const bs  = state.boardStates[boardId];
  document.getElementById('glyph-board-lbl').textContent =
    `Board: ${BOARD_DEFS[boardId]?.name}`;

  const sel = document.getElementById('glyph-select');
  sel.innerHTML = '<option value="">— None —</option>';
  DATA.glyphs.forEach(g => {
    const o = document.createElement('option');
    o.value = g.id;
    o.textContent = `${g.name} (r${g.radius})`;
    if (bs?.glyphId === g.id) o.selected = true;
    sel.appendChild(o);
  });

  const gid   = bs?.glyphId;
  const glyph = gid ? DATA.glyphs.find(g=>g.id===gid) : null;
  if (glyph) {
    infoBox.classList.remove('hidden');
    document.getElementById('gi-name').textContent   = glyph.name;
    document.getElementById('gi-radius').textContent = glyph.radius;
    document.getElementById('gi-desc').textContent   = glyph.description||'';
    document.getElementById('gi-bonus').textContent  = glyph.bonusEffect||'';
    const thr   = glyph.bonusThreshold||0;
    const inR   = countStatInRadius(boardId, glyph);
    const req   = document.getElementById('gi-req');
    if (thr>0) {
      req.textContent = `Requires ${thr} ${glyph.bonusStat||'attribute'} in radius (${inR}/${thr})`;
      req.className   = 'gi-req '+(inR>=thr?'met':'unmet');
    } else { req.textContent=''; }
  } else {
    infoBox.classList.add('hidden');
  }
}

function countStatInRadius(boardId, glyph) {
  if (!glyph?.bonusStat) return 0;
  const glNode = generateNodes(boardId).find(n=>n.type==='glyph');
  if (!glNode) return 0;
  const bs = state.boardStates[boardId];
  return generateNodes(boardId)
    .filter(n => bs?.activated.has(n.key) && n.stat===glyph.bonusStat
              && Math.abs(n.col-glNode.col)+Math.abs(n.row-glNode.row) <= glyph.radius)
    .reduce((s,n)=>s+5, 0);
}

function updateStatsPanel() {
  const s = calcStats();
  document.getElementById('s-dex').textContent   = s.dexterity;
  document.getElementById('s-str').textContent   = s.strength;
  document.getElementById('s-int').textContent   = s.intelligence;
  document.getElementById('s-wil').textContent   = s.willpower;
  document.getElementById('s-life').textContent  = '+'+s.life;
  document.getElementById('s-armor').textContent = '+'+s.armor;
  document.getElementById('s-dmg').textContent   = '+'+s.damage+'%';
  document.getElementById('s-vuln').textContent  = '+'+s.vulnerable+'%';
  document.getElementById('s-crit').textContent  = '+'+s.critdmg+'%';
  document.getElementById('s-poison').textContent= '+'+s.poison+'%';
  document.getElementById('s-trap').textContent  = '+'+s.trap+'%';
}

function updatePointsCounter() {
  let used = 0;
  orderedBoards().forEach(bid => {
    const bs = state.boardStates[bid];
    if (bs) used += bs.activated.size;
  });
  document.getElementById('points-used').textContent = used;
}

function updateLegendaryPanel() {
  const list = document.getElementById('legendary-list');
  list.innerHTML = '';
  const items = [];
  orderedBoards().forEach(bid => {
    const bs = state.boardStates[bid];
    if (!bs) return;
    const legNode = generateNodes(bid).find(n=>n.type==='legendary');
    if (legNode && bs.activated.has(legNode.key)) {
      const ld = DATA.legendaryNodes?.[legNode.id];
      if (ld) items.push({ boardId:bid, data:ld });
    }
  });
  if (!items.length) {
    list.innerHTML = '<div class="dim-msg">Activate a Legendary node to unlock its power.</div>';
    return;
  }
  items.forEach(({ boardId, data }) => {
    const div = document.createElement('div');
    div.className = 'leg-item';
    div.innerHTML = `<div class="leg-name">${data.name}</div>
                     <div class="leg-board">${BOARD_DEFS[boardId].name}</div>
                     <div class="leg-desc">${data.description}</div>`;
    list.appendChild(div);
  });
}

// ═══════════════════════════════════════════════
//  ZOOM & PAN
// ═══════════════════════════════════════════════
function applyTransform() {
  ROOT.setAttribute('transform',
    `translate(${state.pan.x},${state.pan.y}) scale(${state.zoom})`);
  document.getElementById('zoom-label').textContent =
    Math.round(state.zoom*100)+'%';
}

function fitToScreen() {
  const wr  = document.getElementById('svg-wrapper').getBoundingClientRect();
  const pos = _posCache;
  const bids = orderedBoards();
  if (!bids.length) return;
  let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
  bids.forEach(bid => {
    const p  = pos[bid]; if (!p) return;
    const d  = BOARD_DEFS[bid];
    minX = Math.min(minX, p.x-G);
    minY = Math.min(minY, p.y-G);
    maxX = Math.max(maxX, p.x+(d.width-1)*G+G);
    maxY = Math.max(maxY, p.y+(d.height-1)*G+G);
  });
  const cw = maxX-minX, ch = maxY-minY;
  if (cw<=0||ch<=0) return;
  const z = Math.min(wr.width/cw, wr.height/ch, 2)*.88;
  state.zoom  = z;
  state.pan.x = wr.width/2  - (minX+cw/2)*z;
  state.pan.y = wr.height/2 - (minY+ch/2)*z;
  applyTransform();
}

// ═══════════════════════════════════════════════
//  EXPORT / IMPORT
// ═══════════════════════════════════════════════
function exportBuild() {
  const data = { version:'1.1', class:'rogue', connections:{...state.connections}, boards:{} };
  orderedBoards().forEach(bid => {
    const bs = state.boardStates[bid];
    data.boards[bid] = {
      activated: [...bs.activated],
      rotation:  bs.rotation,
      glyphId:   bs.glyphId,
    };
  });
  return data;
}

function importBuild(data) {
  if (!data||data.class!=='rogue') throw new Error('Invalid build file (class must be rogue)');
  state.connections = { ...(data.connections||{}) };
  state.boardStates = {};
  Object.entries(data.boards||{}).forEach(([bid, bs]) => {
    state.boardStates[bid] = {
      activated: new Set(bs.activated||[]),
      rotation:  bs.rotation||0,
      glyphId:   bs.glyphId||null,
    };
  });
  if (!state.boardStates.starting) {
    state.boardStates.starting = { activated:new Set(['6,0']), rotation:0, glyphId:null };
  }
  state.selectedBoard = 'starting';
  state.selectedGlyphSocket = null;
}

function toShareCode(d) {
  try { return btoa(encodeURIComponent(JSON.stringify(d))); } catch { return ''; }
}
function fromShareCode(s) {
  try { return JSON.parse(decodeURIComponent(atob(s))); } catch { throw new Error('Invalid share code'); }
}

function copyText(t) {
  if (navigator.clipboard) { navigator.clipboard.writeText(t).catch(()=>_fallbackCopy(t)); }
  else _fallbackCopy(t);
}
function _fallbackCopy(t) {
  const ta=document.createElement('textarea');
  ta.value=t;ta.style.position='fixed';ta.style.opacity='0';
  document.body.appendChild(ta);ta.select();document.execCommand('copy');
  document.body.removeChild(ta);
}

// ═══════════════════════════════════════════════
//  EVENT SETUP
// ═══════════════════════════════════════════════
function setupEvents() {
  // Zoom buttons
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    state.zoom = Math.min(state.zoom*1.2,4); applyTransform();
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    state.zoom = Math.max(state.zoom/1.2,.2); applyTransform();
  });
  document.getElementById('btn-zoom-fit').addEventListener('click', fitToScreen);

  // Wheel zoom
  const wr = document.getElementById('svg-wrapper');
  wr.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = wr.getBoundingClientRect();
    const mx = e.clientX-rect.left, my = e.clientY-rect.top;
    const f  = e.deltaY<0?1.12:.9;
    const nz = Math.min(Math.max(state.zoom*f,.2),4);
    state.pan.x = mx-(mx-state.pan.x)*(nz/state.zoom);
    state.pan.y = my-(my-state.pan.y)*(nz/state.zoom);
    state.zoom  = nz;
    applyTransform();
  },{passive:false});

  // Mouse pan
  wr.addEventListener('mousedown', e => {
    if (e.target.closest('.node')) return;
    state.isPanning = true;
    state._panStart = { x:e.clientX-state.pan.x, y:e.clientY-state.pan.y };
    wr.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!state.isPanning) return;
    state.pan.x = e.clientX-state._panStart.x;
    state.pan.y = e.clientY-state._panStart.y;
    applyTransform();
  });
  window.addEventListener('mouseup', () => {
    state.isPanning=false;
    wr.classList.remove('dragging');
  });

  // Touch pan/pinch
  let _td=0, _tc={x:0,y:0};
  wr.addEventListener('touchstart', e => {
    if (e.touches.length===1) {
      state.isPanning=true;
      state._panStart={x:e.touches[0].clientX-state.pan.x,y:e.touches[0].clientY-state.pan.y};
    } else if (e.touches.length===2) {
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      _td=Math.sqrt(dx*dx+dy*dy);
      _tc={x:(e.touches[0].clientX+e.touches[1].clientX)/2,y:(e.touches[0].clientY+e.touches[1].clientY)/2};
    }
  },{passive:true});
  wr.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length===1&&state.isPanning) {
      state.pan.x=e.touches[0].clientX-state._panStart.x;
      state.pan.y=e.touches[0].clientY-state._panStart.y;
      applyTransform();
    } else if (e.touches.length===2) {
      const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;
      const d=Math.sqrt(dx*dx+dy*dy);
      const f=d/(_td||d);
      const rect=wr.getBoundingClientRect();
      const cx=_tc.x-rect.left,cy=_tc.y-rect.top;
      const nz=Math.min(Math.max(state.zoom*f,.2),4);
      state.pan.x=cx-(cx-state.pan.x)*(nz/state.zoom);
      state.pan.y=cy-(cy-state.pan.y)*(nz/state.zoom);
      state.zoom=nz; _td=d; applyTransform();
    }
  },{passive:false});
  wr.addEventListener('touchend',()=>{state.isPanning=false;},{passive:true});

  // Rotation
  document.getElementById('rotation-btns').addEventListener('click', e => {
    const btn = e.target.closest('.rot-btn');
    if (!btn) return;
    const bid = state.selectedBoard;
    if (BOARD_DEFS[bid]?.isStarting) return;
    const rot = parseInt(btn.dataset.rotation);
    state.boardStates[bid].rotation = rot;
    updateBoardInfoPanel();
    refreshPositions();
    render();
  });

  // Glyph select (right-panel dropdown)
  document.getElementById('glyph-select').addEventListener('change', e => {
    if (!state.selectedGlyphSocket) return;
    const bid = state.selectedGlyphSocket.boardId;
    state.boardStates[bid].glyphId = e.target.value || null;
    updateGlyphPanel();
    updateStatsPanel();
    render();
  });

  // Remove glyph button in modal
  document.getElementById('glyph-none-btn').addEventListener('click', () => {
    if (!state.selectedGlyphSocket) return;
    const bid = state.selectedGlyphSocket.boardId;
    state.boardStates[bid].glyphId = null;
    closeModal();
    updateGlyphPanel();
    render();
  });

  // Modal close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      closeModal();
    });
  });
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Reset
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Reset all activated nodes on all boards?')) return;
    orderedBoards().forEach(bid => {
      const bs = state.boardStates[bid];
      const def = BOARD_DEFS[bid];
      bs.activated.clear();
      if (def.isStarting) {
        bs.activated.add('6,0');
      } else {
        const eg = def.gates.find(g=>g.direction===
          OPP[def.gates.find(g2=>connectedBoard(bid,OPP[g2.direction]))?.direction||'north']
        ) || def.gates[0];
        if (eg) bs.activated.add(`${eg.col},${eg.row}`);
      }
    });
    state.selectedGlyphSocket = null;
    updateAll(); render();
  });

  // Export
  document.getElementById('btn-export').addEventListener('click', () => {
    const d = exportBuild();
    document.getElementById('export-json').value = JSON.stringify(d, null, 2);
    document.getElementById('share-code').value  = toShareCode(d);
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));
    document.getElementById('modal-export').classList.remove('hidden');
  });
  document.getElementById('btn-copy-code').addEventListener('click',()=>
    copyText(document.getElementById('share-code').value));
  document.getElementById('btn-copy-json').addEventListener('click',()=>
    copyText(document.getElementById('export-json').value));

  // Import
  document.getElementById('btn-import').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));
    document.getElementById('modal-import').classList.remove('hidden');
    document.getElementById('import-err').classList.add('hidden');
  });
  document.getElementById('btn-load-code').addEventListener('click', () => {
    try {
      const d = fromShareCode(document.getElementById('import-code').value.trim());
      importBuild(d); closeModal(); refreshPositions(); updateAll(); render(); fitToScreen();
    } catch(e) { showImportErr(e.message); }
  });
  document.getElementById('btn-load-json').addEventListener('click', () => {
    try {
      const d = JSON.parse(document.getElementById('import-json').value.trim());
      importBuild(d); closeModal(); refreshPositions(); updateAll(); render(); fitToScreen();
    } catch(e) { showImportErr(e.message); }
  });
}

function showImportErr(msg) {
  const el = document.getElementById('import-err');
  el.textContent = 'Error: '+msg;
  el.classList.remove('hidden');
}

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
async function init() {
  try {
    const r = await fetch('paragon-data.json');
    DATA = await r.json();
  } catch (e) {
    console.warn('Could not load paragon-data.json:', e.message);
    DATA = { glyphs:[], legendaryNodes:{}, rareNodes:{} };
  }

  // Populate right-panel glyph dropdown
  const sel = document.getElementById('glyph-select');
  sel.innerHTML = '<option value="">— None —</option>';
  (DATA.glyphs||[]).forEach(g => {
    const o = document.createElement('option');
    o.value = g.id;
    o.textContent = `${g.name} (r${g.radius})`;
    sel.appendChild(o);
  });

  setupEvents();
  refreshPositions();
  updateAll();
  render();
  setTimeout(() => { fitToScreen(); applyTransform(); }, 80);
}

document.addEventListener('DOMContentLoaded', init);
