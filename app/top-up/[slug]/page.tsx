import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { GameOrderForm } from "@/components/sections/GameOrderForm";
import { Breadcrumb, breadcrumbJsonLd } from "@/components/ui/Breadcrumb";
import { site } from "@/lib/site";
import { gameJsonLd } from "@/lib/json-ld";
import { getGameBySlug, getQrisUrl, getWhatsAppNumber } from "@/lib/db";
import type { DbGameWithNominals } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return { title: "Game tidak ditemukan" };

  return {
    title: `Top Up ${game.name} Murah & Instan`,
    description: `Top up ${game.range_label} ${game.name} secara instan di Toplixa. Proses otomatis 24 jam, tanpa login akun, pembayaran lengkap.`,
    openGraph: {
      title: `Top Up ${game.name} Murah & Instan | Toplixa`,
      description: `Top up ${game.range_label} ${game.name} secara instan di Toplixa. Proses otomatis 24 jam.`,
      url: `${site.url}/top-up/${slug}`,
      images: [{ url: site.ogImage, width: 1200, height: 624, alt: `Top Up ${game.name} di Toplixa` }],
    },
    alternates: {
      canonical: `/top-up/${slug}`,
    },
  };
}

export default async function TopUpPage({ params }: PageProps) {
  const { slug } = await params;
  const game: DbGameWithNominals | null = await getGameBySlug(slug);
  if (!game) notFound();

  const qrisUrl = await getQrisUrl();
  const whatsappNumber = await getWhatsAppNumber();

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Top Up", href: "/#games" },
    { label: game.name },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden">
        {/* ===== DESKTOP (lg+) ===== */}
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 hidden lg:block">
          <div className="glow" style={{ width: 420, height: 420, background: "#d4af6a", top: "10%", left: -140, opacity: 0.18 }} />
          <div className="relative max-w-5xl mx-auto px-5 grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start">
            <div>
              <Breadcrumb items={crumbs} className="mb-4" />
              <p className="text-[11px] tracking-[.25em] uppercase text-white/40">Top Up</p>
              <h1 className="mt-3 font-display h-sec font-semibold">
                {game.name}
                <br />
                <span className="gold-text">{game.range_label}</span>
              </h1>
              <p className="mt-5 text-white/50 text-sm font-light max-w-sm">
                Tidak perlu password atau kode OTP. Cukup {game.user_id_label}{!game.hide_server_id && game.server_id_required ? ` & ${game.server_id_label}` : ""}.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white/60">
                <li className="flex gap-3">
                  <span className="text-gold shrink-0">✓</span> Proses otomatis 24 jam nonstop
                </li>
                <li className="flex gap-3">
                  <span className="text-gold shrink-0">✓</span> QRIS, e-wallet, VA, dan minimarket
                </li>
                <li className="flex gap-3">
                  <span className="text-gold shrink-0">✓</span> Garansi uang kembali bila gagal
                </li>
              </ul>

              <div className="mt-8">
                <div className="logo-wrap !h-auto justify-start">
                  <Image
                    src={game.icon_url}
                    alt={`Logo ${game.name}`}
                    width={game.icon_width}
                    height={game.icon_height}
                    className="w-auto h-auto"
                    sizes="120px"
                  />
                </div>
              </div>
            </div>

            <GameOrderForm game={game} qrisUrl={qrisUrl} whatsappNumber={whatsappNumber} />
          </div>
        </section>

        {/* ===== MOBILE (< lg) — Hot Pot Product Detail style ===== */}
        <section className="lg:hidden overflow-x-hidden">
          {/* Hero: game icon with gradient overlay */}
          <div className="relative h-64 sm:h-72 bg-gradient-to-b from-[#1a1508] to-[#070707]">
            <div className="absolute inset-0 flex items-end justify-center pb-8">
              <Image
                src={game.icon_url}
                alt={game.name}
                width={140}
                height={140}
                className="w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-2xl"
                priority
              />
            </div>
            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0c0c0d] to-transparent" />
            {/* Back button — below header (h-16 = 64px) */}
            <div className="absolute top-20 left-4 right-4 flex items-center justify-between z-10">
              <Link
                href="/"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Link>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </div>

          {/* Content card — overlapping hero */}
          <div className="relative -mt-5 bg-[#0c0c0d] rounded-t-3xl px-4 sm:px-5 pt-5 pb-28 max-w-full">
            {/* Breadcrumb */}
            <Breadcrumb items={crumbs} className="mb-4" />

            {/* Title + Price */}
            <h1 className="text-white font-bold text-xl sm:text-2xl">{game.name}</h1>
            <p className="text-[#d4af6a] font-semibold text-base sm:text-lg mt-1">{game.range_label}</p>

            {/* Description */}
            <p className="text-white/50 text-sm mt-3 sm:mt-4 leading-relaxed">
              Tidak perlu password atau kode OTP. Cukup masukkan {game.user_id_label}{!game.hide_server_id && game.server_id_required ? ` & ${game.server_id_label}` : ""}, pilih nominal, dan bayar.
            </p>

            {/* Divider */}
            <div className="border-t border-white/5 my-4" />

            {/* Benefits */}
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <span className="text-[#d4af6a]">✓</span> Proses otomatis 24 jam nonstop
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <span className="text-[#d4af6a]">✓</span> QRIS, e-wallet, VA, minimarket
              </div>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <span className="text-[#d4af6a]">✓</span> Garansi uang kembali bila gagal
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5 my-4" />

            {/* Order Form */}
            <GameOrderForm game={game} qrisUrl={qrisUrl} whatsappNumber={whatsappNumber} />
          </div>
        </section>

        {/* CTA section — hidden on mobile */}
        <section className="sect border-t border-white/5 hidden lg:block">
          <div className="max-w-4xl mx-auto px-5 text-center relative">
            <div
              className="glow"
              style={{ width: 400, height: 400, background: "#d4af6a", top: -120, left: "50%", transform: "translateX(-50%)", opacity: 0.2 }}
            />
            <h2 className="relative font-display h-cta font-semibold leading-tight">
              Siap naik <span className="gold-text">rank</span> malam ini?
            </h2>
            <p className="relative mt-5 text-white/55 font-light">Top up sekarang, lanjut main tanpa jeda.</p>
            <Link
              href="/#games"
              className="relative inline-block mt-8 btn-gold font-semibold px-8 py-3.5 rounded-full transition"
            >
              Lihat Game Lain
            </Link>
          </div>
        </section>
      </main>
      {/* Footer hidden on mobile — detail page uses sticky CTA instead */}
      <div className="hidden lg:block">
        <Footer />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameJsonLd(game)) }}
      />
    </>
  );
}
