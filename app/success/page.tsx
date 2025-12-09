'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { FiCheckCircle } from 'react-icons/fi';

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-4xl font-serif font-bold mb-4">Comandă Finalizată!</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Mulțumim pentru comandă! Vei primi un email de confirmare în curând.
      </p>
      <div className="space-x-4">
        <Link
          href="/"
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-accent transition-colors"
        >
          Înapoi la Acasă
        </Link>
        <Link
          href="/galerie"
          className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-all"
        >
          Continuă Cumpărăturile
        </Link>
      </div>
    </div>
  );
}
