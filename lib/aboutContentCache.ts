// Cache simplu pentru conținutul paginii Despre
interface AboutContent {
  artistPhoto: string;
  title: string;
  subtitle: string;
  description: string;
  specialties: string[];
}

let cachedContent: AboutContent | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minute

export const getCachedAboutContent = (): AboutContent | null => {
  const now = Date.now();
  if (cachedContent && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedContent;
  }
  return null;
};

export const setCachedAboutContent = (content: AboutContent): void => {
  cachedContent = content;
  cacheTimestamp = Date.now();
};

export const clearAboutContentCache = (): void => {
  cachedContent = null;
  cacheTimestamp = 0;
};