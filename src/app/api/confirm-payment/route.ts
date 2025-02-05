/**
 * Payment Confirmation Route Handler
 * 
 * This module verifies World ID payments by:
 * 1. Validating the payment reference matches our records
 * 2. Verifying the transaction with World ID's API
 * 3. Confirming the payment status
 */

import { MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Interface for the payment confirmation request payload
 * Contains the success payload from World ID's payment widget
 */
interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload;  // Payment success data from World ID
}

/**
 * POST handler for confirming payments
 * 
 * This handler verifies that a World ID payment was successful by:
 * 1. Checking the payment reference matches our stored reference
 * 2. Verifying the transaction with World ID's API
 * 3. Confirming the transaction status
 * 
 * @param req - Next.js request object containing payment payload
 * @returns JSON response indicating payment success or failure
 */
export async function POST(req: NextRequest) {
  // Extract payment payload from request
  const { payload } = (await req.json()) as IRequestPayload;

  // Retrieve our stored payment reference from secure cookie
  const cookieStore = cookies();
  const reference = cookieStore.get("payment-nonce")?.value;

  // Log reference for debugging
  console.log(reference);

  // Verify we have a stored reference
  if (!reference) {
    return NextResponse.json({ success: false });
  }

  // Log payload for debugging
  console.log(payload);

  // Verify the payment reference matches our stored reference
  if (payload.reference === reference) {
    // Verify transaction with World ID's API
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.APP_ID}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
        },
      }
    );
    const transaction = await response.json();

    // Verify transaction status
    // Note: This is optimistic confirmation. For higher security,
    // you might want to poll until status == 'mined'
    if (transaction.reference == reference && transaction.status != "failed") {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false });
    }
  }

  // Return failure if reference doesn't match
  return NextResponse.json({ success: false });
}
