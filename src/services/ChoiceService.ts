export interface ChoiceResult {
  options: string[];
  picked: string;
}

export interface ShuffleResult {
  original: string[];
  shuffled: string[];
  display: string;
}

/**
 * Parses a space-separated options string into an array.
 * Supports quoted strings for multi-word options: "option one" "option two"
 */
export function parseOptions(input: string): string[] {
  const matches = input.match(/"[^"]+"|'[^']+'|\S+/g);
  if (!matches || matches.length === 0) {
    throw new Error('❌ 請至少輸入兩個選項！');
  }
  // Strip surrounding quotes
  const options = matches.map(m => m.replace(/^["']|["']$/g, '').trim()).filter(Boolean);
  if (options.length < 2) {
    throw new Error('❌ 請至少輸入兩個選項，用空格分隔。\n範例：`/choice options:壽司 披薩 漢堡`');
  }
  return options;
}

/**
 * Randomly picks one option from the list.
 */
export function pick(options: string[]): ChoiceResult {
  const index = Math.floor(Math.random() * options.length);
  return {
    options,
    picked: options[index]!,
  };
}

/**
 * Shuffles the options using the Fisher-Yates algorithm.
 */
export function shuffle(options: string[]): ShuffleResult {
  const shuffled = [...options];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  const display = shuffled
    .map((opt, idx) => `**${idx + 1}.** ${opt}`)
    .join('\n');

  return {
    original: options,
    shuffled,
    display,
  };
}
