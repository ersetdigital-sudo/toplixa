"use client";

import { useState } from "react";
import { updateOrderStatus } from "../actions";
import { showToast } from "@/components/ui/Toast";

interface Order {
  id: string;
  order_id: string;
  game_name: string;
  game_slug: string;
  user_id: string;
  server_id: string;
  nominal_label: string;
  price: number;
  unique_code: number;
  total: number;
  status: "pending" | "confirmed" | "failed";
  whatsapp_sent: boolean;
  created_at: string;
}

type StatusFilter = "all" | "pending" | "confirmed" | "failed";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  confirmed: { label: "Confirmed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  failed: { label: "Failed", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch = search === "" ||
      o.order_id.toLowerCase().includes(search.toLowerCase()) ||
      o.user_id.includes(search) ||
      o.game_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    failed: orders.filter((o) => o.status === "failed").length,
  };

  async function handleStatusChange(orderId: string, newStatus: "pending" | "confirmed" | "failed") {
    setUpdating(orderId);
    const result = await updateOrderStatus(orderId, newStatus);
    setUpdating(null);

    if (result.success) {
      setOrders((prev) => prev.map((o) => o.order_id === orderId ? { ...o, status: newStatus } : o));
      showToast("success", `Status diubah ke ${STATUS_CONFIG[newStatus].label}`);
    } else {
      showToast("error", result.error || "Gagal mengubah status");
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          {(["all", "pending", "confirmed", "failed"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter === s
                  ? "bg-[#d4af6a] text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {s === "all" ? "Semua" : STATUS_CONFIG[s].label} ({counts[s]})
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Cari Order ID, User ID, atau Game..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#d4af6a]/50 transition sm:w-72"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Order ID</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Game</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">User ID</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Paket</th>
                <th className="text-right px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Total</th>
                <th className="text-center px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Waktu</th>
                <th className="text-center px-4 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-white/30">
                    {search ? "Tidak ada pesanan yang cocok" : "Belum ada pesanan"}
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 font-mono text-xs text-white/70">{order.order_id}</td>
                    <td className="px-4 py-3 text-white/85">{order.game_name}</td>
                    <td className="px-4 py-3 text-white/60 hidden sm:table-cell">{order.user_id}</td>
                    <td className="px-4 py-3 text-white/60 hidden md:table-cell">{order.nominal_label}</td>
                    <td className="px-4 py-3 text-right text-white/85 font-medium">{formatRupiah(order.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_CONFIG[order.status].color}`}>
                        {STATUS_CONFIG[order.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs hidden lg:table-cell">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.order_id, e.target.value as "pending" | "confirmed" | "failed")}
                        disabled={updating === order.order_id}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white cursor-pointer focus:outline-none focus:border-[#d4af6a]/50 transition disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
