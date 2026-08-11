"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { drawDemoQR } from "@/lib/qr";
import { rupiah } from "@/lib/format";
import { buildWhatsAppUrl, buildOrderMessage } from "@/lib/whatsapp";

export interface CheckoutOrder {
  game: string;
  userId: string;
  serverId: string;
  nominalLabel: string;
  price: number;
  total: number;
  orderId: string;
  qrisUrl?: string;
}

interface CheckoutOverlayProps {
  order: CheckoutOrder;
  onClose: () => void;
  whatsappNumber: string;
}

type Step = "pay" | "done" | "expired";

const DURATION = 300;
const RING_C = 119.4;

export function CheckoutOverlay({ order, onClose, whatsappNumber }: CheckoutOverlayProps) {
  const [step, setStep] = useState<Step>("pay");
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [deliverMsg, setDeliverMsg] = useState("Mengirim item… estimasi < 10 detik");
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; color: string }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const expire = useCallback(() => {
    setStep("expired");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawDemoQR(canvas, order.orderId);
  }, [order.orderId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          expire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expire]);

  useEffect(() => {
    if (step !== "pay") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step, onClose]);

  useEffect(() => {
    if (step === "pay") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [step]);

  const handlePaid = () => {
    setStep("done");
    setDeliverMsg("Mengirim item… estimasi < 10 detik");
    const colors = ["#d4af6a", "#f4e3bd", "#34d399", "#ffffff"];
    const pieces = Array.from({ length: 26 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      color: colors[i % colors.length],
    }));
    setConfetti(pieces);
    window.setTimeout(() => setConfetti([]), 3400);
    window.setTimeout(() => setDeliverMsg("Item sedang diproses. Cek game dalam beberapa detik."), 3200);
  };

  const handleRetry = () => {
    setStep("pay");
    setSecondsLeft(DURATION);
  };

  const ringOffset = RING_C * (1 - secondsLeft / DURATION);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const low = secondsLeft <= 30;

  return (
    <div
      id="pay"
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label="Pembayaran Toplixa"
      style={{ display: step === "done" || step === "expired" ? undefined : "block" }}
    >
      <div className="absolute inset-0 bg-[rgba(3,3,4,.82)] backdrop-blur-[14px]" onClick={onClose} />
      <div className="relative max-w-[440px] mx-auto h-full overflow-y-auto py-6 px-4 flex items-start sm:items-center">
        <div className="pay-card" style={{ borderRadius: 26 }}>
          {step === "pay" && (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] tracking-[.25em] uppercase text-white/40">Pembayaran</p>
                  <h3 className="font-display text-xl font-semibold mt-1">Scan QRIS</h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup"
                  className="w-9 h-9 rounded-full hairline text-white/50 hover:text-white hover:border-white/25 transition text-lg leading-none"
                >
                  ×
                </button>
              </div>

              <div className="mt-5 flex items-center gap-3 hairline rounded-2xl px-4 py-3 bg-[#0f0f11]">
                <svg className="timer-ring" viewBox="0 0 44 44" aria-hidden="true">
                  <circle cx="22" cy="22" r="19" stroke="rgba(255,255,255,.09)" />
                  <circle
                    cx="22"
                    cy="22"
                    r="19"
                    stroke={low ? "#f87171" : "#d4af6a"}
                    strokeDasharray={String(RING_C)}
                    strokeDashoffset={String(ringOffset)}
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-[11px] text-white/40 uppercase tracking-[.15em]">Bayar dalam</p>
                  <p className={`font-display text-xl font-semibold ${low ? "text-red-400" : "gold-text"}`}>
                    {mm}:{ss}
                  </p>
                </div>
                <span className="flex items-center gap-2 text-[11px] text-emerald-300/80">
                  <span className="pulse-dot" /> Menunggu
                </span>
              </div>

              <div className="mt-5 relative" style={{ background: "#fff", borderRadius: 18, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div className="flex items-center gap-2 self-start">
                  <span className="font-display text-[13px] font-bold tracking-tight text-[#0b0b0c]">QRIS</span>
                  <span className="text-[9px] text-[#0b0b0c]/50 uppercase tracking-[.18em]">Toplixa</span>
                </div>
                {order.qrisUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={order.qrisUrl}
                    alt="QRIS Toplixa"
                    width={190}
                    height={190}
                    style={{ width: "min(58vw, 190px)", height: "auto", borderRadius: 6, objectFit: "contain" }}
                  />
                ) : (
                  <canvas ref={canvasRef} width={180} height={180} style={{ width: "min(58vw, 190px)", height: "min(58vw, 190px)", imageRendering: "pixelated", borderRadius: 6 }} />
                )}
                <p className="text-[10px] text-[#0b0b0c]/55 pb-1">Satu QR untuk semua e-wallet &amp; m-banking</p>
              </div>

              <div className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Game</span>
                  <span className="text-white/85">{order.game}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">User ID</span>
                  <span className="text-white/85">{order.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Server ID</span>
                  <span className="text-white/85">{order.serverId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Paket</span>
                  <span className="text-white/85">
                    {order.nominalLabel} · {rupiah(order.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Order ID</span>
                  <span className="text-white/60 text-xs font-mono">{order.orderId}</span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                  <span className="text-white/40">Total</span>
                  <span className="font-display text-xl font-semibold gold-text">{rupiah(order.total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const message = buildOrderMessage({
                    gameName: order.game,
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
                className="w-full bg-[#d4af6a] text-black font-semibold py-3.5 rounded-xl hover:bg-[#e7cf9c] transition"
              >
                Konfirmasi Pembayaran
              </button>
              <button type="button" onClick={onClose} className="w-full text-xs text-white/35 hover:text-white/70 transition mt-3">
                Batalkan pesanan
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="relative overflow-hidden text-center py-2">
              {confetti.map((c) => (
                <span
                  key={c.id}
                  className="conf"
                  style={{ left: `${c.left}%`, background: c.color, animationDelay: `${c.delay}s` }}
                />
              ))}
              <div
                className="check-pop mx-auto w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "radial-gradient(circle at 50% 35%,rgba(52,211,153,.22),rgba(52,211,153,.05))", border: "1px solid rgba(52,211,153,.35)" }}
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-semibold mt-6">Pembayaran berhasil</h3>
              <p className="text-white/50 text-sm font-light mt-2">Terima kasih! Item sedang dikirim ke akunmu.</p>

              <div className="mt-6 hairline rounded-2xl p-4 text-left space-y-2.5 text-sm bg-[#0f0f11]">
                <div className="flex justify-between">
                  <span className="text-white/40">Order ID</span>
                  <span className="text-white/70 text-xs font-mono">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Game</span>
                  <span className="text-white/85">{order.game}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">User ID</span>
                  <span className="text-white/85">{order.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Paket</span>
                  <span className="text-white/85">{order.nominalLabel}</span>
                </div>
                <div className="border-t border-white/5 pt-2.5 flex justify-between">
                  <span className="text-white/40">Dibayar</span>
                  <span className="gold-text font-display font-semibold">{rupiah(order.total)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-emerald-300/80">
                <span className="pulse-dot" /> {deliverMsg}
              </div>

              <button type="button" onClick={onClose} className="btn-gold w-full font-semibold py-3.5 rounded-xl mt-6 transition">
                Selesai
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.hash = "#topup";
                }}
                className="w-full text-xs text-white/35 hover:text-white/70 transition mt-3"
              >
                Top up lagi
              </button>
            </div>
          )}

          {step === "expired" && (
            <div className="text-center py-2">
              <div
                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
                style={{ border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.03)" }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9a9a9f" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-semibold mt-6">Waktu habis</h3>
              <p className="text-white/50 text-sm font-light mt-2">QRIS sudah kedaluwarsa. Buat pesanan baru untuk melanjutkan.</p>
              <button type="button" onClick={handleRetry} className="btn-gold w-full font-semibold py-3.5 rounded-xl mt-6 transition">
                Buat QRIS Baru
              </button>
              <button type="button" onClick={onClose} className="w-full text-xs text-white/35 hover:text-white/70 transition mt-3">
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
