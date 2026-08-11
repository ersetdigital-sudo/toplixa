import { requireAdmin } from "../actions";
import { OrdersTable } from "./OrdersTable";

export default async function AdminOrdersPage() {
  const supabase = await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase.from("orders") as any)
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pesanan</h1>
          <p className="text-white/50 text-sm mt-1">Kelola semua transaksi top-up</p>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-xs">Total Pesanan</p>
          <p className="text-white font-semibold text-lg">{orders?.length ?? 0}</p>
        </div>
      </div>
      <OrdersTable initialOrders={orders ?? []} />
    </div>
  );
}
