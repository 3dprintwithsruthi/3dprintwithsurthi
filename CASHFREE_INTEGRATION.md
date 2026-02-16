# Cashfree Payment Integration - 3D Print with Sruthi

## Overview

This document describes the complete Cashfree payment gateway integration for the 3D Print with Sruthi e-commerce platform.

## Features Implemented

### 1. **Professional Checkout UI**
- Modern, enterprise-grade checkout form with:
  - Customer details section (Name, Phone)
  - Shipping address section (Complete address form)
  - Payment method selection (Online Payment / Cash on Delivery)
  - Order summary sidebar with real-time calculations
  - Responsive design with gradient styling
  - Loading states and error handling

### 2. **Payment Method Options**
- **Online Payment**: UPI, Cards, Net Banking, and more via Cashfree
- **Cash on Delivery (COD)**: Traditional payment on delivery

### 3. **Cashfree Integration**
- **Payment Session Creation**: Server-side order creation with Cashfree
- **Drop-in Checkout**: Seamless payment UI using Cashfree SDK
- **Payment Verification**: Automatic verification after payment
- **Webhook Handler**: Real-time payment status updates

### 4. **Database Schema Updates**
Added to Order model:
- `paymentSessionId`: Cashfree payment session ID
- `paymentStatus`: PENDING, PAID, FAILED
- `paymentMethod`: COD, ONLINE

## File Structure

```
src/
├── app/
│   ├── checkout/
│   │   ├── checkout-form.tsx       # Main checkout form with payment selection
│   │   ├── page.tsx                # Checkout page wrapper
│   │   └── payment/
│   │       └── page.tsx            # Cashfree payment page
│   ├── orders/
│   │   └── verify/
│   │       └── page.tsx            # Payment verification page
│   ├── actions/
│   │   └── order.ts                # Updated with Cashfree payment logic
│   └── api/
│       └── cashfree/
│           └── webhook/
│               └── route.ts        # Webhook handler for payment updates
├── lib/
│   └── cashfree.ts                 # Cashfree SDK initialization
└── prisma/
    └── schema.prisma               # Updated Order model
```

## Environment Variables

Add these to your `.env` file:

```bash
# Cashfree Payment Gateway
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_ENV=PRODUCTION  # or SANDBOX for testing
NEXT_PUBLIC_CASHFREE_ENV=PRODUCTION  # Client-side env
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Update Database Schema
```bash
npx prisma db push
npx prisma generate
```

### 3. Configure Cashfree
1. Log in to your [Cashfree Dashboard](https://merchant.cashfree.com/)
2. Get your App ID and Secret Key from API Keys section
3. Add them to your `.env` file
4. Configure webhook URL in Cashfree dashboard:
   - URL: `https://yourdomain.com/api/cashfree/webhook`
   - Events: Payment Success, Payment Failed

### 4. Run Development Server
```bash
npm run dev
```

## User Flow

### Online Payment Flow

1. **Checkout Page** (`/checkout`)
   - User fills in shipping details
   - Selects "Pay Online" payment method
   - Clicks "Place Order"

2. **Order Creation**
   - Server creates order in database
   - Creates Cashfree payment session
   - Returns payment session ID

3. **Payment Page** (`/checkout/payment`)
   - Loads Cashfree Drop-in checkout
   - User completes payment
   - Redirects to verification page

4. **Verification Page** (`/orders/verify`)
   - Verifies payment status with Cashfree
   - Updates order payment status
   - Shows success/failure message

5. **Webhook** (Background)
   - Cashfree sends real-time updates
   - Server updates order status
   - Ensures payment status is synchronized

### COD Flow

1. **Checkout Page** (`/checkout`)
   - User fills in shipping details
   - Selects "Cash on Delivery"
   - Clicks "Place Order"

2. **Order Creation**
   - Server creates order in database
   - Sets payment method as COD
   - Redirects to orders page

## API Endpoints

### POST `/api/cashfree/webhook`
Receives payment status updates from Cashfree.

**Headers:**
- `x-webhook-signature`: HMAC signature for verification
- `x-webhook-timestamp`: Timestamp of the webhook

**Events Handled:**
- `PAYMENT_SUCCESS_WEBHOOK`: Updates order to PAID
- `PAYMENT_FAILED_WEBHOOK`: Updates order to FAILED

## Security Features

1. **Webhook Signature Verification**: All webhooks are verified using HMAC SHA-256
2. **SSL Encryption**: All payment data transmitted over HTTPS
3. **PCI DSS Compliance**: Cashfree handles all sensitive card data
4. **Server-side Validation**: All payment verification done server-side

## UI/UX Enhancements

### Checkout Form
- **Sectioned Layout**: Clear separation of customer details, shipping, and payment
- **Icon-based Headers**: Visual indicators for each section
- **Real-time Validation**: Zod schema validation with error messages
- **Order Summary**: Sticky sidebar with itemized breakdown
- **Payment Method Cards**: Large, clickable cards with icons
- **Loading States**: Spinner and disabled state during submission

### Payment Page
- **Loading Animation**: Professional loading screen while initializing
- **Security Badges**: SSL and PCI DSS compliance indicators
- **Error Handling**: Clear error messages with retry options

### Verification Page
- **Success State**: Green checkmark with order confirmation
- **Failure State**: Red X with retry options
- **Pending State**: Loading spinner for ongoing verification

## Testing

### Test Mode (Sandbox)
1. Set `CASHFREE_ENV=SANDBOX` in `.env`
2. Use Cashfree test credentials
3. Use test card numbers from [Cashfree Test Cards](https://docs.cashfree.com/docs/test-data)

### Test Cards
- **Success**: 4111 1111 1111 1111
- **Failure**: 4007 0000 0027 8403
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Production Deployment

### Checklist
- [ ] Update `CASHFREE_ENV` to `PRODUCTION`
- [ ] Use production Cashfree credentials
- [ ] Configure webhook URL in Cashfree dashboard
- [ ] Test end-to-end payment flow
- [ ] Verify webhook signature validation
- [ ] Enable HTTPS on your domain
- [ ] Test both payment methods (Online & COD)

### Webhook Configuration
1. Go to Cashfree Dashboard → Developers → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/cashfree/webhook`
3. Select events: `PAYMENT_SUCCESS_WEBHOOK`, `PAYMENT_FAILED_WEBHOOK`
4. Save and test webhook

## Troubleshooting

### Payment Session Not Created
- Check Cashfree credentials in `.env`
- Verify `CASHFREE_ENV` is set correctly
- Check server logs for Cashfree API errors

### Webhook Not Receiving Updates
- Verify webhook URL is publicly accessible
- Check webhook signature verification
- Ensure webhook URL is configured in Cashfree dashboard

### Payment Verification Fails
- Check if order exists in database
- Verify Cashfree API credentials
- Check network connectivity to Cashfree API

## Support

For Cashfree-specific issues:
- [Cashfree Documentation](https://docs.cashfree.com/)
- [Cashfree Support](https://support.cashfree.com/)

For application issues:
- Check server logs
- Verify database connection
- Review environment variables

## License

This integration is part of the 3D Print with Sruthi e-commerce platform.
