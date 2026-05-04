import type { LevelDefinition, GameState } from '@/types/game';

// ── Board helpers ────────────────────────────────────────────

export function generateSolved(size: number): number[] {
  return [...Array(size * size).keys()];
}

export function getValidMoves(size: number, emptyIndex: number): number[] {
  const row = Math.floor(emptyIndex / size);
  const col = emptyIndex % size;
  const moves: number[] = [];
  if (col > 0) moves.push(emptyIndex - 1);       // left
  if (col < size - 1) moves.push(emptyIndex + 1); // right
  if (row > 0) moves.push(emptyIndex - size);    // up
  if (row < size - 1) moves.push(emptyIndex + size); // down
  return moves;
}

export function isAdjacent(size: number, a: number, b: number): boolean {
  const ar = Math.floor(a / size), ac = a % size;
  const br = Math.floor(b / size), bc = b % size;
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
}

export function isSolved(tiles: number[]): boolean {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] !== i) return false;
  }
  return true;
}

/** Count inversions to check solvability for standard goal */
export function countInversions(arr: number[]): number {
  let inv = 0;
  const filtered = arr.filter((n) => n !== 0);
  for (let i = 0; i < filtered.length; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      if (filtered[i] > filtered[j]) inv++;
    }
  }
  return inv;
}

export function isSolvable(size: number, tiles: number[]): boolean {
  const inv = countInversions(tiles);
  const emptyRow = Math.floor(tiles.indexOf(0) / size);
  if (size % 2 === 1) {
    return inv % 2 === 0;
  }
  // even width
  return (inv + emptyRow) % 2 === 1;
}

/** Shuffle while guaranteeing solvable and not already solved */
export function shuffleBoard(size: number): number[] {
  let tiles: number[];
  do {
    tiles = generateSolved(size);
    // Fisher–Yates
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (!isSolvable(size, tiles) || isSolved(tiles));
  return tiles;
}

export function makeMove(state: GameState, tileIndex: number): GameState | null {
  if (state.won) return null;
  if (!isAdjacent(Math.sqrt(state.tiles.length), state.emptyIndex, tileIndex)) {
    return null;
  }
  const newTiles = [...state.tiles];
  [newTiles[state.emptyIndex], newTiles[tileIndex]] = [
    newTiles[tileIndex],
    newTiles[state.emptyIndex],
  ];
  const newEmpty = tileIndex;
  return {
    ...state,
    tiles: newTiles,
    emptyIndex: newEmpty,
    moves: state.moves + 1,
    started: true,
    won: isSolved(newTiles),
  };
}

export function getHint(state: GameState): number | null {
  const size = Math.sqrt(state.tiles.length);
  const valid = getValidMoves(size, state.emptyIndex);
  if (valid.length === 0) return null;
  // Choose move that brings the moved tile closer to its solved position
  let best: { idx: number; score: number } | null = null;
  for (const idx of valid) {
    const tile = state.tiles[idx];
    const targetRow = Math.floor(tile / size);
    const targetCol = tile % size;
    const curRow = Math.floor(idx / size);
    const curCol = idx % size;
    const emptyRow = Math.floor(state.emptyIndex / size);
    const emptyCol = state.emptyIndex % size;
    const score =
      Math.abs(targetRow - emptyRow) +
      Math.abs(targetCol - emptyCol) -
      (Math.abs(targetRow - curRow) + Math.abs(targetCol - curCol));
    if (!best || score > best.score) best = { idx, score };
  }
  return best?.idx ?? null;
}

export function autoSolveMoves(state: GameState): number[] {
  // Simple BFS limited to 3 steps for the "magic" boost
  interface Node {
    tiles: number[];
    empty: number;
    path: number[];
  }
  const size = Math.sqrt(state.tiles.length);
  const visited = new Set<string>();
  const queue: Node[] = [
    { tiles: state.tiles, empty: state.emptyIndex, path: [] },
  ];
  const key = (t: number[]) => t.join(',');
  visited.add(key(state.tiles));

  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.path.length >= 3) return cur.path;
    const valid = getValidMoves(size, cur.empty);
    for (const v of valid) {
      const next = [...cur.tiles];
      [next[cur.empty], next[v]] = [next[v], next[cur.empty]];
      const k = key(next);
      if (visited.has(k)) continue;
      visited.add(k);
      queue.push({ tiles: next, empty: v, path: [...cur.path, v] });
    }
  }
  return [];
}

export function computeStars(
  level: LevelDefinition,
  moves: number,
  time: number
): number {
  const [t1, t2, t3] = level.starsThreshold;
  const metric = level.mode === 'timed' ? time : moves;
  if (metric <= t3) return 3;
  if (metric <= t2) return 2;
  if (metric <= t1) return 1;
  return 0;
}

export function getTileColor(size: number, value: number, theme?: string): string {
  if (value === 0) return 'transparent';
  const max = size * size - 1;
  const ratio = value / max;
  switch (theme) {
    case 'forest':
      return `hsl(${140 + ratio * 40}, 70%, ${30 + ratio * 25}%)`;
    case 'ocean':
      return `hsl(${190 + ratio * 30}, 70%, ${35 + ratio * 25}%)`;
    case 'sunset':
      return `hsl(${10 + ratio * 50}, 80%, ${40 + ratio * 20}%)`;
    case 'monochrome':
      return `hsl(0, 0%, ${30 + ratio * 50}%)`;
    default:
      return `hsl(${260 + ratio * 60}, 70%, ${40 + ratio * 20}%)`;
  }
}
