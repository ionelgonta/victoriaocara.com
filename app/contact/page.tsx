import { Metadata } from 'next';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Contact - ArtGallery',
  description: 'Contactează-ne pentru întrebări despre tablourile noastre.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-serif font-bold text-center mb-4">Contact</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Ai întrebări? Ne-ar plăcea să auzim de la tine!
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Trimite-ne un Mesaj</h2>
          
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nume *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefon</label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mesaj *</label>
              <textarea
                required
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-accent transition-colors duration-300 font-semibold"
            >
              Trimite Mesajul
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Informații de Contact</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <FiMail className="w-6 h-6 text-accent mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <a
                  href="mailto:contact@artgallery.ro"
                  className="text-gray-600 hover:text-primary"
                >
                  contact@artgallery.ro
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiPhone className="w-6 h-6 text-accent mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Telefon</h3>
                <a
                  href="tel:+40123456789"
                  className="text-gray-600 hover:text-primary"
                >
                  +40 123 456 789
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiMapPin className="w-6 h-6 text-accent mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Adresă</h3>
                <p className="text-gray-600">
                  Strada Artei, Nr. 123<br />
                  București, România
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-secondary rounded-lg">
            <h3 className="font-semibold mb-2">Program de Lucru</h3>
            <p className="text-gray-600">
              Luni - Vineri: 10:00 - 18:00<br />
              Sâmbătă: 10:00 - 14:00<br />
              Duminică: Închis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
