export type PricingRow = {
  name: string;
  detail: string;
  unit: string;
  price: string | null;
};

export type PricingGroup = {
  title: string;
  rows: PricingRow[];
};

/**
 * Sumber tunggal tarif yang tampil di tabel harga halaman beranda.
 * `price: null` berarti harga menyesuaikan pekerjaan (penawaran resmi).
 */
export const pricingGroups: PricingGroup[] = [
  {
    title: "Perawatan & Cuci AC",
    rows: [
      {
        name: "Cuci AC Split 0,5 – 1 PK",
        detail:
          "Jet cleaner, penutup anti-bocor, pembersihan filter dan talang, cek freon gratis.",
        unit: "unit",
        price: "Rp 65.000",
      },
      {
        name: "Cuci AC Split 1,5 – 2 PK",
        detail:
          "Unit kapasitas besar, durasi 45–60 menit, termasuk pembersihan outdoor.",
        unit: "unit",
        price: "Rp 85.000",
      },
      {
        name: "Cuci AC Cassette",
        detail:
          "Pembersihan evaporator empat arah hembusan dan jalur kondensat.",
        unit: "unit",
        price: "Rp 150.000",
      },
      {
        name: "Cuci AC Floor Standing",
        detail:
          "Pembersihan evaporator, filter, blower, dan panel depan unit berdiri.",
        unit: "unit",
        price: "Rp 175.000",
      },
      {
        name: "Deep cleaning / cuci kimia",
        detail:
          "Untuk unit berjamur, berbau, atau lama tidak diservis. Termasuk desinfektan.",
        unit: "unit",
        price: "Rp 125.000",
      },
      {
        name: "Paket cuci + isi freon",
        detail:
          "Hemat untuk unit yang sudah kurang dingin. Freon R32/R410A sesuai takaran.",
        unit: "unit",
        price: "Rp 195.000",
      },
    ],
  },
  {
    title: "Instalasi, Bongkar & Relokasi",
    rows: [
      {
        name: "Pasang AC baru 0,5 – 1 PK",
        detail:
          "Bracket indoor, vakum 15–20 menit, flaring presisi, uji kebocoran.",
        unit: "unit",
        price: "Rp 250.000",
      },
      {
        name: "Pasang AC baru 1,5 – 2 PK",
        detail:
          "Termasuk pipa standar 3 meter, kabel, dan pengecekan tekanan freon.",
        unit: "unit",
        price: "Rp 350.000",
      },
      {
        name: "Pasang AC Cassette / Floor Standing",
        detail:
          "Penentuan titik gantung, bracket, dan jalur pembuangan sesuai tipe unit.",
        unit: "unit",
        price: "Rp 500.000",
      },
      {
        name: "Bongkar pasang & relokasi",
        detail:
          "Teknik pump-down, freon tersimpan di outdoor, pemasangan ulang plus vakum.",
        unit: "unit",
        price: "Rp 330.000",
      },
      {
        name: "Bongkar saja (tanpa pasang)",
        detail:
          "Pelepasan unit, pipa, dan bracket secara rapi tanpa merusak dinding.",
        unit: "unit",
        price: "Rp 150.000",
      },
      {
        name: "Jalur pipa tambahan",
        detail:
          "Pipa tembaga tebal, isolasi, dan kabel kelistrikan per meter.",
        unit: "meter",
        price: "Rp 75.000",
      },
      {
        name: "Bracket outdoor tambahan",
        detail:
          "Bracket baja anti-karat dengan baut dan peredam getaran.",
        unit: "set",
        price: "Rp 100.000",
      },
      {
        name: "Drain pump",
        detail:
          "Untuk jalur pembuangan yang menanjak atau di bawah permukaan.",
        unit: "unit",
        price: "Rp 250.000",
      },
      {
        name: "Jalur kabel & MCB khusus",
        detail:
          "Penarikan kabel dari panel ke unit outdoor, termasuk MCB sesuai ampere.",
        unit: "titik",
        price: "Rp 175.000",
      },
    ],
  },
  {
    title: "Freon & Perbaikan",
    rows: [
      {
        name: "Isi freon R32 / R410A",
        detail:
          "Freon murni, pengisian sesuai takaran pabrikan, uji tekanan sebelum dan sesudah.",
        unit: "unit",
        price: "Rp 150.000",
      },
      {
        name: "Tambah freon R22",
        detail:
          "Untuk unit lama. Kebocoran diperiksa lebih dulu agar tidak terbuang.",
        unit: "unit",
        price: "Rp 125.000",
      },
      {
        name: "Deteksi & tambal kebocoran",
        detail:
          "Uji tekanan dengan manifold, las titik bocor, dan vakum ulang.",
        unit: "titik",
        price: "Rp 150.000",
      },
      {
        name: "Ganti kapasitor fan / kompresor",
        detail:
          "Sparepart original, pengukuran arus sebelum penggantian, garansi 30 hari.",
        unit: "unit",
        price: "Rp 120.000",
      },
      {
        name: "Servis & ganti PCB / modul",
        detail:
          "Diagnosa kelistrikan dan inverter. Biaya menyesuaikan tipe modul.",
        unit: "unit",
        price: null,
      },
      {
        name: "Ganti kompresor",
        detail:
          "Termasuk pelepasan unit lama, vakum total, dan isi freon baru.",
        unit: "unit",
        price: null,
      },
      {
        name: "Cek & diagnosa kerusakan",
        detail:
          "Biaya kunjungan. Gratis apabila pelanggan melanjutkan perbaikan.",
        unit: "kunjungan",
        price: "Rp 75.000",
      },
    ],
  },
  {
    title: "Pengadaan Unit AC",
    rows: [
      {
        name: "AC Split 0,5 PK",
        detail:
          "Unit original bergaransi resmi pabrik, siap pasang, konsultasi BTU gratis.",
        unit: "unit",
        price: "Rp 2.800.000",
      },
      {
        name: "AC Split 1 PK",
        detail:
          "Pilihan umum untuk kamar tidur 12–16 m². Termasuk pipa standar.",
        unit: "unit",
        price: "Rp 3.200.000",
      },
      {
        name: "AC Split 1,5 PK",
        detail:
          "Untuk ruang tamu atau ruang kerja 18–24 m². Inverter tersedia.",
        unit: "unit",
        price: "Rp 3.800.000",
      },
      {
        name: "AC Split 2 PK",
        detail:
          "Untuk ruang besar dan area komersial. Termasuk analisa beban ruang.",
        unit: "unit",
        price: "Rp 4.800.000",
      },
      {
        name: "AC Cassette / Floor Standing",
        detail:
          "Kapasitas, merek, dan tipe menyesuaikan kebutuhan ruang.",
        unit: "unit",
        price: null,
      },
      {
        name: "VRF / VRV & ducted",
        detail:
          "Perhitungan beban, desain jalur, dan instalasi untuk proyek gedung.",
        unit: "proyek",
        price: null,
      },
    ],
  },
  {
    title: "Ducting & Maintenance",
    rows: [
      {
        name: "Fabrikasi ducting BJLS / PU panel",
        detail:
          "Potong, tekuk, sambung, dan sealing sesuai gambar kerja atau site plan.",
        unit: "m²",
        price: null,
      },
      {
        name: "Instalasi ducting & diffuser",
        detail:
          "Pemasangan ducting, grill, diffuser, dan balancing aliran udara.",
        unit: "titik",
        price: null,
      },
      {
        name: "Grill / diffuser tambahan",
        detail:
          "Penggantian atau penambahan grill agar distribusi udara merata.",
        unit: "unit",
        price: null,
      },
      {
        name: "Maintenance berkala per unit",
        detail:
          "Kunjungan rutin 2–3 bulan sekali, termasuk cuci dan cek performa.",
        unit: "unit / bulan",
        price: "Rp 75.000",
      },
      {
        name: "Kontrak maintenance gedung",
        detail:
          "Jadwal berkala, laporan teknis, prioritas respon, dan invoice resmi.",
        unit: "kontrak",
        price: null,
      },
    ],
  },
];

export const pricingRowCount = pricingGroups.reduce(
  (total, group) => total + group.rows.length,
  0
);
