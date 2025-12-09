# 📖 Instrucțiuni Complete de Utilizare

## 🎯 Ghid Rapid de Start

### Pasul 1: Instalare Inițială

```bash
# Instalează toate dependențele
npm install

# Creează fișierul .env și completează-l
cp .env.example .env
```

### Pasul 2: Configurare MongoDB

**Opțiunea A: MongoDB Local**
```bash
# Instalează MongoDB Community Edition
# Windows: https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Pornește MongoDB
mongod
```

**Opțiunea B: MongoDB Atlas (Cloud - Recomandat)**
1. Mergi pe [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Creează cont gratuit
3. Creează un cluster (M0 Free)
4. Click "Connect" → "Connect your application"
5. Copiază connection string în `.env`

### Pasul 3: Configurare Stripe

1. Creează cont pe [stripe.com](https://stripe.com)
2. Mergi la Dashboard → Developers → API keys
3. Copiază "Publishable key" și "Secret key"
4. Adaugă-le în `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Pasul 4: Creează Admin

```bash
node scripts/create-admin.js
```

Introdu:
- Email: admin@example.com
- Parolă: (alege o parolă sigură)
- Nume: Admin

### Pasul 5: Pornește Aplicația

```bash
npm run dev
```

Accesează:
- **Site public**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin

---

## 🎨 Cum să Adaugi Tablouri

### Metoda 1: Prin Panou Admin (Recomandat)

1. **Autentifică-te în admin**
   - Mergi la `http://localhost:3000/admin`
   - Introdu email și parola admin

2. **Accesează Gestionare Tablouri**
   - Click pe "Gestionează Tablouri"
   - Click pe "Adaugă Tablou Nou"

3. **Completează Formularul**

   **Câmpuri Obligatorii:**
   - **Titlu**: "Peisaj de Toamnă"
   - **Tehnică**: "Ulei pe pânză"
   - **Preț**: 1500 (în RON)
   - **Lățime**: 80 (cm)
   - **Înălțime**: 60 (cm)
   - **Stoc**: 1
   - **Descriere**: "Un peisaj vibrant care surprinde frumusețea toamnei..."

   **Imagini:**
   - URL imagine 1: `https://example.com/image1.jpg`
   - Text alternativ: "Peisaj de toamnă - vedere principală"
   - Click "+ Adaugă altă imagine" pentru mai multe unghiuri

   **Opțional:**
   - ☑️ Bifează "Tablou selectat" pentru a-l afișa pe homepage

4. **Salvează**
   - Click "Adaugă"
   - Taboul va apărea imediat pe site

### Metoda 2: Direct în Baza de Date

```javascript
// Conectează-te la MongoDB și rulează:
db.paintings.insertOne({
  title: "Peisaj de Toamnă",
  slug: "peisaj-de-toamna",
  description: "Un peisaj vibrant care surprinde frumusețea toamnei...",
  price: 1500,
  dimensions: {
    width: 80,
    height: 60,
    unit: "cm"
  },
  technique: "Ulei pe pânză",
  images: [
    {
      url: "https://example.com/image1.jpg",
      alt: "Peisaj de toamnă - vedere principală"
    }
  ],
  stock: 1,
  featured: true,
  category: "landscape",
  sold: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 📸 Gestionare Imagini - Ghid Complet

### Opțiunea 1: Cloudinary (Recomandat)

**De ce Cloudinary?**
- 25GB storage gratuit
- Optimizare automată imagini
- CDN global rapid
- Redimensionare automată

**Pași:**

1. **Creează cont**
   - Mergi pe [cloudinary.com](https://cloudinary.com)
   - Sign up gratuit

2. **Încarcă imagini**
   - Click "Media Library"
   - Drag & drop imaginile
   - Click pe imagine → "Copy URL"

3. **Adaugă în admin**
   - Lipește URL-ul în câmpul "URL imagine"

**Exemplu URL Cloudinary:**
```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/painting1.jpg
```

### Opțiunea 2: ImgBB

1. Mergi pe [imgbb.com](https://imgbb.com)
2. Click "Start uploading"
3. Selectează imaginea
4. Copiază "Direct link"
5. Lipește în admin

### Opțiunea 3: Vercel Blob (Pentru deploy pe Vercel)

```bash
npm install @vercel/blob
```

Apoi în admin, poți implementa upload direct.

### Configurare Domenii Imagini

În `next.config.js`, adaugă domeniile de unde încarci imagini:

```javascript
images: {
  domains: [
    'localhost',
    'res.cloudinary.com',
    'i.ibb.co',
    'your-custom-domain.com'
  ],
}
```

---

## 🛒 Cum Funcționează Procesul de Comandă

### Pentru Clienți:

1. **Navigare**
   - Vizitează galeria
   - Click pe un tablou pentru detalii

2. **Adăugare în Coș**
   - Click "Adaugă în Coș"
   - Coșul se salvează automat (localStorage)

3. **Vizualizare Coș**
   - Click pe iconița coș din header
   - Ajustează cantități sau elimină produse

4. **Checkout**
   - Click "Finalizează Comanda"
   - Completează informații contact și livrare
   - Click "Continuă la Plată"

5. **Plată Stripe**
   - Introdu detalii card
   - Confirmă plata
   - Redirect la pagina de succes

### Pentru Admin:

1. **Vizualizare Comenzi**
   - Admin → Comenzi
   - Vezi toate comenzile cu detalii complete

2. **Actualizare Status**
   - Selectează status din dropdown:
     - **Pending**: Comandă nouă
     - **Paid**: Plată confirmată
     - **Processing**: În pregătire
     - **Shipped**: Expediată
     - **Delivered**: Livrată
     - **Cancelled**: Anulată

3. **Notificări Email** (Opțional - de implementat)
   - Poți adăuga SendGrid sau Resend pentru email-uri automate

---

## ⚙️ Editare Configurări Plăți

### Schimbare Chei Stripe

1. **Obține noile chei**
   - Stripe Dashboard → Developers → API keys
   - Pentru producție, folosește "Live" keys (nu "Test")

2. **Actualizează .env**
   ```env
   STRIPE_SECRET_KEY=sk_live_your_new_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_new_key
   ```

3. **Restart server**
   ```bash
   # Oprește serverul (Ctrl+C)
   npm run dev
   ```

### Configurare Webhook Stripe (Pentru Producție)

**De ce ai nevoie de webhook?**
- Confirmă automat plățile
- Actualizează statusul comenzii
- Sincronizează cu Stripe

**Pași:**

1. **În Stripe Dashboard**
   - Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/webhook`
   - Selectează: `checkout.session.completed`
   - Click "Add endpoint"

2. **Copiază Signing Secret**
   - Click pe webhook creat
   - Copiază "Signing secret" (începe cu `whsec_`)

3. **Adaugă în .env**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_secret
   ```

4. **Testare Locală**
   ```bash
   # Instalează Stripe CLI
   stripe listen --forward-to localhost:3000/api/webhook
   ```

### Schimbare Monedă

În `lib/stripe.ts`, linia 9:

```typescript
// Schimbă 'ron' cu 'eur', 'usd', etc.
currency: 'ron',
```

Și în `lib/utils.ts`, linia 16:

```typescript
currency: 'RON', // Schimbă cu 'EUR', 'USD', etc.
```

---

## 🎨 Personalizare Design

### Schimbare Culori

În `tailwind.config.js`:

```javascript
colors: {
  primary: '#1a1a1a',    // Culoare principală (butoane, text)
  secondary: '#f5f5f5',  // Fundal secundar
  accent: '#d4af37',     // Culoare accent (hover, highlight)
}
```

**Exemple de palete:**

**Elegant Albastru:**
```javascript
primary: '#1e3a8a',
secondary: '#f0f9ff',
accent: '#3b82f6',
```

**Modern Verde:**
```javascript
primary: '#064e3b',
secondary: '#f0fdf4',
accent: '#10b981',
```

**Minimalist Gri:**
```javascript
primary: '#18181b',
secondary: '#fafafa',
accent: '#71717a',
```

### Schimbare Fonturi

În `app/layout.tsx`:

```typescript
import { Inter, Playfair_Display } from 'next/font/google';

// Înlocuiește cu alte fonturi Google:
// Roboto, Open_Sans, Montserrat, Lora, etc.
```

### Modificare Logo

În `components/Header.tsx`, linia 24:

```typescript
<Link href="/" className="text-2xl font-serif font-bold text-primary">
  ArtGallery  {/* Schimbă cu numele tău */}
</Link>
```

Sau adaugă un logo imagine:

```typescript
<Link href="/">
  <Image src="/logo.png" alt="Logo" width={150} height={50} />
</Link>
```

---

## 🚀 Deploy pe Vercel

### Pregătire

1. **Creează cont GitHub**
   - Dacă nu ai, creează pe [github.com](https://github.com)

2. **Creează repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/art-gallery.git
   git push -u origin main
   ```

### Deploy

1. **Creează cont Vercel**
   - Mergi pe [vercel.com](https://vercel.com)
   - Sign up cu GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Selectează repository-ul
   - Click "Import"

3. **Configurare Environment Variables**
   - În Vercel, click "Environment Variables"
   - Adaugă toate variabilele din `.env`:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `NEXT_PUBLIC_SITE_URL` (URL-ul Vercel)

4. **Deploy**
   - Click "Deploy"
   - Așteaptă 2-3 minute
   - Site-ul va fi live!

### Actualizări Viitoare

```bash
git add .
git commit -m "Update description"
git push
```

Vercel va redeploy automat!

---

## 🔧 Troubleshooting Comun

### Problema: "Cannot connect to MongoDB"

**Soluție:**
```bash
# Verifică dacă MongoDB rulează
mongod --version

# Pornește MongoDB
mongod

# Sau folosește MongoDB Atlas (cloud)
```

### Problema: "Stripe key not found"

**Soluție:**
1. Verifică `.env` - există fișierul?
2. Verifică că ai copiat cheile corect (fără spații)
3. Restart server: `Ctrl+C` apoi `npm run dev`

### Problema: "Admin login failed"

**Soluție:**
```bash
# Recreează admin
node scripts/create-admin.js

# Sau verifică în MongoDB
mongosh
use art-gallery
db.users.find({ role: 'admin' })
```

### Problema: "Images not loading"

**Soluție:**
1. Verifică URL-ul imaginii (accesează-l în browser)
2. Adaugă domeniul în `next.config.js`:
   ```javascript
   images: {
     domains: ['your-image-domain.com'],
   }
   ```
3. Restart server

### Problema: "Build failed on Vercel"

**Soluție:**
1. Verifică că toate variabilele de mediu sunt setate
2. Verifică logs în Vercel Dashboard
3. Testează build local: `npm run build`

---

## 📊 Monitorizare și Analytics

### Google Analytics (Opțional)

1. Creează cont pe [analytics.google.com](https://analytics.google.com)
2. Obține Tracking ID
3. Adaugă în `app/layout.tsx`:

```typescript
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
  strategy="afterInteractive"
/>
```

### Stripe Dashboard

- Vezi toate tranzacțiile
- Rapoarte vânzări
- Dispute și refund-uri
- [dashboard.stripe.com](https://dashboard.stripe.com)

---

## 🔐 Securitate

### Best Practices:

1. **Schimbă JWT_SECRET**
   ```bash
   # Generează unul nou
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Folosește HTTPS în producție**
   - Vercel oferă HTTPS automat

3. **Nu commita .env**
   - Este deja în `.gitignore`

4. **Actualizează dependențele**
   ```bash
   npm audit
   npm audit fix
   ```

---

## 📞 Suport și Resurse

### Documentație Oficială:
- [Next.js](https://nextjs.org/docs)
- [Stripe](https://stripe.com/docs)
- [MongoDB](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Comunitate:
- [Next.js Discord](https://discord.gg/nextjs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

**Mult succes cu magazinul tău de artă! 🎨**
