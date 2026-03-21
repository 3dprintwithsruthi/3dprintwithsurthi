import { Cashfree, CFEnvironment } from "cashfree-pg";

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID || "",
    process.env.CASHFREE_SECRET_KEY || "",
    undefined,
    undefined,
    undefined,
    false,
    undefined
);
cashfree.XApiVersion = "2023-08-01";

async function main() {
    try {
        const orderId = "cmmzxd9xq0002u0lp7ov84fk9";
        
        console.log("Fetching order:", orderId);
        
        try {
            const orderMetadata = await cashfree.PGGetOrder(orderId);
            console.log("Order Metadata:", JSON.stringify(orderMetadata.data, null, 2));
        } catch (err) {
            console.log("Couldn't get order metadata, maybe API mismatch.", err?.message);
        }

        const response = await cashfree.PGOrderFetchPayments(orderId);
        console.log("Payments Array:", JSON.stringify(response.data, null, 2));
    } catch (e: any) {
        console.error("Error fetching order payments:");
        console.error(e.response?.data || e.message);
    }
}
main();
