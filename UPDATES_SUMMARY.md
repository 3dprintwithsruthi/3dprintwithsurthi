# 🔄 Latest Updates Summary

## 1. User Registration & Phone Number
- **Database Update**: Added `phone` field to User table.
- **Registration Form**: Added Phone Number input field.
- **Validation**: Added phone number validation (min 10 characters).
- **Backend**: Updated registration logic to save phone numbers.

## 2. Order & Account Management
- **Delete Order**: Admin can now delete orders permanently.
  - Doing so removes the order from all records and analytics.
  - Added a "Delete" (Trash) button in the Admin Orders list.
- **Delete Account**: Users can now delete their own account.
  - Created a new **My Account** page at `/account`.
  - Added a "Delete Account" button in the Danger Zone.
  - Account deletion removes all user data and orders.

## 3. Admin Improvements
- **User Phone Display**: Added customer phone number display next to their email in the Admin Orders list.

## 4. Pricing Updates
- **Zero Tax & Shipping**:
  - `TAX_RATE` set to 0% (was 18%).
  - `SHIPPING_FLAT` set to ₹0 (was ₹49).

## 5. UI Updates
- **Navbar**: Updated user menu to link to `/account` (Profile) instead of just `/orders`.
- **Account Page**: New comprehensive profile page showing user details, recent orders, and account management options.
