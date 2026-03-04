import { Cashfree } from "cashfree-pg";

console.log(Cashfree.XEnvironment);

Cashfree.XClientId = process.env.CASHFREE_APP_ID || "app_id";
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || "secret";
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

async function test() {
    try {
        const response = await Cashfree.PGCreateOrder("2023-08-01", {
            order_id: "test_" + Date.now(),
            order_amount: 10,
            order_currency: "INR",
            customer_details: {
                customer_id: "u123",
                customer_phone: "9876543210",
                customer_name: "Test",
            },
            order_meta: {
                return_url: "https://example.com",
            }
        });
        console.log("Success:", response.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}
test();
