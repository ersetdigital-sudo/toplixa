import { site } from "./site";
import type { DbGameWithNominals } from "./db";

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      description: site.description,
      logo: `${site.url}/icon.svg`,
      sameAs: [
        "https://www.instagram.com/toplixa",
        "https://wa.me/6281234567890",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["Indonesian"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: "id-ID",
      publisher: { "@id": `${site.url}/#organization` },
    },
  ],
};

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Apakah perlu login akun game?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tidak. Kami hanya butuh User ID dan Server ID. Jangan pernah memberikan password atau OTP ke siapa pun.",
      },
    },
    {
      "@type": "Question",
      name: "Berapa lama item masuk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Umumnya di bawah 10 detik setelah pembayaran terkonfirmasi. Saat maintenance server game, proses bisa tertunda hingga beberapa menit.",
      },
    },
    {
      "@type": "Question",
      name: "Kalau transaksi gagal bagaimana?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dana dikembalikan 100% ke metode pembayaran asal, atau disimpan sebagai saldo Toplixa sesuai pilihanmu.",
      },
    },
    {
      "@type": "Question",
      name: "Bisa request game lain?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bisa. Kirim nama game lewat form pesanan atau kontak CS, dan kami tambahkan bila tersedia distributor resminya.",
      },
    },
    {
      "@type": "Question",
      name: "Metode pembayaran apa saja yang diterima?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Kami menerima QRIS (semua e-wallet dan m-banking), Virtual Account (BCA, Mandiri, BRI, BNI), dan pembayaran di minimarket (Alfamart, Indomaret).",
      },
    },
    {
      "@type": "Question",
      name: "Apakah ada garansi uang kembali?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ya. Jika transaksi gagal karena kesalahan sistem kami, dana akan dikembalikan 100% ke metode pembayaran asal atau disimpan sebagai saldo Toplixa.",
      },
    },
  ],
};

export function gameJsonLd(game: DbGameWithNominals) {
  const lowestPrice = game.nominals?.length
    ? Math.min(...game.nominals.map((n) => n.price))
    : 0;
  const highestPrice = game.nominals?.length
    ? Math.max(...game.nominals.map((n) => n.price))
    : 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Top Up ${game.name}`,
    description: `Top up ${game.range_label} ${game.name} secara instan di Toplixa. Proses otomatis 24 jam, tanpa login akun, pembayaran lengkap.`,
    image: game.icon_url,
    brand: {
      "@type": "Brand",
      name: "Toplixa",
    },
    offers: {
      "@type": "AggregateOffer",
      url: `${site.url}/top-up/${game.slug}`,
      priceCurrency: "IDR",
      lowPrice: String(lowestPrice),
      highPrice: String(highestPrice),
      offerCount: String(game.nominals?.length ?? 0),
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1200000",
      bestRating: "5",
      worstRating: "1",
    },
  };
}
