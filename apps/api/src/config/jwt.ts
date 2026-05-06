export const DEFAULT_JWT_SECRET = 'your-secret-key-change-in-production';

export function getJwtSecret() {
  return process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
}
