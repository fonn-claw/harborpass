/**
 * Credential generation for marina guest check-in.
 * Patterns match the seed data helpers in src/db/seed.ts.
 */

export function generateGateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function generateWifiPassword(lastName: string): string {
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `harbor-${lastName.toLowerCase()}-${digits}`;
}
