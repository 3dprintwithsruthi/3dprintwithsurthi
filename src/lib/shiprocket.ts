import { prisma } from "./db";

export async function getShiprocketToken() {
    const url = "https://apiv2.shiprocket.in/v1/external/auth/login";
    const params = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        }),
    };

    try {
        const res = await fetch(url, params);
        if (!res.ok) {
            console.error("Shiprocket Auth Failed:", await res.text());
            return null;
        }
        const data = await res.json();
        return data.token;
    } catch (error) {
        console.error("Shiprocket Token Error:", error);
        return null;
    }
}

export async function createShiprocketOrder(orderPayload: any) {
    const token = await getShiprocketToken();
    if (!token) return null;

    try {
        const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderPayload),
        });

        const data = await response.json();
        console.log("Shiprocket Order Response:", data);
        return data;
    } catch (error) {
        console.error("Shiprocket Create Order Error:", error);
        return null;
    }
}

export async function pushOrderToShiprocket(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: true,
                orderItems: { include: { product: true } }
            }
        });

        if (!order) return null;

        let addressData: any = {};
        try {
            addressData = JSON.parse(order.address);
        } catch (e) { /* fallback if not json */
            addressData = { fullName: "Customer", addressLine1: order.address, city: "Unknown", state: "Unknown", pincode: "000000", phone: "0000000000" };
        }

        const items = order.orderItems.map((item) => ({
            name: item.product.name,
            sku: item.productId.substring(0, 10), // Need a SKU, just use Product ID portion
            units: item.quantity,
            selling_price: Number(item.price),
        }));

        const payload = {
            order_id: order.id,
            order_date: order.createdAt.toISOString(),
            pickup_location: "Primary",
            billing_customer_name: addressData.fullName || order.user.name,
            billing_address: addressData.addressLine1 || "No Address",
            billing_address_2: addressData.addressLine2 || "",
            billing_city: addressData.city || "Unknown",
            billing_pincode: addressData.pincode || "000000",
            billing_state: addressData.state || "Unknown",
            billing_country: "India",
            billing_email: order.user.email,
            billing_phone: addressData.phone || "0000000000",
            shipping_is_billing: true,
            order_items: items,
            payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
            sub_total: Number(order.totalAmount),
            length: 10,
            breadth: 10,
            height: 5,
            weight: 0.5,
        };

        const result = await createShiprocketOrder(payload);
        return result;
    } catch (error) {
        console.error("Error pushing to Shiprocket:", error);
        return null;
    }
}
