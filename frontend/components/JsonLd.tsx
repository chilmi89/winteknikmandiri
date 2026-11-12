import { site } from "@/lib/site";

export default function JsonLd() {
  const baseUrl = site.url.replace(/\/$/, "");

  // Schema 1: LocalBusiness & HVACBusiness Schema
  const hvacBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["HVACBusiness", "HomeAndConstructionBusiness", "LocalBusiness"],
    "@id": `${baseUrl}/#organization`,
    name: "CV Win Teknik Mandiri",
    alternateName: [
      "Service AC Kediri",
      "Jasa Service AC Kediri",
      "AC Kediri",
      "Service AC Panggilan Kediri",
      "Cuci AC Kediri",
      "Pasang AC Kediri",
      "Bongkar Pasang AC Kediri",
      "Isi Freon AC Kediri",
      "Tukang AC Kediri",
      "Teknisi AC Kediri",
      "Kontraktor AC Kediri",
      "Kontraktor HVAC Kediri",
      "Bengkel AC Kediri",
      "Service AC Terdekat Kediri",
      "Service AC Ngadiluwih",
      "Service AC Pare Kediri",
      "Service AC Mojoroto",
      "CV Win Teknik Mandiri HVAC",
    ],
    url: baseUrl,
    logo: `${baseUrl}/logo/logo_wtm.png`,
    image: `${baseUrl}/images/wtm-instalasi.jpg`,
    description:
      "Jasa service AC Kediri panggilan profesional & kontraktor AC komersial terpercaya. Melayani cuci AC rumah higienis, bongkar pasang AC standar vakum, isi freon murni, perbaikan kompresor, hingga instalasi VRF dan fabrikasi ducting di Kediri Raya bergaransi resmi tertulis 30 hari.",
    telephone: site.phoneDisplay,
    email: site.email,
    priceRange: "Rp 65.000 - Rp 50.000.000",
    currenciesAccepted: "IDR",
    paymentAccepted: "Cash, Transfer Bank, QRIS",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Dusun Selomanen, Desa Purwokerto",
      addressLocality: "Ngadiluwih",
      addressRegion: "Jawa Timur",
      postalCode: "64171",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -7.8924,
      longitude: 112.0152,
    },
    areaServed: [
      { "@type": "City", name: "Kediri" },
      { "@type": "AdministrativeArea", name: "Kota Kediri" },
      { "@type": "AdministrativeArea", name: "Kabupaten Kediri" },
      { "@type": "AdministrativeArea", name: "Kecamatan Ngadiluwih" },
      { "@type": "AdministrativeArea", name: "Kecamatan Mojoroto" },
      { "@type": "AdministrativeArea", name: "Kecamatan Kota Kediri" },
      { "@type": "AdministrativeArea", name: "Kecamatan Pesantren" },
      { "@type": "AdministrativeArea", name: "Kecamatan Pare" },
      { "@type": "AdministrativeArea", name: "Kecamatan Kras" },
      { "@type": "AdministrativeArea", name: "Kecamatan Kandat" },
      { "@type": "AdministrativeArea", name: "Kecamatan Wates" },
      { "@type": "AdministrativeArea", name: "Kecamatan Gurah" },
      { "@type": "AdministrativeArea", name: "Kecamatan Plosoklaten" },
      { "@type": "AdministrativeArea", name: "Kecamatan Mojo" },
      { "@type": "AdministrativeArea", name: "Kecamatan Semen" },
      { "@type": "AdministrativeArea", name: "Kecamatan Banyakan" },
      { "@type": "AdministrativeArea", name: "Kecamatan Gampengrejo" },
      { "@type": "AdministrativeArea", name: "Kecamatan Papar" },
      { "@type": "AdministrativeArea", name: "Kecamatan Plemahan" },
      { "@type": "AdministrativeArea", name: "Kecamatan Ringinrejo" },
      { "@type": "AdministrativeArea", name: "Jawa Timur" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "08:00",
        closes: "16:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "08:00",
        closes: "12:00",
      },
    ],
    sameAs: site.socials.map((s) => s.href),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Layanan Service AC & Kontraktor HVAC Kediri",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Service AC Rumah & Cuci AC Higienis Kediri",
            description:
              "Jasa cuci AC rumah split, deep cleaning desinfektan, bebas becek, cek freon gratis, garansi 7-30 hari.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Pemasangan AC Rumah & Standar SOP Vakum Mesin",
            description:
              "Jasa pemasangan AC baru & second di Kediri dengan mesin vakum minimal 20 menit pipa tembaga tebal bergaransi 30 hari.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Isi & Tambah Freon AC Murni R32, R410A, R22 Kediri",
            description:
              "Pengisian freon murni tanpa campuran plus uji kebocoran pipa instalasi manifold digital.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Perbaikan AC Rusak, Bocor Air & Modul PCB Inverter",
            description:
              "Troubleshooting kompresor macet, ganti kapasitor, perbaikan sensor, modul PCB inverter, dan mengatasi AC bocor air.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Kontraktor AC Komersial & Instalasi VRF/VRV Gedung",
            description:
              "Solusi tata udara gedung perkantoran, perhotelan, mall, dan sekolah dengan sistem VRF/VRV hemat energi di Jawa Timur.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Fabrikasi Ducting BJLS & Perawatan AC Central",
            description:
              "Fabrikasi dan instalasi ducting pendingin udara BJLS dan polyurethane berstandar teknis insulasi rapi.",
          },
        },
      ],
    },
  };

  // Schema 2: FAQPage Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Area mana saja di Kediri yang dilayani teknisi service AC panggilan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kami melayani panggilan service AC ke seluruh wilayah Kota dan Kabupaten Kediri, termasuk Ngadiluwih, Mojoroto, Pesantren, Pare, Kras, Kandat, Wates, Gurah, Mojo, Banyakan, Gampengrejo, Papar, dan sekitarnya, serta proyek HVAC di seluruh Jawa Timur.",
        },
      },
      {
        "@type": "Question",
        name: "Berapa biaya jasa service dan cuci AC di Kediri?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Biaya cuci AC split mulai dari Rp 65.000 hingga Rp 75.000 per unit tergantung kapasitas PK. Tersedia paket cuci chemical, tambah freon, dan paket hemat kontrak berkala instansi dengan rincian biaya transparan.",
        },
      },
      {
        "@type": "Question",
        name: "Berapa lama jaminan garansi pengerjaan service AC?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Seluruh pengerjaan instalasi baru, perbaikan komponen, dan pengisian freon dilindungi garansi resmi tertulis 30 hari dari CV Win Teknik Mandiri.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah setiap pemasangan AC baru wajib melalui proses vakum?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pasti. Seluruh pemasangan unit AC baru maupun bekas di CV Win Teknik Mandiri wajib mengikuti SOP vakum mesin 2-stage minimal 15–20 menit untuk membuang uap air dan udara non-kondensabel agar kompresor awet dan dingin maksimal.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah melayani kontrak perawatan AC untuk kantor, sekolah, dan gedung komersial?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ya. Sebagai kontraktor AC dan badan usaha resmi terdaftar Kemenkumham RI, kami menyediakan layanan kontrak pemeliharaan AC berkala (MoU), faktur pajak PPN/PPh, dan kelengkapan administrasi LPSE / B2B.",
        },
      },
    ],
  };

  // Schema 3: WebSite with Sitelinks Search
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "CV Win Teknik Mandiri",
    description: "Jasa Service AC Kediri & Kontraktor AC Komersial Terpercaya No. 1",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    inLanguage: "id-ID",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hvacBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema),
        }}
      />
    </>
  );
}
