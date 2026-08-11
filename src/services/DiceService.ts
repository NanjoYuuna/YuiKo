export interface DiceResult {
  expression: string;
  rolls: number[];
  keptRolls: number[];
  modifier: number;
  total: number;
  breakdown: string;
  successCount?: number;
}

interface ParsedExpression {
  count: number;
  faces: number;
  modifier: number;
  keepHighest?: number;
  keepLowest?: number;
  successThreshold?: number;
}

/**
 * Parses a dice expression string into its components.
 * Supports: NdX, NdX+M, NdX-M, NdXkhN, NdXklN, NdX>N
 */
function parseExpression(expression: string): ParsedExpression {
  const normalized = expression.trim().toLowerCase().replace(/\s/g, '');

  // Match: [count]d[faces][modifier][advanced]
  // Advanced: kh<n>, kl<n>, ><n>
  const regex = /^(\d+)?d(\d+)(kh\d+|kl\d+|>\d+)?([+-]\d+)?$/i;
  const match = normalized.match(regex);

  if (!match) {
    throw new Error(`❌ 無法解析骰子算式：\`${expression}\`\n請使用正確格式，例如：\`2d6\`、\`1d20+5\`、\`4d6kh3\``);
  }

  const count = parseInt(match[1] ?? '1', 10);
  const faces = parseInt(match[2] ?? '6', 10);
  const advanced = match[3] ?? '';
  const modStr = match[4] ?? '+0';
  const modifier = parseInt(modStr, 10);

  if (count < 1 || count > 100) {
    throw new Error(`❌ 骰子數量必須在 1 到 100 之間（你輸入了 ${count}）`);
  }
  if (faces < 2 || faces > 1000) {
    throw new Error(`❌ 骰子面數必須在 2 到 1000 之間（你輸入了 ${faces}）`);
  }

  const parsed: ParsedExpression = { count, faces, modifier };

  if (advanced.startsWith('kh')) {
    parsed.keepHighest = parseInt(advanced.slice(2), 10);
  } else if (advanced.startsWith('kl')) {
    parsed.keepLowest = parseInt(advanced.slice(2), 10);
  } else if (advanced.startsWith('>')) {
    parsed.successThreshold = parseInt(advanced.slice(1), 10);
  }

  return parsed;
}

/**
 * Rolls a single die with [faces] sides.
 */
function rollDie(faces: number): number {
  return Math.floor(Math.random() * faces) + 1;
}

/**
 * Main dice rolling function.
 * @param expression Dice expression (e.g. "2d6+3", "4d6kh3", "1d100")
 */
export function roll(expression: string): DiceResult {
  const parsed = parseExpression(expression);
  const { count, faces, modifier, keepHighest, keepLowest, successThreshold } = parsed;

  // Roll all dice
  const rolls: number[] = Array.from({ length: count }, () => rollDie(faces));

  let keptRolls = [...rolls];
  let breakdownSuffix = '';

  // Apply keep highest / keep lowest
  if (keepHighest !== undefined) {
    const sorted = [...rolls].sort((a, b) => b - a);
    keptRolls = sorted.slice(0, keepHighest);
    breakdownSuffix = ` → 保留最高 ${keepHighest}`;
  } else if (keepLowest !== undefined) {
    const sorted = [...rolls].sort((a, b) => a - b);
    keptRolls = sorted.slice(0, keepLowest);
    breakdownSuffix = ` → 保留最低 ${keepLowest}`;
  }

  // Count successes
  let successCount: number | undefined;
  let total: number;

  if (successThreshold !== undefined) {
    successCount = keptRolls.filter(r => r > successThreshold).length;
    total = successCount;
    breakdownSuffix = ` → 成功數（>${successThreshold}）`;
  } else {
    const sum = keptRolls.reduce((a, b) => a + b, 0);
    total = sum + modifier;
  }

  // Build display breakdown
  const droppedIndices = new Set<number>();
  if (keepHighest !== undefined || keepLowest !== undefined) {
    const keptSet = new Set(keptRolls);
    const tempRolls = [...rolls];
    for (let i = 0; i < tempRolls.length; i++) {
      if (keptSet.has(tempRolls[i])) {
        keptSet.delete(tempRolls[i]);
      } else {
        droppedIndices.add(i);
      }
    }
  }

  const rollsDisplay = rolls
    .map((r, i) => droppedIndices.has(i) ? `~~${r}~~` : `**${r}**`)
    .join(', ');

  const modDisplay = modifier !== 0
    ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`)
    : '';

  const breakdown = `[${rollsDisplay}]${breakdownSuffix}${modDisplay}`;

  return {
    expression,
    rolls,
    keptRolls,
    modifier,
    total,
    breakdown,
    successCount,
  };
}
