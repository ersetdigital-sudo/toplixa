# Task 2: Database — Add WhatsApp Number Setting

**Files:**
- Create: `supabase/migrations/003_add_whatsapp_number.sql`
- Modify: `lib/db.ts` (add query at end)

**Interfaces:**
- Consumes: existing `settings` table
- Produces: `getWhatsAppNumber(): Promise<string>` in `lib/db.ts`

## Requirements

### 1. Create migration

Create `supabase/migrations/003_add_whatsapp_number.sql`:

```sql
-- supabase/migrations/003_add_whatsapp_number.sql
INSERT INTO settings (key, value)
VALUES ('whatsapp_number', '"6281234567890"')
ON CONFLICT (key) DO NOTHING;
```

### 2. Add query to `lib/db.ts`

Append the following to the end of `lib/db.ts`:

```typescript
export async function getWhatsAppNumber(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "whatsapp_number")
    .single();

  if (!data?.value) return "6281234567890";
  try {
    return JSON.parse(data.value);
  } catch {
    return String(data.value).replace(/"/g, "");
  }
}
```

Make sure `createClient` is already imported in `lib/db.ts` (it should be from the existing code).

## After Implementation

1. Run `npm run build` to verify no TypeScript errors
2. Commit with message: `feat: add whatsapp_number setting to database`
