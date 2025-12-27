import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const PAINTINGS_DIR = path.join(UPLOAD_DIR, 'paintings');

// Asigură-te că directoarele există
export function ensureUploadDirectories() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(PAINTINGS_DIR)) {
    fs.mkdirSync(PAINTINGS_DIR, { recursive: true });
  }
}

// Salvează imaginea pe disk și returnează URL-ul public
export async function saveImageToDisk(file: File, category: 'paintings' | 'general' = 'general'): Promise<string> {
  ensureUploadDirectories();
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Generează nume unic pentru fișier
  const fileExtension = path.extname(file.name) || '.jpg';
  const fileName = `${Date.now()}_${uuidv4()}${fileExtension}`;
  
  let filePath: string;
  let publicUrl: string;
  
  if (category === 'paintings') {
    filePath = path.join(PAINTINGS_DIR, fileName);
    publicUrl = `/uploads/paintings/${fileName}`;
  } else {
    filePath = path.join(UPLOAD_DIR, fileName);
    publicUrl = `/uploads/${fileName}`;
  }
  
  // Salvează fișierul
  fs.writeFileSync(filePath, buffer);
  
  return publicUrl;
}

// Salvează base64 ca fișier pe disk
export function saveBase64ToDisk(base64Data: string, originalName: string, category: 'paintings' | 'general' = 'general'): string {
  ensureUploadDirectories();
  
  // Extrage datele din base64
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 data');
  }
  
  const mimeType = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  
  // Determină extensia din MIME type
  let extension = '.jpg';
  if (mimeType.includes('png')) extension = '.png';
  else if (mimeType.includes('gif')) extension = '.gif';
  else if (mimeType.includes('webp')) extension = '.webp';
  
  // Generează nume unic
  const fileName = `${Date.now()}_${uuidv4()}${extension}`;
  
  let filePath: string;
  let publicUrl: string;
  
  if (category === 'paintings') {
    filePath = path.join(PAINTINGS_DIR, fileName);
    publicUrl = `/uploads/paintings/${fileName}`;
  } else {
    filePath = path.join(UPLOAD_DIR, fileName);
    publicUrl = `/uploads/${fileName}`;
  }
  
  // Salvează fișierul
  fs.writeFileSync(filePath, buffer);
  
  return publicUrl;
}

// Șterge imaginea de pe disk
export function deleteImageFromDisk(imageUrl: string): boolean {
  try {
    if (!imageUrl.startsWith('/uploads/')) {
      return false; // Nu este o imagine locală
    }
    
    const filePath = path.join(process.cwd(), 'public', imageUrl);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// Verifică dacă imaginea există pe disk
export function imageExistsOnDisk(imageUrl: string): boolean {
  try {
    if (!imageUrl.startsWith('/uploads/')) {
      return false;
    }
    
    const filePath = path.join(process.cwd(), 'public', imageUrl);
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Migrează imaginile existente din base64 la fișiere
export function migrateBase64ToFile(base64Data: string, paintingId: string): string {
  try {
    const fileName = `migrated_${paintingId}_${Date.now()}.jpg`;
    const publicUrl = saveBase64ToDisk(base64Data, fileName, 'paintings');
    return publicUrl;
  } catch (error) {
    console.error('Error migrating base64 to file:', error);
    return base64Data; // Returnează base64 original dacă migrarea eșuează
  }
}