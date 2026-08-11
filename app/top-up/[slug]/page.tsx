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
            <GameOrderForm game={game} qrisUrl={qrisUrl} whatsappNumber={whatsappNumber} />
          </div>
        </div>

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
