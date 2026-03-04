import { Cashfree, CFEnvironment } from "cashfree-pg";

const cashfree = new Cashfree(
    CFEnvironment.PRODUCTION,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY,
    undefined,
    undefined,
    undefined,
    false,
    undefined
);

cashfree.XApiVersion = "2023-08-01";

async function run() {
    try {
        const createOrderRequest = {
            order_id: "test_" + Date.now(),
            order_amount: 10,
            order_currency: "INR",
            customer_details: {
                customer_id: "user123",
                customer_phone: "9876543210",
                customer_name: "Test user",
                customer_email: "test@example.com"
            },
            order_meta: {
                return_url: "https://example.com",
                notify_url: "https://example.com/webhook"
            },
            order_note: "3D Print Order"
        };
        const response = await cashfree.PGCreateOrder(createOrderRequest as any);
        console.log("Success:", response.data);
    } catch (cfError) {
        console.error("Cashfree Error:", cfError.response ? cfError.response.data : cfError.message);
    }
}
run();
