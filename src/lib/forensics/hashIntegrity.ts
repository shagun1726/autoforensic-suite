/**
 * Evidence Integrity Module
 * Calculates SHA-256 hash for evidence files to ensure chain of custody
 */

export async function calculateSHA256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verifyIntegrity(content: string, expectedHash: string): Promise<boolean> {
  const actualHash = await calculateSHA256(content);
  return actualHash === expectedHash;
}
