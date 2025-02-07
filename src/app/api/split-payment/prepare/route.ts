import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, isTestMode, currency, paidBy, participants } = await request.json();

    // For testing, we'll simulate a backend response
    // In production, this would make calls to payment/conversion services
    const mockResponse = {
      amount: amount, // The original amount
      currency: currency,
      paidBy, // The person who paid and scanned the receipt
      participants, // People who need to pay back
      status: 'ready',
      paymentId: Math.random().toString(36).substring(7),
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Split payment preparation error:', error);
    return NextResponse.json(
      { error: 'Failed to prepare payment' },
      { status: 500 }
    );
  }
}
