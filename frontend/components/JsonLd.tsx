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
      "Jasa AC Kediri",
      "AC Kediri",
      "Kontraktor AC Kediri",
      "Jasa AC Rumah Kediri",
      "AC Komersial Kediri",
      "CV Win Teknik Mandiri HVAC",
    ],
    url: baseUrl,
    logo: `${baseUrl}/logo/logo_wtm.png`,
    image: `${baseUrl}/images/wtm-instalasi.jpg`,
    description:
      "Jasa service AC Kediri profesional & kontraktor AC komersial. Melayani cuci AC rumah higienis, bongkar pasang AC, isi freon, perbaikan kompresor, hingga instalasi VRF dan fabrikasi ducting di Kediri Raya bergaransi resmi.",
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
      { "@type": "AdministrativeArea", name: "Ngadiluwih" },
      { "@type": "AdministrativeArea", name: "Pare" },
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
              "Jasa cuci AC rumah split, deep cleaning desinfektan, bebas becek, cek freon gratis, garansi 7 hari.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Pemasangan AC Rumah & Standar SOP Vakum",
            description:
              "Jasa pemasangan AC baru & second di Kediri dengan mesin vakum pipa tembaga tebal bergaransi 30 hari.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Kontraktor AC Komersial & Instalasi VRF/VRV",
            description:
              "Solusi tata udara gedung perkantoran, perhotelan, mall, dan sekolah dengan sistem VRF/VRV hemat energi.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Fabrikasi Ducting BJLS & Perawatan AC Central",
            description:
              "Fabrikasi dan instalasi ducting pendingin udara BJLS dan polyurethane berstandar teknis.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Isi & Tambah Freon AC Murni Kediri",
            description:
              "Pengisian freon murni R32, R410A, dan R22 plus uji kebocoran pipa instalasi.",
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
        name: "Area mana saja yang dilayani oleh CV Win Teknik Mandiri?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kami melayani seluruh wilayah Kota dan Kabupaten Kediri, termasuk Ngadiluwih, Kras, Kandat, Pare, Wates, Gurah, Mojo, dan sekitarnya, serta siap menangani proyek komersial dan industri di Jawa Timur.",
        },
      },
      {
        "@type": "Question",
        name: "Berapa lama jaminan garansi pengerjaan service AC?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Seluruh pengerjaan instalasi dan reparasi dilindungi garansi tertulis 30 hari resmi CV Win Teknik Mandiri.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah melayani kontraktor AC komersial, gedung, dan sekolah?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ya. Kami berpengalaman sebagai kontraktor AC komersial menangani pengadaan unit, pemasangan AC VRF/VRV, fabrikasi ducting BJLS, hingga kontrak maintenance gedung komersial.",
        },
      },
      {
        "@type": "Question",
        name: "Apakah setiap pemasangan AC baru sudah termasuk proses vakum?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pasti. Seluruh pemasangan unit AC baru maupun bekas wajib mengikuti SOP vakum mesin minimal 15–20 menit untuk menjaga pipa bersih dari uap air dan menjaga kompresor awet.",
        },
      },
    ],
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
    </>
  );
}
