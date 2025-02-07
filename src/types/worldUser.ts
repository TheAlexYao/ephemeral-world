export interface WorldUser {
  id: string;
  name?: string | null;
  email?: string | null;
  verified: boolean;
  verificationLevel?: string;
  orb_verified?: boolean;
  device_verified?: boolean;
}
