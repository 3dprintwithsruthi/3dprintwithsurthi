import { fetchWithAuth } from "./client";

export async function checkServiceability(params: {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod?: boolean;
}) {
  const query = new URLSearchParams({
    pickup_postcode: params.pickup_postcode,
    delivery_postcode: params.delivery_postcode,
    weight: params.weight.toString(),
    cod: params.cod ? "1" : "0",
  });

  return await fetchWithAuth(`/courier/serviceability/?${query}`);
}

export async function getBestCourier(params: {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod?: boolean;
}) {
  const data = await checkServiceability(params);
  const couriers = data.data.available_courier_companies || [];

  if (!couriers.length) {
    throw new Error("No couriers available for this route");
  }

  // Smart selection: find the one with best rating + price ratio
  // Or simply sort by rating
  const bestCourier = couriers.sort((a: any, b: any) => {
    // Priority 1: Rating (higher is better)
    if (b.rating !== a.rating) return b.rating - a.rating;
    
    // Priority 2: Cost (lower is better)
    return a.rate - b.rate;
  });

  return bestCourier[0]; // Return the standard structure provided by Shiprocket
}

export async function createShipment(options: { 
  shipment_id: string; 
  courier_id?: string;
}) {
  const body: any = {
    shipment_id: options.shipment_id,
  };
  
  if (options.courier_id) {
    body.courier_id = options.courier_id;
  }

  return await fetchWithAuth("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function generateLabel(shipment_id: string[]) {
  return await fetchWithAuth("/courier/generate/label", {
    method: "POST",
    body: JSON.stringify({
      shipment_id: shipment_id,
    }),
  });
}
