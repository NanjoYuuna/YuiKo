import tarotData from '../assets/tarot.json';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TarotCard {
  id: number;
  name: string;
  nameZh: string;
  arcana: string;
  number: string;
  uprightMeaning: string;
  reversedMeaning: string;
  imageUrl: string;
}

export interface DrawnCard extends TarotCard {
  isReversed: boolean;
  meaning: string;
}

export interface FortuneResult {
  userId: string;
  date: string;
  score: number;
  stars: string;
  luckyColor: string;
  luckyItem: string;
  element: string;
  mood: string;
  advice: string;
}

export interface TarotResult {
  type: 'single' | 'three';
  cards: DrawnCard[];
  spreadLabel?: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const tarotDeck: TarotCard[] = tarotData as TarotCard[];

const LUCKY_COLORS = [
  '✨ 銀白色', '🔴 朱砂紅', '💙 海洋藍', '💚 翡翠綠', '💛 琥珀黃',
  '🟣 紫羅蘭', '🟠 珊瑚橙', '⬛ 烏木黑', '⬜ 珍珠白', '💗 玫瑰粉',
  '🩵 天空藍', '🟤 大地棕', '🌙 午夜靛', '💎 寶石藍', '🍀 草葉綠',
];

const LUCKY_ITEMS = [
  '🔮 水晶球', '🎴 塔羅牌', '🍀 四葉草', '⚙️ 齒輪飾品', '📚 古舊書本',
  '🕯️ 白蠟燭', '🌙 月牙項鍊', '⭐ 星型胸針', '🪙 古銅幣', '🌿 薰衣草',
  '🎲 骰子', '🗝️ 古老鑰匙', '🪶 羽毛筆', '🔔 銀鈴', '🌊 貝殼',
];

const ELEMENTS = ['🔥 火', '💧 水', '🌬️ 風', '🪨 土', '⚡ 雷', '❄️ 冰', '🌟 光'];

const MOODS = [
  '充滿活力、躍躍欲試',
  '沉靜內斂、思緒清晰',
  '溫暖友善、廣結善緣',
  '靈感爆發、創意無限',
  '謹慎細膩、深思熟慮',
  '輕鬆愉快、隨緣自在',
  '熱情奔放、勇往直前',
  '神秘敏銳、洞察力強',
];

const ADVICES = [
  '今天適合主動出擊，機會在等待勇敢的人。',
  '休息也是一種前進，給自己留點空間。',
  '留意周遭細節，一個小線索可能改變全局。',
  '與人真誠交流，關係比你想的還要重要。',
  '相信直覺，你的第一感往往是對的。',
  '今天的堅持，將成為明天的底氣。',
  '放下完美主義，完成比完美更重要。',
  '接受未知，有時候不確定才是最好的可能。',
  '小事積累成大成就，慢慢來，比較快。',
  '善待自己，你已經做得很好了。',
];

// ─── Seeded RNG ────────────────────────────────────────────────────────────────

/**
 * Simple seeded pseudo-random number generator (xmur3 + mulberry32).
 * Produces deterministic results for the same seed.
 */
function createSeededRNG(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  let state = h >>> 0;
  return function () {
    state |= 0;
    state = state + 0x6D2B79F5 | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// ─── Fortune ──────────────────────────────────────────────────────────────────

/**
 * Returns a deterministic daily fortune for the given user.
 * Same userId + same date always produces the same result.
 */
export function getDailyFortune(userId: string): FortuneResult {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const seed = `${userId}-${date}`;
  const rng = createSeededRNG(seed);

  const score = seededInt(rng, 1, 100);
  const luckyColor = LUCKY_COLORS[seededInt(rng, 0, LUCKY_COLORS.length - 1)]!;
  const luckyItem = LUCKY_ITEMS[seededInt(rng, 0, LUCKY_ITEMS.length - 1)]!;
  const element = ELEMENTS[seededInt(rng, 0, ELEMENTS.length - 1)]!;
  const mood = MOODS[seededInt(rng, 0, MOODS.length - 1)]!;
  const advice = ADVICES[seededInt(rng, 0, ADVICES.length - 1)]!;

  // Convert score to star rating
  let stars: string;
  if (score >= 90) stars = '⭐⭐⭐⭐⭐';
  else if (score >= 75) stars = '⭐⭐⭐⭐✨';
  else if (score >= 60) stars = '⭐⭐⭐';
  else if (score >= 40) stars = '⭐⭐';
  else stars = '⭐';

  return { userId, date, score, stars, luckyColor, luckyItem, element, mood, advice };
}

// ─── Tarot ────────────────────────────────────────────────────────────────────

/**
 * Draws tarot cards. Each card independently determines upright/reversed.
 */
export function drawTarot(type: 'single' | 'three'): TarotResult {
  const count = type === 'single' ? 1 : 3;
  const deck = [...tarotDeck];

  // Fisher-Yates shuffle to pick without replacement
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }

  const drawn = deck.slice(0, count);

  const cards: DrawnCard[] = drawn.map(card => {
    const isReversed = Math.random() < 0.3; // 30% chance of reversal
    return {
      ...card,
      isReversed,
      meaning: isReversed ? card.reversedMeaning : card.uprightMeaning,
    };
  });

  const spreadLabel = type === 'three'
    ? ['過去', '現在', '未來']
    : undefined;

  return { type, cards, spreadLabel };
}
