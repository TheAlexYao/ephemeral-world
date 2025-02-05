/**
 * Authentication Configuration Module
 * 
 * This module configures NextAuth to use WorldID as the authentication provider.
 * It handles:
 * - OAuth provider setup
 * - Custom profile data extraction
 * - JWT token management
 * - Session configuration
 * - Custom pages routing
 */

import { AuthOptions } from "next-auth";

/**
 * NextAuth configuration options
 * Defines the complete authentication setup for the application
 */
export const authOptions: AuthOptions = {
  // Secret used to encrypt cookies and tokens
  secret: process.env.NEXTAUTH_SECRET,

  // Configure authentication providers
  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      // Use OpenID Connect discovery
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      // Request minimal scope for identity verification
      authorization: { params: { scope: "openid" } },
      // WorldID OAuth credentials
      clientId: process.env.WLD_CLIENT_ID,
      clientSecret: process.env.WLD_CLIENT_SECRET,
      // Enable ID token validation
      idToken: true,
      // Security checks for OAuth flow
      checks: ["state", "nonce", "pkce"],
      /**
       * Transform WorldID profile data into our user model
       * @param profile - Raw profile data from WorldID
       * @returns Normalized user profile
       */
      profile(profile) {
        return {
          id: profile.sub,                     // Use subject as unique identifier
          name: profile.sub,                   // Use subject as display name
          verified: true,                      // User is verified through WorldID
          verificationLevel:                   // Store verification level
            profile["https://id.worldcoin.org/v1"].verification_level,
        };
      },
    },
  ],
  // Custom page routes for authentication flows
  pages: {
    signIn: "/signin",    // Custom sign-in page
    signOut: "/signin",   // Redirect to sign-in after logout
    error: "/signin",     // Error page for auth failures
  },
  // Custom callback functions for auth flow
  callbacks: {
    /**
     * Callback to customize JWT token contents
     * Adds WorldID verification data to the token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;                           // Add user ID to token
        token.verified = user.verified;               // Add verification status
        token.verificationLevel = user.verificationLevel;  // Add verification level
      }
      return token;
    },

    /**
     * Callback to customize session object
     * Adds WorldID verification data to the session
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;                           // Add user ID to session
        session.user.verified = token.verified;               // Add verification status
        session.user.verificationLevel = token.verificationLevel;  // Add verification level
      }
      return session;
    },
  },
  // Enable debug logs in development
  debug: process.env.NODE_ENV === "development",
};
