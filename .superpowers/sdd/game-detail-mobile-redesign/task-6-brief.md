# Task 6: Mobile-First Game Detail Layout

**Files:**
- Modify: `app/top-up/[slug]/page.tsx` (mobile layout)
- Modify: `components/sections/GameOrderForm.tsx` (responsive package grid)

**Interfaces:**
- Consumes: game data, qrisUrl, whatsappNumber
- Produces: Responsive layout matching wireframe structure

## Requirements

### 1. Update game detail page layout

Restructure `app/top-up/[slug]/page.tsx` for mobile-first layout. The current layout is a 2-column grid. Change it to a stacked layout on mobile.

**Mobile layout structure:**
```
┌─────────────────────────┐
│  ← Back    [Game Name]  │  ← Header with back button
├─────────────────────────┤
│  [Game Icon]            │
│  Range label (gold)     │
├─────────────────────────┤
│  ✓ Proses 24 jam        │
│  ✓ Bayar via QRIS       │  ← Benefits list
│  ✓ Uang kembali         │
├─────────────────────────┤
│  User ID: [________]    │
│  Server ID: [_____]     │  ← Form inputs
├─────────────────────────┤
│  ┌──────┐  ┌──────┐    │
│  │60 UC │  │300 UC│    │  ← Package cards
│  │Rp15k │  │Rp65k │    │     (grid 2 kolom)
│  └──────┘  └──────┘    │
└─────────────────────────┘
```

**Implementation:**

Replace the main content area in `app/top-up/[slug]/page.tsx` with:

```tsx
<div className="min-h-screen bg-[#070707]">
  {/* Mobile header */}
  <div className="relative bg-gradient-to-b from-[#1a1508] to-[#070707] px-5 pt-6 pb-8">
    <div className="flex items-center gap-3 mb-4">
      <Link href="/" className="text-white/50 hover:text-white transition">
        ←
      </Link>
      <h1 className="text-white font-bold text-lg">{game.name}</h1>
    </div>
    {/* Game icon */}
    <div className="flex justify-center mb-4">
      <Image
        src={game.icon_url}
        alt={game.name}
        width={80}
        height={80}
        className="rounded-2xl"
      />
    </div>
    <p className="text-white/50 text-sm text-center">{game.range_label}</p>
  </div>

  {/* Benefits */}
  <div className="px-5 py-6 space-y-3">
    <div className="flex items-center gap-3 text-white/60 text-sm">
      <span className="text-[#d4af6a]">✓</span> Proses otomatis 24 jam
    </div>
    <div className="flex items-center gap-3 text-white/60 text-sm">
      <span className="text-[#d4af6a]">✓</span> Bayar via QRIS, E-Wallet, VA
    </div>
    <div className="flex items-center gap-3 text-white/60 text-sm">
      <span className="text-[#d4af6a]">✓</span> Garansi uang kembali
    </div>
  </div>

  {/* Order Form */}
  <div className="px-5">
    <GameOrderForm
      game={game}
      qrisUrl={qrisUrl}
      whatsappNumber={whatsappNumber}
    />
  </div>
</div>
```

### 2. Update GameOrderForm package grid for mobile

In `components/sections/GameOrderForm.tsx`, change the nominal grid to be responsive:

```tsx
{/* Package grid - 2 cols mobile, 3 cols desktop */}
<div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
  {game.pricing.map((p) => (
    <button
      key={p.id}
      type="button"
      onClick={() => setSelectedNominal(p)}
      className={`p-4 rounded-xl border text-left transition ${
        selectedNominal?.id === p.id
          ? "border-[#d4af6a] bg-[#d4af6a]/10"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <span className="text-white font-semibold text-sm block">
        {p.nominal_label}
      </span>
      <span className="text-[#d4af6a] text-xs font-medium">
        Rp {p.price.toLocaleString("id-ID")}
      </span>
    </button>
  ))}
</div>
```

## After Implementation

1. Run `npm run build` to verify no TypeScript errors
2. Commit with message: `feat: mobile-first game detail layout with responsive grid`
