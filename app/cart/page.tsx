'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-serif font-bold mb-4">Coșul Tău</h1>
        <p className="text-xl text-gray-600 mb-8">Coșul tău este gol</p>
        <Link
          href="/galerie"
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-accent transition-colors"
        >
          Continuă Cumpărăturile
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold mb-8">Coșul Tău</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 bg-white p-4 rounded-lg shadow-md"
            >
              <div className="relative w-24 h-24 flex-shrink-0">
                {item.images && item.images[0] && (
                  <Image
                    src={item.images[0].url}
                    alt={item.title}
                    fill
                    className="object-cover rounded"
                  />
                )}
              </div>

              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-gray-600">{formatPrice(item.price)}</p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <FiMinus />
                  </button>
                  <span className="px-4">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
                <p className="font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-2xl font-semibold mb-4">Sumar Comandă</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Livrare:</span>
                <span>Calculată la checkout</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-accent transition-colors font-semibold"
            >
              Finalizează Comanda
            </Link>

            <Link
              href="/galerie"
              className="block w-full text-center mt-4 text-gray-600 hover:text-primary"
            >
              Continuă Cumpărăturile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
