import { fetchWithAuth } from "./client";

export async function generatePickupRequest(shipmentIds: string[]) {
  return await fetchWithAuth("/courier/generate/pickup", {
    method: "POST",
    body: JSON.stringify({
      shipment_id: shipmentIds,
    }),
  });
}
