# Task 1: WhatsApp Utility Functions

**Files:**
- Create: `lib/whatsapp.ts`

**Interfaces:**
- Consumes: nothing (standalone utility)
- Produces: `normalizeWhatsAppNumber(raw: string): string`, `buildWhatsAppUrl(phone: string, message: string): string`, `buildOrderMessage(order: {...}): string`

## Requirements

Create `lib/whatsapp.ts` with three exported functions:

### 1. `normalizeWhatsAppNumber(raw: string): string`

Normalize Indonesian phone number to international format (62XXXXXXXXXX).

```typescript
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return "62" + digits;
}
```

### 2. `buildWhatsAppUrl(phone: string, message: string): string`

Build WhatsApp URL that works on both iOS and Android. Uses wa.me format which deep-links to WhatsApp app.

```typescript
export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}
```

### 3. `buildOrderMessage(order: {...}): string`

Build order message for WhatsApp with the following format:

```
🎮 Topup Toplixa

Game: {gameName}
User ID: {userId}
Server ID: {serverId}
Paket: {nominalLabel} - Rp {price}
Order ID: {orderId}
Total: Rp {total}

Sudah melakukan pembayaran via QRIS. Mohon diproses 🙏
```

```typescript
export function buildOrderMessage(order: {
  gameName: string;
  userId: string;
  serverId?: string;
  nominalLabel: string;
  price: number;
  orderId: string;
  total: number;
}): string {
  const lines = [
    "🎮 Topup Toplixa",
    "",
    `Game: ${order.gameName}`,
    `User ID: ${order.userId}`,
    `Server ID: ${order.serverId || "-"}`,
    `Paket: ${order.nominalLabel} - Rp ${order.price.toLocaleString("id-ID")}`,
    `Order ID: ${order.orderId}`,
    `Total: Rp ${order.total.toLocaleString("id-ID")}`,
    "",
    "Sudah melakukan pembayaran via QRIS. Mohon diproses 🙏",
  ];
  return lines.join("\n");
}
```

## After Implementation

1. Run `npm run build` to verify no TypeScript errors
2. Commit with message: `feat: add WhatsApp URL builder and phone normalizer`
