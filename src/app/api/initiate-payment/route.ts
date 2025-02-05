/**
 * Payment Initiation Route Handler
 * 
 * This module handles the initiation of World ID payments by:
 * 1. Generating a unique payment reference
 * 2. Storing it securely in an HTTP-only cookie
 * 3. Returning the reference to be used in the payment flow
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST handler for initiating a new payment
 * 
 * Creates a unique reference ID for tracking the payment and stores
 * it in a secure cookie. This reference will be used to verify the
 * payment completion in the confirm-payment endpoint.
 * 
 * @param req - Next.js request object
 * @returns JSON response with payment reference ID
 */
export async function POST(req: NextRequest) {
  // Generate a unique payment reference (UUID without hyphens)
  const uuid = crypto.randomUUID().replace(/-/g, "");

  // Store payment reference in HTTP-only cookie for security
  // This prevents XSS attacks from accessing the reference
  cookies().set({
    name: "payment-nonce",
    value: uuid,
    httpOnly: true,
  });

  // Log reference for debugging
  console.log(uuid);

  // Return reference to client for payment flow
  return NextResponse.json({ id: uuid });
}
