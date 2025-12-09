import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import PaintingCard from '@/components/PaintingCard';

async function getFeaturedPaintings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/paintings?featured=true`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const featuredPaintings = await getFeaturedPaintings();

  return (
    <div>
      <section className="relative h-[80vh] flex items-center justify-center bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-6">
            Artă Originală
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Descoperă colecția noastră de tablouri unice, create cu pasiune și dedicare
          </p>
          <Link
            href="/galerie"
            className="inline-block bg-primary text-white px-8 py-4 rounded-lg hover:bg-accent transition-colors duration-300 text-lg font-semibold"
          >
            Explorează Galeria
          </Link>
        </div>
      </section>

      {featuredPaintings.length > 0 && (
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
