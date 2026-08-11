export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  return "62" + digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}

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
