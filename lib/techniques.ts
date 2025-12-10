export interface Technique {
  id: string;
  en: string;
  ro: string;
}

export const defaultTechniques: Technique[] = [
  {
    id: 'oil-canvas',
    en: 'Oil on Canvas',
    ro: 'Ulei pe Pânză'
  },
  {
    id: 'oil-canvas-impasto',
    en: 'Oil on Canvas - Impasto Technique',
    ro: 'Ulei pe Pânză - Tehnica Impasto'
  },
  {
    id: 'acrylic',
    en: 'Acrylic',
    ro: 'Acrilic'
  },
  {
    id: 'acrylic-canvas',
    en: 'Acrylic on Canvas',
    ro: 'Acrilic pe Pânză'
  },
  {
    id: 'crayon',
    en: 'Crayon',
    ro: 'Creion'
  },
  {
    id: 'crayon-paper',
    en: 'Crayon on Paper',
    ro: 'Creion pe Hârtie'
  },
  {
    id: 'watercolor',
    en: 'Watercolor',
    ro: 'Acuarelă'
  },
  {
    id: 'mixed-media',
    en: 'Mixed Media',
    ro: 'Tehnică Mixtă'
  }
];

export const getTechniqueById = (id: string): Technique | undefined => {
  return defaultTechniques.find(tech => tech.id === id);
};

export const getTechniqueText = (technique: any, language: 'en' | 'ro'): string => {
  // Dacă e obiect cu id, caută în lista predefinită
  if (typeof technique === 'object' && technique.id) {
    const found = getTechniqueById(technique.id);
    if (found) return found[language];
  }
  
  // Dacă e obiect bilingv
  if (typeof technique === 'object' && technique.en && technique.ro) {
    return technique[language] || technique.en;
  }
  
  // Dacă e string simplu
  if (typeof technique === 'string') {
    return technique;
  }
  
  return '';
};