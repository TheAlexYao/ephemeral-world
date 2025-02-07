import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      verified: boolean;
      verificationLevel?: string;
    };
  }

  interface User extends DefaultUser {
    id: string;
    verified: boolean;
    verificationLevel?: string;
  }

  interface Profile {
    sub: string;
    'https://id.worldcoin.org/v1': {
      verification_level: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    verified: boolean;
    verificationLevel?: string;
  }
}
