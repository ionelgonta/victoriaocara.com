export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// CRITICAL: Safe render function to prevent React error #31
export const safeRender = (value: any): string => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return '';
  }
  
  // Handle primitives
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  // Handle objects with en/ro properties (multilingual content)
  if (typeof value === 'object' && value !== null) {
    if (value.en || value.ro) {
      return String(value.en || value.ro || '');
    }
    
    // For any other object, return empty string to prevent React error
    return '';
  }
  
  // Fallback
  return String(value || '');
};

// Helper function to safely get text from multilingual objects
export const getLocalizedText = (
  text: string | { en: string; ro: string } | undefined | null,
  language: 'en' | 'ro' = 'en',
  fallback: string = ''
): string => {
  if (!text) return fallback;
  
  if (typeof text === 'string') {
    return text;
  }
  
  if (typeof text === 'object' && text !== null) {
    return text[language] || text.en || text.ro || fallback;
  }
  
  return String(text) || fallback;
};

// Helper to safely render any value as string
export const safeRender = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return String(value);
  
  // If it's an object with en/ro properties
  if (typeof value === 'object' && (value.en || value.ro)) {
    return value.en || value.ro || '';
  }
  
  // For any other object, convert to string safely
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};