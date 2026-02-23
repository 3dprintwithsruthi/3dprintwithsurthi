import { NextResponse } from "next/server";
import { getShiprocketToken } from "@/lib/shiprocket";

export async function GET() {
    const token = await getShiprocketToken();
    if (!token) {
        return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 });
    }

    return NextResponse.json({ token });
}
