import { GameNode, LevelData, NodeKind } from "./types";
import { RNG, randInt, randRange } from "./rng";

const MIN_DIST = 0.145; // normalized minimum distance between node centers
const MARGIN = 0.12;

function placeNode(rng: RNG, existing: GameNode[]): { x: number; y: number } {
  for (let attempt = 0; attempt < 60; attempt++) {
    const x = randRange(rng, MARGIN, 1 - MARGIN);
    const y = randRange(rng, MARGIN, 1 - MARGIN);
    let ok = true;
    for (const n of existing) {
      const dx = n.x - x;
      const dy = n.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < MIN_DIST) {
        ok = false;
        break;
      }
    }
    if (ok) return { x, y };
  }
  // fallback: accept whatever last attempt was (grid jitter) to avoid infinite loop
  return { x: randRange(rng, MARGIN, 1 - MARGIN), y: randRange(rng, MARGIN, 1 - MARGIN) };
}

/**
 * Difficulty scaling: more sequence nodes, more firewalls, less time,
 * forever. Curves are tuned to stay fair early and brutal late.
 */
export function generateLevel(level: number, seed: number): LevelData {
  const rng = mulberrySeeded(seed, level);

  const sequenceCount = clamp(5 + Math.floor(level * 0.6), 5, 22);
  const firewallCount = clamp(Math.floor(level * 0.45), 0, 14);
  const bonusCount = level % 3 === 0 ? 1 : randInt(rng, 0, 1);

  const totalNodes = sequenceCount + firewallCount + bonusCount;
  const nodes: GameNode[] = [];

  let id = 0;
  const kinds: NodeKind[] = [
    ...Array(sequenceCount).fill("sequence"),
    ...Array(firewallCount).fill("firewall"),
    ...Array(bonusCount).fill("bonus"),
  ] as NodeKind[];

  // shuffle kinds so sequence numbers aren't spatially predictable
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }

  let seqOrder = 0;
  for (const kind of kinds) {
    const pos = placeNode(rng, nodes);
    const node: GameNode = {
      id: id++,
      x: pos.x,
      y: pos.y,
      kind,
      order: kind === "sequence" ? seqOrder++ : null,
      connected: false,
      hit: false,
      radius: kind === "sequence" ? 0.034 : kind === "bonus" ? 0.03 : 0.032,
    };
    nodes.push(node);
  }

  const timeLimit = clamp(34 - level * 0.9, 9, 34);

  return { level, nodes, timeLimit, seed };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// combine level into the seed deterministically so daily runs replay exactly
function mulberrySeeded(seed: number, level: number): RNG {
  let a = (seed ^ Math.imul(level + 1, 0x9e3779b1)) >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
