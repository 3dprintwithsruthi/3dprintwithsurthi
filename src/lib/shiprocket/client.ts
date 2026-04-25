import { getShiprocketToken } from "./auth";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getShiprocketToken();

  if (!token) {
    throw new Error("Shiprocket Authentication failed. No token available.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      // ignore
    }
    
    throw new Error(
      `Shiprocket API error (${response.status}): ${JSON.stringify(errorData)}`
    );
  }

  return response.json();
}
