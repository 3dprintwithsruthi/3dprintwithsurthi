import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateLabel, createShipment } from "@/lib/shiprocket/shipments";

export async function POST(req: Request) {
  try {
    const { orderId, shipmentId, courierId } = await req.json();

    if (!orderId && !shipmentId) {
      return NextResponse.json({ error: "orderId or shipmentId required" }, { status: 400 });
    }

    // Try to find shipment ID from order
    let targetShipmentId = shipmentId;
    let order;

    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
      });
      if (order && order.shiprocketShipmentId) {
        targetShipmentId = order.shiprocketShipmentId;
      }
    }

    if (!targetShipmentId) {
      return NextResponse.json({ error: "Shipment ID not found" }, { status: 404 });
    }

    // Create shipment directly with AWB assignment
    // According to SR flow, after order creation, we need to assign AWB.
    let awbResponse;
    try {
      awbResponse = await createShipment({
        shipment_id: targetShipmentId,
        courier_id: courierId,
      });
    } catch (e: any) {
      console.log("AWB assignment error (might already be assigned):", e.message);
    }
    
    // Check if we got an AWB number in response
    const awbCode = awbResponse?.response?.data?.awb_code;

    // After AWB is assigned, we can generate a label.
    // If generation fails but AWB was created, we still return the AWB.
    let labelResponse;
    try {
       labelResponse = await generateLabel([targetShipmentId]);
    } catch (e: any) {
        console.log("Label generate error:", e.message);
    }

    if (orderId && awbCode) {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                awbNumber: awbCode,
                // courierName could be mapped if included in response
            }
        });
    }

    return NextResponse.json({
        success: true,
        awb: awbCode || null,
        label: labelResponse?.label_url || null,
        awbResponse
    });

  } catch (error: any) {
    console.error("Label generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
