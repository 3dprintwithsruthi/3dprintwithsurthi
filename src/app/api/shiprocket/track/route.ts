import { NextResponse } from "next/server";
import { trackAWB, trackOrder } from "@/lib/shiprocket/tracking";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const awb = searchParams.get("awb");
    const orderId = searchParams.get("orderId");

    if (!awb && !orderId) {
      return NextResponse.json({ error: "awb or orderId query parameter is required" }, { status: 400 });
    }

    let trackingData;
    if (awb) {
      trackingData = await trackAWB(awb);
    } else if (orderId) {
      trackingData = await trackOrder(orderId);
    }

    return NextResponse.json(trackingData);

  } catch (error: any) {
    console.error("Tracking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
