const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    const dbPath = path.join(process.cwd(), 'database', 'victoriaocara.db');
    this.db = new sqlite3.Database(dbPath);
  }

  // Paintings methods
  async getAllPaintings() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM paintings 
        ORDER BY created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else {
          const paintings = rows.map(row => ({
            id: row.id,
            title: {
              en: row.title_en,
              ro: row.title_ro
            },
            description: {
              en: row.description_en,
              ro: row.description_ro
            },
            price: row.price,
            dimensions: row.dimensions,
            medium: row.medium,
            year: row.year,
            available: Boolean(row.available),
            featured: Boolean(row.featured),
            category: row.category,
            slug: row.slug,
            images: JSON.parse(row.images || '[]'),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          resolve(paintings);
        }
      });
    });
  }

  async getFeaturedPaintings() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM paintings 
        WHERE featured = 1
        ORDER BY created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else {
          const paintings = rows.map(row => ({
            id: row.id,
            title: {
              en: row.title_en,
              ro: row.title_ro
            },
            description: {
              en: row.description_en,
              ro: row.description_ro
            },
            price: row.price,
            dimensions: row.dimensions,
            medium: row.medium,
            year: row.year,
            available: Boolean(row.available),
            featured: Boolean(row.featured),
            category: row.category,
            slug: row.slug,
            images: JSON.parse(row.images || '[]'),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          resolve(paintings);
        }
      });
    });
  }

  async getPaintingById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT * FROM paintings WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else {
          const painting = {
            id: row.id,
            title: {
              en: row.title_en,
              ro: row.title_ro
            },
            description: {
              en: row.description_en,
              ro: row.description_ro
            },
            price: row.price,
            dimensions: row.dimensions,
            medium: row.medium,
            year: row.year,
            available: Boolean(row.available),
            featured: Boolean(row.featured),
            category: row.category,
            slug: row.slug,
            images: JSON.parse(row.images || '[]'),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
          resolve(painting);
        }
      });
    });
  }

  async getPaintingBySlug(slug) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT * FROM paintings WHERE slug = ?
      `, [slug], (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else {
          const painting = {
            id: row.id,
            title: {
              en: row.title_en,
              ro: row.title_ro
            },
            description: {
              en: row.description_en,
              ro: row.description_ro
            },
            price: row.price,
            dimensions: row.dimensions,
            medium: row.medium,
            year: row.year,
            available: Boolean(row.available),
            featured: Boolean(row.featured),
            category: row.category,
            slug: row.slug,
            images: JSON.parse(row.images || '[]'),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          };
          resolve(painting);
        }
      });
    });
  }

  async createPainting(paintingData) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO paintings (
          id, title_en, title_ro, description_en, description_ro,
          price, dimensions, medium, year, available, featured, category, slug, images
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        paintingData.title?.en || null,
        paintingData.title?.ro || null,
        paintingData.description?.en || null,
        paintingData.description?.ro || null,
        paintingData.price || null,
        paintingData.dimensions || null,
        paintingData.medium || null,
        paintingData.year || null,
        paintingData.available !== false ? 1 : 0,
        paintingData.featured ? 1 : 0,
        paintingData.category || 'painting',
        paintingData.slug || null,
        JSON.stringify(paintingData.images || [])
      ], function(err) {
        if (err) reject(err);
        else resolve({ id, ...paintingData });
      });
    });
  }

  async updatePainting(id, paintingData) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE paintings SET
          title_en = ?, title_ro = ?, description_en = ?, description_ro = ?,
          price = ?, dimensions = ?, medium = ?, year = ?, 
          available = ?, featured = ?, category = ?, slug = ?, images = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        paintingData.title?.en || null,
        paintingData.title?.ro || null,
        paintingData.description?.en || null,
        paintingData.description?.ro || null,
        paintingData.price || null,
        paintingData.dimensions || null,
        paintingData.medium || null,
        paintingData.year || null,
        paintingData.available !== false ? 1 : 0,
        paintingData.featured ? 1 : 0,
        paintingData.category || 'painting',
        paintingData.slug || null,
        JSON.stringify(paintingData.images || []),
        id
      ], function(err) {
        if (err) reject(err);
        else resolve({ id, ...paintingData });
      });
    });
  }

  async deletePainting(id) {
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM paintings WHERE id = ?`, [id], function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes > 0 });
      });
    });
  }

  // Public images methods
  async getAllPublicImages() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM public_images 
        ORDER BY uploaded_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async createPublicImage(imageData) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO public_images (id, filename, original_name, mimetype, size, url)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id,
        imageData.filename,
        imageData.originalName,
        imageData.mimetype,
        imageData.size,
        imageData.url
      ], function(err) {
        if (err) reject(err);
        else resolve({ id, ...imageData });
      });
    });
  }

  // Contact info methods
  async getContactInfo() {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM contact_info LIMIT 1`, (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else {
          resolve({
            id: row.id,
            email: row.email,
            phone: row.phone,
            address: row.address,
            workingHours: row.working_hours,
            socialMedia: JSON.parse(row.social_media || '{}'),
            updatedAt: row.updated_at
          });
        }
      });
    });
  }

  async updateContactInfo(contactData) {
    return new Promise((resolve, reject) => {
      // First try to update existing record
      this.db.run(`
        UPDATE contact_info SET
          email = ?, phone = ?, address = ?, working_hours = ?, social_media = ?,
          updated_at = CURRENT_TIMESTAMP
      `, [
        contactData.email,
        contactData.phone,
        contactData.address,
        contactData.workingHours,
        JSON.stringify(contactData.socialMedia || {})
      ], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          // No existing record, create new one
          const id = Date.now().toString();
          this.db.run(`
            INSERT INTO contact_info (id, email, phone, address, working_hours, social_media)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            id,
            contactData.email,
            contactData.phone,
            contactData.address,
            contactData.workingHours,
            JSON.stringify(contactData.socialMedia || {})
          ], (err) => {
            if (err) reject(err);
            else resolve({ id, ...contactData });
          });
        } else {
          resolve(contactData);
        }
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;