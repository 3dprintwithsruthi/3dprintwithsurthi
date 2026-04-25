import { fetchWithAuth } from "./client";

export async function trackAWB(awb: string) {
  return await fetchWithAuth(`/courier/track/awb/${awb}`);
}

export async function trackOrder(orderId: string) {
  return await fetchWithAuth(`/courier/track?order_id=${orderId}`);
}
