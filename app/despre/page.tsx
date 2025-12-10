import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FiInstagram } from 'react-icons/fi';
import { SiThreads, SiFacebook } from 'react-icons/si';

export const metadata: Metadata = {
  title: 'Despre Victoria Ocara - Artist',
  description: 'Descoperă povestea artistei Victoria Ocara, specializată în pictura cu ulei, tehnica impasto și arta cu accent pe albastru, inspirată de Monet și Van Gogh.',
};

export default function DesprePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">
                Victoria Ocara
              </h1>
              <div className="text-xl text-gray-700 mb-8 space-y-4">
                <p className="flex items-center gap-2">
                  🎨 <span className="font-semibold">Oil Painter</span>
                </p>
                <p className="flex items-center gap-2">
                  ✨ <span>Impasto & Blue-focused Art</span>
                </p>
                <p className="flex items-center gap-2">
                  🌟 <span>Inspired by Monet & Van Gogh</span>
                </p>
                <p className="flex items-center gap-2 text-blue-600 font-medium">
                  💙 <span>Blue is my language</span>
                </p>
                <p className="flex items-center gap-2 text-accent font-medium">
                  📝 <span>Commissions open</span>
                </p>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 mb-8">
                <a
                  href="https://www.instagram.com/victoria.ocara/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
                >
                  <FiInstagram className="w-5 h-5" />
                  Instagram
                </a>
                <a
                  href="https://www.threads.com/@victoria.ocara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
                >
                  <SiThreads className="w-5 h-5" />
                  Threads
                </a>
                <a
                  href="https://www.facebook.com/victoria.ocara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
                >
                  <SiFacebook className="w-5 h-5" />
                  Facebook
                </a>
              </div>

              <Link
                href="/contact"
                className="inline-block bg-primary text-white px-8 py-4 rounded-lg hover:bg-accent transition-colors text-lg font-semibold"
              >
                Contactează-mă pentru Comisii
              </Link>
            </div>

            {/* Artist Photo */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/uploads/artist-photo.jpg"
                    alt="Victoria Ocara - Artist"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-60"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">
              Povestea Mea Artistică
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-serif font-semibold mb-4 text-blue-600">
                  Pasiunea pentru Albastru
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Albastrul nu este doar o culoare în arta mea - este limbajul prin care îmi exprim emoțiile și viziunea. 
                  Fiecare nuanță de albastru povestește o poveste diferită, de la liniștea cerului până la profunzimea oceanului.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Tehnica impasto îmi permite să creez texturi bogate și expresive, aducând viață și dimensiune 
                  fiecărei pânze prin straturi groase de culoare.
                </p>
              </div>
              
              <div className="bg-blue-50 p-8 rounded-2xl">
                <h4 className="text-xl font-semibold mb-4 text-primary">Inspirații</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span>Claude Monet - maestrul luminii și culorii</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span>Vincent van Gogh - expresivitatea și pasiunea</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span>Natura și peisajele marine</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                    <span>Emoțiile și stările sufletești</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technique Section */}
            <div className="bg-secondary p-8 rounded-2xl mb-16">
              <h3 className="text-2xl font-serif font-semibold mb-6 text-center">
                Tehnica Mea
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🎨</span>
                  </div>
                  <h4 className="font-semibold mb-2">Pictura cu Ulei</h4>
                  <p className="text-sm text-gray-600">
                    Folosesc culori cu ulei pentru profunzime și richețe cromatică
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">✨</span>
                  </div>
                  <h4 className="font-semibold mb-2">Tehnica Impasto</h4>
                  <p className="text-sm text-gray-600">
                    Straturi groase de vopsea pentru texturi expresive
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">💙</span>
                  </div>
                  <h4 className="font-semibold mb-2">Paleta Albastră</h4>
                  <p className="text-sm text-gray-600">
                    Accent pe nuanțele de albastru și contrastele complementare
                  </p>
                </div>
              </div>
            </div>

            {/* Commission Section */}
            <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-serif font-bold mb-4">
                Comisii Personalizate
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Îți pot crea o lucrare unică, personalizată după viziunea ta. 
                Fiecare comision este o colaborare artistică specială.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Solicită o Comision
                </Link>
                <Link
                  href="/galerie"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Vezi Portofoliul
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}