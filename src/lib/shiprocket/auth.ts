// In-memory token cache
let shiprocketToken: string | null = null;
let tokenExpiryTime: number | null = null;

export async function getShiprocketToken(): Promise<string | null> {
  // DUMMY MODE: Force return null to keep system disconnected safely.
  return null;
}
