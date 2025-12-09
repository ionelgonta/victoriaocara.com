# ArtGallery - Magazin Online pentru Tablouri

Platformă modernă de e-commerce pentru vânzarea de tablouri originale, construită cu Next.js 14, TypeScript, MongoDB și Stripe.

## 🎨 Caracteristici

- **Frontend Modern**: Design minimalist cu Next.js 14, React 18, Tailwind CSS
- **Panou Admin Complet**: Gestionare tablouri, comenzi și conținut
- **Plăți Securizate**: Integrare Stripe pentru procesare plăți
- **Responsive Design**: Optimizat pentru mobile, tablet și desktop
- **SEO Optimizat**: Meta tags, Open Graph, sitemap.xml
- **Coș Persistent**: Salvare automată în localStorage
- **Animații Fluide**: Framer Motion pentru tranziții elegante

## 📋 Cerințe

- Node.js 18+ 
- MongoDB (local sau MongoDB Atlas)
- Cont Stripe (pentru plăți)

## 🚀 Instalare

### 1. Instalează dependențele

```bash
npm install
```

### 2. Configurează variabilele de mediu

Creează fișierul `.env` în rădăcina proiectului:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/art-gallery

# JWT Secret (generează unul unic)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Stripe Keys (obține de pe dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Creează utilizatorul admin

Rulează acest script pentru a crea primul admin:

```bash
node scripts/create-admin.js
```

Sau creează manual în MongoDB:

```javascript
// Conectează-te la MongoDB și rulează:
use art-gallery

db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$12$hashed_password_here", // folosește bcrypt pentru hash
  name: "Admin",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 4. Pornește serverul de dezvoltare

```bash
npm run dev
```

Site-ul va fi disponibil la `http://localhost:3000`

## 📱 Structura Proiectului

```
├── app/
│   ├── api/              # API Routes (Backend)
│   │   ├── auth/         # Autentificare
│   │   ├── paintings/    # CRUD tablouri
│   │   ├── orders/       # Gestionare comenzi
│   │   ├── checkout/     # Procesare plăți
│   │   └── content/      # Conținut site
│   ├── admin/            # Panou Admin
│   │   ├── dashboard/    # Dashboard principal
│   │   ├── paintings/    # Gestionare tablouri
│   │   ├── orders/       # Vizualizare comenzi
│   │   └── content/      # Editare conținut
│   ├── galerie/          # Pagina galerie
│   ├── tablou/[slug]/    # Pagina produs individual
│   ├── cart/             # Coș cumpărături
│   ├── checkout/         # Finalizare comandă
│   ├── contact/          # Pagina contact
│   └── success/          # Confirmare comandă
├── components/           # Componente React reutilizabile
├── context/              # Context API (Cart)
├── lib/                  # Utilități și configurări
├── models/               # Modele MongoDB
└── public/               # Fișiere statice
```

## 🎯 Cum să Folosești Panoul Admin

### Accesare Panou Admin

1. Navighează la `http://localhost:3000/admin`
2. Autentifică-te cu credențialele admin
3. Vei fi redirecționat către dashboard

### Adăugare Tablouri Noi

1. Mergi la **Admin Dashboard** → **Gestionează Tablouri**
2. Click pe **"Adaugă Tablou Nou"**
3. Completează formularul:
   - **Titlu**: Numele tabloului
   - **Tehnică**: Ex: "Ulei pe pânză", "Acrilic", etc.
   - **Preț**: În RON
   - **Dimensiuni**: Lățime și înălțime în cm
   - **Stoc**: Cantitate disponibilă (de obicei 1 pentru tablouri unice)
   - **Descriere**: Text detaliat despre tablou
   - **Imagini**: URL-uri către imagini (poți folosi servicii precum Cloudinary, ImgBB)
   - **Tablou selectat**: Bifează pentru a afișa pe homepage
4. Click **"Adaugă"**

### Editare Tablouri

1. În lista de tablouri, click pe **"Editează"**
2. Modifică câmpurile dorite
3. Click **"Actualizează"**

### Gestionare Comenzi

1. Mergi la **Admin Dashboard** → **Comenzi**
2. Vezi toate comenzile cu detalii complete
3. Actualizează statusul comenzii din dropdown:
   - **Pending**: În așteptare
   - **Paid**: Plătită
   - **Processing**: În procesare
   - **Shipped**: Expediată
   - **Delivered**: Livrată
   - **Cancelled**: Anulată

### Editare Conținut Homepage

1. Mergi la **Admin Dashboard** → **Conținut Site**
2. Editează:
   - Titlul și subtitlul secțiunii hero
   - Textul secțiunii "Despre"
3. Click **"Salvează Modificările"**

## 💳 Configurare Stripe

### 1. Creează cont Stripe

- Mergi pe [stripe.com](https://stripe.com)
- Creează un cont gratuit

### 2. Obține API Keys

- Accesează [Dashboard Stripe](https://dashboard.stripe.com)
- Mergi la **Developers** → **API keys**
- Copiază **Publishable key** și **Secret key**
- Adaugă-le în fișierul `.env`

### 3. Testare Plăți

Pentru testare, folosește cardurile de test Stripe:

- **Card de succes**: `4242 4242 4242 4242`
- **CVV**: Orice 3 cifre
- **Data expirare**: Orice dată viitoare
- **ZIP**: Orice 5 cifre

### 4. Webhook pentru Producție (Opțional)

Pentru a primi notificări despre plăți:

1. În Stripe Dashboard → **Developers** → **Webhooks**
2. Adaugă endpoint: `https://yourdomain.com/api/webhook`
3. Selectează evenimentul: `checkout.session.completed`
4. Copiază **Webhook signing secret** și adaugă în `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 🌐 Deploy pe Vercel

### 1. Pregătire

```bash
npm run build
```

### 2. Deploy

```bash
# Instalează Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 3. Configurare Variabile de Mediu

În Vercel Dashboard:
1. Mergi la **Settings** → **Environment Variables**
2. Adaugă toate variabilele din `.env`
3. Redeploy proiectul

### 4. Configurare MongoDB Atlas (pentru producție)

1. Creează cont pe [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Creează un cluster gratuit
3. Obține connection string
4. Actualizează `MONGODB_URI` în Vercel

## 📸 Gestionare Imagini

### Opțiuni Recomandate:

**1. Cloudinary (Recomandat)**
- Cont gratuit: 25GB storage
- URL-uri optimizate automat
- [cloudinary.com](https://cloudinary.com)

**2. ImgBB**
- Upload gratuit
- [imgbb.com](https://imgbb.com)

**3. Vercel Blob Storage**
- Integrat cu Vercel
- [vercel.com/docs/storage/vercel-blob](https://vercel.com/docs/storage/vercel-blob)

### Cum să Încarci Imagini:

1. Încarcă imaginea pe serviciul ales
2. Copiază URL-ul imaginii
3. Lipește în câmpul "URL imagine" din admin

## 🔧 Comenzi Disponibile

```bash
# Dezvoltare
npm run dev

# Build pentru producție
npm run build

# Start server producție
npm start

# Linting
npm run lint
```

## 📊 Baza de Date

### Colecții MongoDB:

- **paintings**: Tablouri
- **orders**: Comenzi
- **users**: Utilizatori (admin)
- **sitecontents**: Conținut editabil

## 🎨 Personalizare Design

### Culori (în `tailwind.config.js`):

```javascript
colors: {
  primary: '#1a1a1a',    // Negru principal
  secondary: '#f5f5f5',  // Gri deschis
  accent: '#d4af37',     // Auriu
}
```

### Fonturi (în `app/layout.tsx`):

- **Sans-serif**: Inter (text general)
- **Serif**: Playfair Display (titluri)

## 🐛 Troubleshooting

### Eroare: "Cannot connect to MongoDB"
- Verifică dacă MongoDB rulează local: `mongod`
- Sau folosește MongoDB Atlas pentru cloud

### Eroare: "Stripe key not found"
- Verifică fișierul `.env`
- Asigură-te că ai copiat corect cheile din Stripe Dashboard

### Imagini nu se încarcă
- Verifică URL-urile imaginilor
- Adaugă domeniul în `next.config.js` → `images.domains`

## 📞 Suport

Pentru întrebări sau probleme:
- Email: contact@artgallery.ro
- GitHub Issues: [link-to-repo]

## 📄 Licență

MIT License - Folosește liber pentru proiectele tale!

---

**Creat cu ❤️ pentru artiști și iubitorii de artă**
