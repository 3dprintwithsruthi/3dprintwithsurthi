import { NextResponse } from "next/server";
import { createShiprocketOrder } from "@/lib/shiprocket";

export async function POST(req: Request) {
    try {
        const orderData = await req.json();
        const result = await createShiprocketOrder(orderData);

        if (!result) {
            return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
