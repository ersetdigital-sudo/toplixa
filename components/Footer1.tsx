"use client";

import Link from "next/link";
import { LogoMark } from "@/components/ui/LogoMark";
import {
  FaInstagram,
  FaWhatsapp,
  FaTiktok,
} from "react-icons/fa6";

const FOOTER_NAV = [
  { label: "Katalog Game", href: "#games" },
  { label: "Cara Order", href: "#cara" },
  { label: "FAQ", href: "#faq" },
];

const FOOTER_INFO = [
  { label: "Syarat & Ketentuan", href: "/terms" },
  { label: "Kebijakan Privasi", href: "/privacy" },
  { label: "Hubungi Kami", href: "mailto:hello@toplixa.com" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/toplixa",
    Icon: FaInstagram,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/6281234567890",
    Icon: FaWhatsapp,
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@toplixa",
    Icon: FaTiktok,
  },
];

export function Footer1() {
  return (
    <footer className="border-t border-white/5 mt-24 py-14 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <LogoMark className="w-7 h-7 shrink-0" />
              <span className="text-white font-semibold text-sm tracking-tight">
                Toplixa
              </span>
            </div>
            <p className="text-white/40 text-xs leading-relaxed max-w-[200px]">
              Top up game instan, aman & murah. Proses otomatis 24 jam.
            </p>
          </div>

          <div>
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-4">
              Navigasi
            </p>
            <ul className="space-y-2.5">
              {FOOTER_NAV.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-white/50 hover:text-[#d4af6a] text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-4">
              Informasi
            </p>
            <ul className="space-y-2.5">
              {FOOTER_INFO.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-white/50 hover:text-[#d4af6a] text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-4">
              Ikuti Kami
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-white/50 hover:bg-[#d4af6a]/10 hover:text-[#d4af6a] transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-white/30 text-[11px] leading-relaxed">
            © {new Date().getFullYear()} Toplixa. Seluruh merek dagang game
            adalah milik pemiliknya masing-masing.
          </p>
          <p className="text-white/20 text-[11px]">
            Dibuat dengan ❤️ di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
