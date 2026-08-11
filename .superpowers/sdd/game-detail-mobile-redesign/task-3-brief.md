# Task 3: Admin Server Action for WhatsApp Number

**Files:**
- Modify: `app/admin/actions.ts` (add new action)

**Interfaces:**
- Consumes: `settings` table via Supabase, `requireAdmin()` from same file
- Produces: `updateWhatsAppNumber(number: string): Promise<{success: boolean, error?: string}>`

## Requirements

Add the following server action to `app/admin/actions.ts`:

```typescript
export async function updateWhatsAppNumber(number: string) {
  await requireAdmin();
  const supabase = await createClient();

  const digits = number.replace(/\D/g, "");
  if (digits.length < 10) {
    return { success: false, error: "Nomor minimal 10 digit" };
  }

  const normalized = digits.startsWith("62")
    ? digits
    : digits.startsWith("0")
    ? "62" + digits.slice(1)
    : "62" + digits;

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: "whatsapp_number", value: JSON.stringify(normalized) },
      { onConflict: "key" }
    );

  if (error) return { success: false, error: error.message };
  return { success: true };
}
```

**Important notes:**
- This file already has `"use server"` at the top - do NOT add another one
- `requireAdmin()` and `createClient` are already imported in this file
- Append the function at the end of the file

## After Implementation

1. Run `npm run build` to verify no TypeScript errors
2. Commit with message: `feat: add updateWhatsAppNumber server action`
