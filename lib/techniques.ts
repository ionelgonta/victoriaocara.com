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
  
  // Dacă e string simplu, încearcă să găsești o tehnică corespunzătoare
  if (typeof technique === 'string') {
    // Încearcă să găsești o tehnică predefinită care să se potrivească
    const matchedTechnique = defaultTechniques.find(tech => 
      tech.en.toLowerCase().includes(technique.toLowerCase()) ||
      tech.ro.toLowerCase().includes(technique.toLowerCase()) ||
      technique.toLowerCase().includes(tech.en.toLowerCase()) ||
      technique.toLowerCase().includes(tech.ro.toLowerCase())
    );
    
    if (matchedTechnique) {
      return matchedTechnique[language];
    }
    
    // Dacă nu găsește nimic și string-ul pare invalid (foarte scurt sau caractere random)
    if (technique.length < 3 || /^[a-z]{1,6}$/.test(technique.toLowerCase())) {
      return language === 'en' ? 'Oil on Canvas' : 'Ulei pe Pânză'; // Default fallback
    }
    
    return technique; // Returnează string-ul original dacă pare valid
  }
  
  return language === 'en' ? 'Oil on Canvas' : 'Ulei pe Pânză'; // Default fallback
};

// Funcție pentru migrarea tehnicilor vechi
export const migrateTechniqueToNewFormat = (oldTechnique: string): { en: string; ro: string } => {
  // Încearcă să găsești o tehnică predefinită care să se potrivească
  const matchedTechnique = defaultTechniques.find(tech => 
    tech.en.toLowerCase().includes(oldTechnique.toLowerCase()) ||
    tech.ro.toLowerCase().includes(oldTechnique.toLowerCase()) ||
    oldTechnique.toLowerCase().includes(tech.en.toLowerCase()) ||
    oldTechnique.toLowerCase().includes(tech.ro.toLowerCase())
  );
  
  if (matchedTechnique) {
    return { en: matchedTechnique.en, ro: matchedTechnique.ro };
  }
  
  // Mapări comune pentru tehnici vechi
  const commonMappings: { [key: string]: { en: string; ro: string } } = {
    'oil': { en: 'Oil on Canvas', ro: 'Ulei pe Pânză' },
    'ulei': { en: 'Oil on Canvas', ro: 'Ulei pe Pânză' },
    'acrylic': { en: 'Acrylic on Canvas', ro: 'Acrilic pe Pânză' },
    'acrilic': { en: 'Acrylic on Canvas', ro: 'Acrilic pe Pânză' },
    'watercolor': { en: 'Watercolor', ro: 'Acuarelă' },
    'acuarela': { en: 'Watercolor', ro: 'Acuarelă' },
    'crayon': { en: 'Crayon on Paper', ro: 'Creion pe Hârtie' },
    'creion': { en: 'Crayon on Paper', ro: 'Creion pe Hârtie' }
  };
  
  const lowerTechnique = oldTechnique.toLowerCase();
  for (const [key, value] of Object.entries(commonMappings)) {
    if (lowerTechnique.includes(key)) {
      return value;
    }
  }
  
  // Dacă nu găsește nimic, returnează default
  return { en: 'Oil on Canvas', ro: 'Ulei pe Pânză' };
};