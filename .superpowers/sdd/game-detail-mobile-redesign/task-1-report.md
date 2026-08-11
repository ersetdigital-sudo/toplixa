# Task 1 Report: WhatsApp Utility Functions

## Status
DONE

## Commit
- `a67db44` feat: add WhatsApp URL builder and phone normalizer

## Changes
- Created `lib/whatsapp.ts` with three exported functions:
  - `normalizeWhatsAppNumber(raw: string): string` — normalizes Indonesian phone numbers to 62XXXXXXXXXX format
  - `buildWhatsAppUrl(phone: string, message: string): string` — builds wa.me deep-link URL
  - `buildOrderMessage(order: {...}): string` — builds formatted order confirmation message

## Verification
- `tsc --noEmit` passed with no errors

## Concerns
None.
