
import { Cashfree, CFEnvironment } from "cashfree-pg";

const cashfree = new Cashfree(
    process.env.CASHFREE_ENV === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.CASHFREE_APP_ID,
    process.env.CASHFREE_SECRET_KEY,
    undefined,
    undefined,
    undefined,
    false,
    undefined
);

cashfree.XApiVersion = "2023-08-01";

export default cashfree;
