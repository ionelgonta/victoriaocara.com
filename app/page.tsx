import Link from 'next/link';
import Image from 'next/image';
import PaintingCard from '@/components/PaintingCard';

async function getFeaturedPaintings() {
  try {
    // Construiește URL-ul dinamic pentru a funcționa și pe Vercel
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    if (!baseUrl) {
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        baseUrl = 'http://localhost:3000';
      }
    }
    
    console.log('Fetching featured paintings from:', `${baseUrl}/api/paintings?featured=true`);
    
    const res = await fetch(`${baseUrl}/api/paintings?featured=true`, {
      cache: 'no-store',
    });
    
    console.log('Featured paintings response status:', res.status);
    
    if (!res.ok) {
      console.log('Featured paintings fetch failed:', res.statusText);
      return [];
    }
    
    const data = await res.json();
    console.log('Featured paintings count:', data.length);
    
    return data;
  } catch (error) {
    console.error('Error fetching featured paintings:', error);
    return [];
  }
}

export default async function Home() {
  const featuredPaintings = await getFeaturedPaintings();
  
  console.log('Homepage - Featured paintings:', featuredPaintings.length);

  return (
    <div>
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/uploads/1765357410380_WhatsApp_Image_2025-12-10_at_10.05.43.jpeg"
            alt="Background art"
            fill
            className="object-cover"
            priority
            quality={85}
          />
          {/* Overlay pentru contrast mai bun */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 drop-shadow-2xl leading-tight">
            Artă Originală
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
            Descoperă colecția de tablouri unice create cu pasiune și dedicare de Victoria Ocara
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/galerie"
              className="inline-block bg-white/90 text-primary px-8 py-4 rounded-lg hover:bg-white hover:scale-105 transition-all duration-300 text-lg font-semibold shadow-xl backdrop-blur-sm"
            >
              Explorează Galeria
            </Link>
            <Link
              href="/contact"
              className="inline-block border-2 border-white/80 text-white px-8 py-4 rounded-lg hover:bg-white/10 hover:scale-105 transition-all duration-300 text-lg font-semibold backdrop-blur-sm"
            >
              Contact Artist
            </Link>
          </div>
        </div>
      </section>

      {featuredPaintings.length > 0 ? (
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-serif font-bold text-center mb-12">
            Lucrări Selectate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPaintings.map((painting: any) => (
              <PaintingCard key={painting._id} painting={painting} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/galerie"
              className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
            >
              Vezi Toate Tablourile
            </Link>
          </div>
        </section>
      ) : (
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl font-serif font-bold mb-8">
            Lucrări Selectate
          </h2>
          <p className="text-gray-600 mb-8">
            Nu există tablouri selectate momentan pentru afișare pe homepage.
          </p>
          <Link
            href="/galerie"
            className="inline-block bg-primary text-white px-8 py-4 rounded-lg hover:bg-accent transition-colors"
          >
            Vezi Toate Tablourile
          </Link>
        </section>
      )}

      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">Artă Originală</h3>
              <p className="text-gray-600">
                Fiecare tablou este o lucrare unică, creată manual cu atenție la detalii
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">Livrare Sigură</h3>
              <p className="text-gray-600">
                Ambalăm și expediem fiecare tablou cu grijă maximă pentru siguranța sa
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold mb-4">Plată Securizată</h3>
              <p className="text-gray-600">
                Procesăm plățile prin Stripe pentru siguranța și confidențialitatea ta
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
