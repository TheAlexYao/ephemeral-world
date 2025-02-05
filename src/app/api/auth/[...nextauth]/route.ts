/**
 * NextAuth Authentication Route Handler
 * 
 * This is the main authentication endpoint that handles:
 * - WorldID OAuth authentication flow
 * - Session management
 * - Token handling
 * - Callback processing
 * 
 * The route is dynamically created by NextAuth based on the configuration
 * in authOptions. It handles both GET and POST requests for various
 * authentication flows like signin, callback, session, etc.
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create the NextAuth handler with our custom configuration
const handler = NextAuth(authOptions);

// Export handler for both GET and POST methods
// This enables all NextAuth authentication flows
export { handler as GET, handler as POST };
