import Link from 'next/link';
import { FiFacebook, FiInstagram, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">Victoria Ocara</h3>
            <p className="text-gray-300">
              Tablouri originale create cu pasiune și dedicare.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Linkuri Utile</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Acasă
                </Link>
              </li>
              <li>
                <Link href="/galerie" className="text-gray-300 hover:text-white transition-colors">
                  Galerie
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Urmărește-ne</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FiFacebook className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FiInstagram className="w-6 h-6" />
              </a>
              <a
                href="mailto:contact@artgallery.ro"
                className="text-gray-300 hover:text-white transition-colors"
              >
                <FiMail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Victoria Ocara. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
}
