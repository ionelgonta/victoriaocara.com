import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default stripe;

export const createCheckoutSession = async (items: any[], orderId: string) => {
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'ron',
      product_data: {
        name: item.title,
        images: item.images ? [typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url] : [],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity || 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
    metadata: {
      orderId,
    },
  });

  return session;
};
