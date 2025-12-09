import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { createCheckoutSession } from '@/lib/stripe';
import { generateOrderNumber } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { items, customer } = await req.json();
    
    const total = items.reduce((sum: number, item: any) => 
      sum + (item.price * (item.quantity || 1)), 0
    );
    
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      customer,
      items,
      total,
      status: 'pending',
    });
    
    const session = await createCheckoutSession(items, order._id.toString());
    
    await Order.findByIdAndUpdate(order._id, {
      stripeSessionId: session.id,
    });
    
    return NextResponse.json({ sessionId: session.id, orderId: order._id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
