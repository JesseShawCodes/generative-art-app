/** Small seeded PRNG (mulberry32) for reproducible client-side generation. */
export class SeededRng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Uniform float in [0, 1). */
  random(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Uniform float in [low, high). */
  uniform(low: number, high: number): number {
    return low + (high - low) * this.random();
  }

  /** Inclusive integer in [low, high]. */
  randint(low: number, high: number): number {
    const min = Math.ceil(low);
    const max = Math.floor(high);
    return Math.floor(this.uniform(min, max + 1));
  }

  choice<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error("Cannot choose from an empty list");
    }
    return items[this.randint(0, items.length - 1)] as T;
  }
}

export function randomSeed(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const [value = 0] = crypto.getRandomValues(new Uint32Array(1));
    return value % 0x80000000;
  }
  return Math.floor(Math.random() * 0x80000000);
}
