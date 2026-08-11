import quotesData from '../assets/quotes.json';

export interface Quote {
  id: number;
  text: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

const quotes: Quote[] = quotesData as Quote[];

/**
 * Fuzzy search: returns quotes matching the keyword in text or tags.
 * Priority: exact tag match > partial tag match > text substring match
 */
export function getByKeyword(keyword: string): Quote | null {
  const kw = keyword.trim().toLowerCase();

  // 1. Exact tag match
  const exactTag = quotes.find(q =>
    q.tags.some(tag => tag.toLowerCase() === kw)
  );
  if (exactTag) return exactTag;

  // 2. Partial tag match
  const partialTag = quotes.find(q =>
    q.tags.some(tag => tag.toLowerCase().includes(kw) || kw.includes(tag.toLowerCase()))
  );
  if (partialTag) return partialTag;

  // 3. Text substring match
  const textMatch = quotes.find(q =>
    q.text.toLowerCase().includes(kw) || q.description.toLowerCase().includes(kw)
  );
  if (textMatch) return textMatch;

  return null;
}

/**
 * Returns a random quote from the database.
 */
export function getRandom(): Quote {
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index]!;
}

/**
 * Returns all quotes (for future admin/listing purposes).
 */
export function getAll(): Quote[] {
  return quotes;
}
