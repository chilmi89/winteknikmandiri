export type ServiceDetailItem = {
  id: string;
  number: string;
  shortName: string;
  category: string;
  title: string;
  pricePrefix: string;
  price: string | null;
  unit: string;
  priceNote?: string;
  image: string;
  imageAlt: string;
  summary: string;
  highlights: string[];
  points: string[];
  recommendation: string;
  waMessage: string;
};

export const serviceDetails: ServiceDetailItem[] = [
  {
    id: "cuci-ac",
    number: "01",
    shortName: "Cuci AC",
    category: "Perawatan Rutin",
    title: "Cuci AC & Deep Cleaning Higienis",
    pricePrefix: "Mulai dari",
    price: "Rp 65.000",
    unit: "/ unit",
    priceNote: "1,5–2 PK Rp 85.000 · cassette / floor standing menyesuaikan.",
    image: "/images/ac-split-clean.jpg",
    imageAlt: "Unit AC split yang dibersihkan dengan jet cleaner",
    summary: "Bersih menyeluruh, bebas becek, garansi 7 hari.",
    highlights: ["Tanpa becek", "Cek freon gratis", "Garansi 7 hari"],
    points: [
      "Penutup anti-bocor melindungi dinding dan perabotan.",
      "Penyemprotan evaporator dengan tekanan terkontrol.",
      "Pembersihan filter, talang, dan selang drainase.",
      "Cek suhu hembusan dengan termometer digital.",
    ],
    recommendation: "Rutin setiap 2–3 bulan agar pendinginan tetap efisien.",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya ingin memesan layanan Cuci AC & Deep Cleaning.",
  },
  {
    id: "pemasangan-ac",
    number: "02",
    shortName: "Instalasi",
    category: "Instalasi",
    title: "Pemasangan AC Baru & Bekas (Standar Vakum)",
    pricePrefix: "Mulai dari",
    price: "Rp 250.000",
    unit: "/ unit",
    priceNote: "1,5–2 PK Rp 350.000 · cassette / floor standing Rp 500.000.",
    image: "/images/ac-split-indoor.jpg",
    imageAlt: "Teknisi memasang unit AC split indoor di dinding",
    summary: "Instalasi rapi dengan vakum dan flaring presisi.",
    highlights: ["SOP vakum", "Pipa tembaga tebal", "Garansi 30 hari"],
    points: [
      "Posisi indoor dan outdoor dihitung agar sirkulasi bebas.",
      "Bracket waterpass dan flaring presisi tanpa retak.",
      "Vakum 15–20 menit untuk menguras uap air.",
      "Uji kebocoran, arus, dan tekanan freon sesuai pabrikan.",
    ],
    recommendation: "Garansi pemasangan dan bebas bocor pipa 30 hari.",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya ingin memesan layanan Pemasangan AC baru/second.",
  },
  {
    id: "bongkar-pasang",
    number: "03",
    shortName: "Relokasi",
    category: "Bongkar Pasang",
    title: "Bongkar Pasang & Relokasi Unit AC",
    pricePrefix: "Mulai dari",
    price: "Rp 330.000",
    unit: "/ unit",
    priceNote: "Bongkar saja tanpa pasang Rp 150.000.",
    image: "/images/wtm-pemasangan.jpg",
    imageAlt: "Pemasangan ulang unit AC split di lokasi baru",
    summary: "Pindahan AC aman dengan teknik simpan freon.",
    highlights: ["Simpan freon", "Pasang ulang", "Uji performa"],
    points: [
      "Pump-down agar freon tersimpan di kompresor.",
      "Pelepasan kabel, nepel, dan bracket tanpa merusak dinding.",
      "Pemasangan ulang dengan jalur rapi dan vakum ulang.",
      "Uji pendinginan sampai suhu target tercapai.",
    ],
    recommendation: "Freon lama tetap dipakai selama pipa masih layak.",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya ingin memesan layanan Bongkar Pasang / Relokasi AC.",
  },
  {
    id: "perbaikan-kerusakan",
    number: "04",
    shortName: "Perbaikan",
    category: "Reparasi",
    title: "Perbaikan AC & Penggantian Sparepart Asli",
    pricePrefix: "Biaya cek",
    price: "Rp 75.000",
    unit: "/ kunjungan",
    priceNote: "Gratis bila lanjut perbaikan.",
    image: "/images/ac-technician.jpg",
    imageAlt: "Teknisi memeriksa kelistrikan dan komponen unit AC",
    summary: "Diagnosa transparan, sparepart asli, garansi 30 hari.",
    highlights: ["Diagnosa transparan", "Sparepart original", "Garansi 30 hari"],
    points: [
      "Atasi bocor air dari jalur kondensasi mampet.",
      "Ganti kapasitor, thermistor, PCB, dan dinamo kipas.",
      "Las titik bocor pipa tembaga freon.",
      "Diagnosa ditunjukkan dengan multimeter dan manifold.",
    ],
    recommendation: "Sparepart pengganti bergaransi 30 hari.",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya butuh layanan perbaikan AC rusak / tidak dingin.",
  },
  {
    id: "tambah-freon",
    number: "05",
    shortName: "Freon",
    category: "Refrigeran",
    title: "Pengisian & Tambah Freon (R32 / R410A / R22)",
    pricePrefix: "Mulai dari",
    price: "Rp 150.000",
    unit: "/ unit",
    priceNote: "R22 Rp 125.000 · pengisian setelah titik bocor diperbaiki.",
    image: "/images/ac-unit-2.jpg",
    imageAlt: "Unit AC outdoor yang dicek tekanan freonnya",
    summary: "Freon murni R32/R410A plus uji kebocoran.",
    highlights: ["Freon murni", "Uji kebocoran", "Tekanan optimal"],
    points: [
      "Cek tekanan dengan manifold gauge digital.",
      "Deteksi dan tambal kebocoran sebelum pengisian.",
      "Freon R32/R410A murni sesuai takaran pabrikan.",
      "Cek suhu dan arus kompresor setelah pengisian.",
    ],
    recommendation: "Cek tekanan gratis setiap kali cuci AC.",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya ingin memesan layanan Tambah Freon AC.",
  },
  {
    id: "kontrak-komersial",
    number: "06",
    shortName: "Kontrak",
    category: "Maintenance",
    title: "Kontrak Maintenance Perusahaan & Gedung",
    pricePrefix: "Penawaran khusus",
    price: null,
    unit: "perusahaan / gedung",
    priceNote: "Termasuk invoice, faktur resmi, dan laporan teknis.",
    image: "/images/ac-hvac.jpg",
    imageAlt: "Unit AC cassette dan ducting di ruang komersial",
    summary: "Jadwal berkala, laporan teknis, invoice resmi.",
    highlights: ["Jadwal berkala", "Laporan teknis", "Invoice resmi"],
    points: [
      "Kunjungan berkala per bulan atau triwulan.",
      "Laporan teknis tiap unit untuk dokumentasi gedung.",
      "Prioritas respon darurat di jam kerja.",
      "Split, cassette, floor standing, dan ducting.",
    ],
    recommendation: "Survei lokasi dan penawaran sesuai jumlah unit.",
    waMessage:
      "Halo CV Win Teknik Mandiri, saya ingin konsultasi kontrak maintenance perusahaan/gedung.",
  },
];
