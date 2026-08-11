# Task 5 Report: CheckoutOverlay — WhatsApp Redirect

**Status:** DONE

## Changes Made

1. **`components/checkout/CheckoutOverlay.tsx`**
   - Added `whatsappNumber` to `CheckoutOverlayProps` interface
   - Imported `buildWhatsAppUrl` and `buildOrderMessage` from `@/lib/whatsapp`
   - Replaced "Saya Sudah Bayar" button with "Konfirmasi Pembayaran" that builds a WhatsApp message with order details and opens it in a new tab before transitioning to the "done" step

2. **`components/sections/GameOrderForm.tsx`**
   - Added `whatsappNumber: string` to `GameOrderFormProps` interface
   - Passed `whatsappNumber` prop to `CheckoutOverlay` render

3. **`app/top-up/[slug]/page.tsx`**
   - Added `getWhatsAppNumber` to the `@/lib/db` import
   - Fetched `whatsappNumber` via `await getWhatsAppNumber()`
   - Passed `whatsappNumber` to `GameOrderForm`

## Verification

- `tsc --noEmit` — zero errors
- `npm run build` — successful, all routes rendered

## Commit

- `2e0ab8a` — `feat: add WhatsApp redirect on payment confirmation`

## Notes

- The `order.game` field is a `string` (game name), matching the `gameName` param expected by `buildOrderMessage`
- WhatsApp number is fetched server-side from the `settings` table and passed down through the component tree (no client-side data fetching needed)
- Fallback number `6281234567890` is handled by `getWhatsAppNumber()` if the DB setting is missing
