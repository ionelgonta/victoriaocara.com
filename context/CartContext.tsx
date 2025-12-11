'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface CartItem {
  _id: string;
  title: string | { en: string; ro: string };
  price: number;
  images: { url: string; alt: string }[];
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: any) => {
    // Validate item
    if (!item || !item._id) {
      toast.error('Invalid item');
      return;
    }

    // Check if item is sold
    if (item.sold) {
      toast.error('Acest tablou a fost deja vândut');
      return;
    }

    // Check if item is out of stock
    if (item.stock <= 0) {
      toast.error('Acest tablou nu este în stoc');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        toast.success('Cantitate actualizată în coș');
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
      }
      toast.success('Tablou adăugat în coș');
      return [...prev, { 
        ...item, 
        quantity: 1,
        // Ensure title is always a string to prevent React error #31
        title: typeof item.title === 'string' 
          ? item.title 
          : (typeof item.title === 'object' && item.title 
            ? (item.title.en || item.title.ro || 'Untitled')
            : 'Untitled'),
        price: item.price || 0,
        images: item.images || []
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
    toast.success('Tablou eliminat din coș');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item._id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
