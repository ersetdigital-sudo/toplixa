# Task 5: CheckoutOverlay — WhatsApp Redirect

**Files:**
- Modify: `components/checkout/CheckoutOverlay.tsx`
- Modify: `components/sections/GameOrderForm.tsx`
- Modify: `app/top-up/[slug]/page.tsx`

**Interfaces:**
- Consumes: `buildWhatsAppUrl()`, `buildOrderMessage()` from `lib/whatsapp.ts`
- Produces: Updated CheckoutOverlay with WhatsApp redirect on payment confirmation

## Requirements

### 1. Update CheckoutOverlay props

In `components/checkout/CheckoutOverlay.tsx`, add `whatsappNumber` prop:

```typescript
interface CheckoutOverlayProps {
  order: CheckoutOrder;
  onClose: () => void;
  whatsappNumber: string;
}
```

### 2. Import WhatsApp utilities

Add at top of CheckoutOverlay.tsx:

```typescript
import { buildWhatsAppUrl, buildOrderMessage } from "@/lib/whatsapp";
```

### 3. Change button text and add WhatsApp redirect

In the "pay" state of CheckoutOverlay, find the "Saya Sudah Bayar" button and replace it with:

```tsx
<button
  onClick={() => {
    const message = buildOrderMessage({
      gameName: order.game.name,
      userId: order.userId,
      serverId: order.serverId,
      nominalLabel: order.nominalLabel,
      price: order.price,
      orderId: order.orderId,
      total: order.total,
    });
    const url = buildWhatsAppUrl(whatsappNumber, message);
    window.open(url, "_blank");
    setStep("done");
  }}
  className="w-full bg-[#d4af6a] text-black font-semibold py-3 rounded-xl hover:bg-[#e7cf9c] transition"
>
  Konfirmasi Pembayaran
</button>
```

### 4. Update GameOrderForm to pass whatsappNumber

In `components/sections/GameOrderForm.tsx`:

1. Add `whatsappNumber` to the props interface:
```typescript
interface GameOrderFormProps {
  game: DbGameWithNominals;
  qrisUrl: string;
  whatsappNumber: string;
}
```

2. When rendering CheckoutOverlay, pass the prop:
```tsx
<CheckoutOverlay
  order={order}
  onClose={() => setOrder(null)}
  whatsappNumber={whatsappNumber}
/>
```

### 5. Update page.tsx to fetch and pass whatsappNumber

In `app/top-up/[slug]/page.tsx`:

1. Add import:
```typescript
import { getWhatsAppNumber } from "@/lib/db";
```

2. Inside the component, fetch the number:
```typescript
const whatsappNumber = await getWhatsAppNumber();
```

3. Pass to GameOrderForm:
```tsx
<GameOrderForm game={game} qrisUrl={qrisUrl} whatsappNumber={whatsappNumber} />
```

## After Implementation

1. Run `npm run build` to verify no TypeScript errors
2. Commit with message: `feat: add WhatsApp redirect on payment confirmation`
