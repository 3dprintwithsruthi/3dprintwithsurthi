import cashfree from './src/lib/cashfree'

async function main() {
  const orderId = 'cmmzxd9xq0002u0lp7ov84fk9';
  try {
    const response = await cashfree.PGOrderFetchPayments(orderId);
    console.log("Cashfree Payments for order:", orderId);
    console.log(JSON.stringify(response.data, null, 2));

    const orderResponse = await cashfree.PGGetOrder(orderId); // Wait, API is different maybe?
  } catch (err) {
    console.error("Error fetching from Cashfree:", err.response?.data || err.message);
  }
}

main();
