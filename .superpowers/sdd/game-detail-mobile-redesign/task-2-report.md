# Task 2: Database — WhatsApp Number Setting

**Status:** DONE

## Changes Made

1. **Created migration file**: `supabase/migrations/003_add_whatsapp_number.sql`
   - Inserts default WhatsApp number into settings table
   - Uses `ON CONFLICT DO NOTHING` for idempotent execution

2. **Added `getWhatsAppNumber()` function** to `lib/db.ts`
   - Queries settings table for whatsapp_number key
   - Returns default value "6281234567890" if not found
   - Handles JSON parsing with type-safe fallback
   - Added type assertion `as { data: SettingsRow | null }` to match existing code style
   - Converted `JSON.parse(String(data.value))` to handle `Json` type correctly

## TypeScript Verification

Build completed successfully with no errors:
```
npm run build ✓
```

## Commit

- **SHA:** 716e01b
- **Message:** feat: add whatsapp_number setting to database

## Notes

- The `value` field in `SettingsRow` is typed as `Json` (union type including number), so `String()` wrapper was added to handle all possible value types safely
- Used `as any` eslint disable comments to match existing code patterns in `lib/db.ts`