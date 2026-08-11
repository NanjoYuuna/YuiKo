// Roulette animation symbols used for visual spinning effect
const SPIN_SYMBOLS = ['🎰', '🎲', '🎯', '🎪', '🎠', '🎡', '🎢', '🌀', '⚡', '🔮'];

export interface SpinResult {
  options: string[];
  frames: string[];
  result: string;
}

/**
 * Generates animation frames and the final result for the roulette.
 * @param options The list of options to spin through
 * @returns An object with animation frames array and the winning result
 */
export function spin(options: string[]): SpinResult {
  if (options.length < 2) {
    throw new Error('❌ 請至少提供兩個選項！\n範例：`/spin options:壽司 披薩 漢堡`');
  }

  // Pick the final winner
  const winnerIndex = Math.floor(Math.random() * options.length);
  const result = options[winnerIndex]!;

  // Generate 3 animation frames with random intermediate options
  const frameCount = 3;
  const frames: string[] = [];

  for (let f = 0; f < frameCount; f++) {
    // Each frame shows 3 spinning slots
    const slot1 = options[Math.floor(Math.random() * options.length)]!;
    const slot2 = options[Math.floor(Math.random() * options.length)]!;
    const slot3 = options[Math.floor(Math.random() * options.length)]!;
    const sym = SPIN_SYMBOLS[Math.floor(Math.random() * SPIN_SYMBOLS.length)]!;

    frames.push(
      `${sym} **旋轉中...**\n` +
      `┌─────────────────┐\n` +
      `│  ${padCenter(slot1, 13)}  │\n` +
      `│  ${padCenter(slot2, 13)}  │\n` +
      `│  ${padCenter(slot3, 13)}  │\n` +
      `└─────────────────┘`
    );
  }

  return { options, frames, result };
}

/**
 * Pads a string to a given length, centering it.
 */
function padCenter(str: string, length: number): string {
  // Note: CJK characters are double-width, so count them appropriately
  const visibleLength = [...str].reduce((acc, char) => {
    const code = char.codePointAt(0) ?? 0;
    // CJK Unified Ideographs and common ranges
    return acc + (code > 0x2E80 ? 2 : 1);
  }, 0);

  const totalPad = Math.max(0, length - visibleLength);
  const leftPad = Math.floor(totalPad / 2);
  const rightPad = totalPad - leftPad;
  return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
}
