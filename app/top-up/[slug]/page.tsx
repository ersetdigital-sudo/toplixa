import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { GameOrderForm } from "@/components/sections/GameOrderForm";
import { Breadcrumb, breadcrumbJsonLd } from "@/components/ui/Breadcrumb";
import { site } from "@/lib/site";
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
      <main className="flex-1">
        <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
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

              <div className="mt-8 hidden lg:block">
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

        <section className="sect border-t border-white/5">
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
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
    </>
  );
}
