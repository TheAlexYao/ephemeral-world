/**
 * WorldID Verification Route Handler
 * 
 * This module handles the verification of WorldID proofs using the minikit-js SDK.
 * It verifies that a user has completed the World ID verification process and
 * validates their proof of personhood.
 */

import {
  verifyCloudProof,  // Function to verify World ID proof
  IVerifyResponse,    // Response type from verification
  ISuccessResult,     // Success result from World ID widget
} from "@worldcoin/minikit-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * Interface for the verification request payload
 */
interface IRequestPayload {
  payload: ISuccessResult;    // Proof data from World ID widget
  action: string;            // Action being verified (e.g., 'verify-account')
  signal: string | undefined; // Optional signal data for verification
}

/**
 * POST handler for verifying World ID proofs
 * 
 * This endpoint receives proof data from the World ID widget and verifies it
 * using the World ID cloud verification service. It ensures that:
 * 1. The proof is valid and not tampered with
 * 2. The proof was generated for this specific app
 * 3. The proof matches the requested action
 * 
 * @param req - Next.js request object containing proof payload
 * @returns JSON response with verification result
 */
export async function POST(req: NextRequest) {
  // Extract verification data from request
  const { payload, action, signal } = (await req.json()) as IRequestPayload;
  
  // Get app ID from environment (must be in format 'app_...')
  const app_id = process.env.APP_ID as `app_${string}`;
  
  // Verify the proof using World ID's cloud service
  const verifyRes = (await verifyCloudProof(
    payload,    // Proof data from widget
    app_id,     // Your app's identifier
    action,     // Action being verified
    signal      // Optional signal data
  )) as IVerifyResponse;
  
  // Log verification result for debugging
  console.log(verifyRes);

  if (verifyRes.success) {
    // Verification successful
    // At this point, you can:
    // 1. Mark the user as verified in your database
    // 2. Grant access to protected features
    // 3. Issue credentials or tokens
    return NextResponse.json({ verifyRes, status: 200 });
  } else {
    // Verification failed
    // Common reasons:
    // 1. User has already verified (duplicate proof)
    // 2. Invalid proof data
    // 3. Proof generated for different app/action
    return NextResponse.json({ verifyRes, status: 400 });
  }
}
