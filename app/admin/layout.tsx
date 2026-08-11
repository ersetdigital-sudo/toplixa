"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/ui/LogoMark";
import { createSupabaseClient } from "@/lib/supabase";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { href: "/admin/games", label: "Kelola Harga", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { href: "/admin/qris", label: "Kelola QRIS", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><path d="M21 14h-4v4"/></svg> },
  { href: "/admin/settings", label: "Pengaturan", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    const supabase = createSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, [isLogin]);

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Desktop sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/[0.04] bg-panel hidden lg:flex flex-col">
        <div className="px-4 py-4 border-b border-white/[0.04]">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="w-6 h-6 shrink-0" />
            <span className="font-display font-semibold text-sm tracking-tight text-white/90">Toplixa</span>
          </Link>
          <p className="text-[10px] text-white/25 mt-1 uppercase tracking-[.15em]">Admin Panel</p>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition ${
                pathname === item.href
                  ? "text-white bg-white/[0.05]"
                  : "text-white/45 hover:text-white/80 hover:bg-white/[0.03]"
              }`}
            >
              <span className="text-white/30">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-white/[0.04] space-y-3">
          {email && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-[11px] font-semibold text-white/50 shrink-0">
                {email.charAt(0).toUpperCase()}
              </div>
              <p className="text-xs text-white/40 truncate">{email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-red-400/80 transition w-full"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="w-6 h-6 shrink-0" />
            <span className="font-display font-semibold text-sm tracking-tight text-white/90">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            {email && (
              <span className="text-[11px] text-white/30 truncate max-w-[120px]">{email}</span>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.05] transition"
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              )}
            </button>
          </div>
        </header>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <nav className="lg:hidden border-b border-white/[0.04] bg-panel px-2 py-2 space-y-0.5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition ${
                  pathname === item.href
                    ? "text-white bg-white/[0.05]"
                    : "text-white/45 hover:text-white/80 hover:bg-white/[0.03]"
                }`}
              >
                <span className="text-white/30">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div className="px-3 pt-2 border-t border-white/[0.04] mt-1 space-y-2">
              {email && (
                <div className="flex items-center gap-2 px-1">
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-semibold text-white/50 shrink-0">
                    {email.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-[11px] text-white/35 truncate">{email}</p>
                </div>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs text-white/30 hover:text-red-400/80 transition w-full px-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Keluar
              </button>
            </div>
          </nav>
        )}

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
