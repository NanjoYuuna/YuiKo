import quotesData from '../assets/quotes.json';

export interface Quote {
  id: number;
  text: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

const DATA_URLS = [
  'https://mygo.miyago9267.com/data/image_map.json',
  'https://raw.githubusercontent.com/miyago9267/MyGO-Searcher/main/public/data/image_map.json',
];

let cachedQuotes: Quote[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 小時快取

function mapItemToQuote(item: any): Quote {
  const episodeNum = item.episode ? String(item.episode).replace(/^mygo_/, '') : '';
  const episodeText = episodeNum ? `第 ${episodeNum} 集` : '';
  const filename = item.filename || '';
  const imageUrl = episodeNum && filename
    ? `https://drive.miyago9267.com/d/file/img/searcher/mygo/${episodeNum}/${encodeURIComponent(filename)}`
    : (item.imageUrl || '');

  return {
    id: typeof item.id === 'number' ? item.id : 0,
    text: item.alt || item.description || filename || 'MyGO 梗圖',
    description: item.description && item.description !== item.alt
      ? `${item.description}${episodeText ? ` (${episodeText})` : ''}`
      : (episodeText ? `集數：${episodeText}` : ''),
    imageUrl,
    tags: Array.isArray(item.tags) ? item.tags : [],
  };
}

export async function loadQuotes(): Promise<Quote[]> {
  const now = Date.now();
  if (cachedQuotes && now - lastFetchTime < CACHE_TTL) {
    return cachedQuotes;
  }

  for (const url of DATA_URLS) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const rawData = await response.json();
        if (Array.isArray(rawData) && rawData.length > 0) {
          cachedQuotes = rawData.map(mapItemToQuote);
          lastFetchTime = now;
          return cachedQuotes;
        }
      }
    } catch (error) {
      console.warn(`[MemeService] 讀取 ${url} 失敗:`, error);
    }
  }

  if (!cachedQuotes) {
    cachedQuotes = (quotesData as any[]).map(q => ({
      id: q.id || 0,
      text: q.text || '',
      description: q.description || '',
      imageUrl: q.imageUrl || '',
      tags: q.tags || [],
    }));
  }

  return cachedQuotes;
}

/**
 * 根據關鍵字搜尋最接近的梗圖（支援模糊比對與標籤匹配）
 */
export async function getByKeyword(keyword: string): Promise<Quote | null> {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return getRandom();

  const quotes = await loadQuotes();
  if (quotes.length === 0) return null;

  const matches = quotes.filter(q => {
    const textMatch = q.text.toLowerCase().includes(kw);
    const descMatch = q.description.toLowerCase().includes(kw);
    const tagMatch = q.tags.some(t => t.toLowerCase().includes(kw));
    return textMatch || descMatch || tagMatch;
  });

  if (matches.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * matches.length);
  return matches[randomIndex]!;
}

/**
 * 隨機取得一張梗圖
 */
export async function getRandom(): Promise<Quote | null> {
  const quotes = await loadQuotes();
  if (quotes.length === 0) return null;
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index]!;
}

/**
 * 取得所有梗圖清單
 */
export async function getAll(): Promise<Quote[]> {
  return loadQuotes();
}