export type GalleryCategory =
  | "all"
  | "mall-retail"
  | "sekolah-fasilitas"
  | "industri-pabrik"
  | "komersial-hvac";

export type GalleryFilterTab = {
  id: GalleryCategory;
  label: string;
};

export const galleryFilterTabs: GalleryFilterTab[] = [
  { id: "all", label: "Semua Proyek" },
  { id: "mall-retail", label: "Mall & Retail" },
  { id: "sekolah-fasilitas", label: "Sekolah & Fasilitas" },
  { id: "industri-pabrik", label: "Industri & Pabrik" },
  { id: "komersial-hvac", label: "Komersial & HVAC" },
];

export type GalleryProjectItem = {
  id: string;
  title: string;
  category: GalleryCategory;
  categoryLabel: string;
  location: string;
  image: string;
  alt: string;
  client: string;
  scope: string;
};

export const galleryProjects: GalleryProjectItem[] = [
  {
    id: "galeria-bali-ahu-1",
    title: "Instalasi AHU Mall Galeria Bali",
    category: "mall-retail",
    categoryLabel: "Mall & Retail",
    location: "Kuta, Bali",
    client: "Mall Galeria Bali",
    scope: "Air Handling Unit & Ducting",
    image:
      "/gallery/Proyek%20Galeria%20Bali%20Mall/Instalasi%20AHU%20galeria%20Bali%20Mall.jpeg",
    alt: "Dokumentasi instalasi AHU di Mall Galeria Bali",
  },
  {
    id: "smk-budi-utomo-1",
    title: "Supply & Instalasi AC SMK Budi Utomo",
    category: "sekolah-fasilitas",
    categoryLabel: "Sekolah & Fasilitas",
    location: "Gading Mangu, Jombang",
    client: "SMK Budi Utomo",
    scope: "Multi-Split Ruang Belajar",
    image:
      "/gallery/Proyek%20SMK%20Budi%20Utomo%20Gading%20Mangu/Supply%20dan%20instalasi%20sekolahan%20SMK%20Budi%20Utomo%20Gading%20Mangu.jpeg",
    alt: "Dokumentasi supply dan instalasi AC di SMK Budi Utomo Gading Mangu",
  },
  {
    id: "growth-asia-piping-1",
    title: "Pabrikasi Pipa Refrigerant PT Growth Asia",
    category: "industri-pabrik",
    categoryLabel: "Industri & Pabrik",
    location: "Pasuruan, Jawa Timur",
    client: "PT Growth Asia",
    scope: "Pipa Refrigerant & Fitting",
    image:
      "/gallery/Proyek%20PT.%20Growth%20Asia%20Pasuruan/Proyek%20PT.%20Growth%20Asia%20Pasuruan/WhatsApp%20Image%202026-10-26%20at%2011.48.17.jpeg",
    alt: "Dokumentasi pabrikasi pipa refrigerant di PT Growth Asia Pasuruan",
  },
  {
    id: "wali-barokah-splitduct-1",
    title: "Instalasi Mesin Splitduct 20 PK Pondok Wali Barokah",
    category: "sekolah-fasilitas",
    categoryLabel: "Sekolah & Fasilitas",
    location: "Kota Kediri",
    client: "Pondok Wali Barokah",
    scope: "Splitduct 20 PK Mitsubishi",
    image:
      "/gallery/Proyek%20Pondok%20Wali%20Barokah/Instalasi%20mesin%20splitduct%2020%20PK%20Pondok%20Wali%20Barokah.jpeg",
    alt: "Dokumentasi instalasi mesin splitduct 20 PK di Pondok Wali Barokah Kediri",
  },
  {
    id: "nike-puri-indah-1",
    title: "Pemasangan Unit AC Store Nike Mall Puri Indah",
    category: "mall-retail",
    categoryLabel: "Mall & Retail",
    location: "Jakarta Barat",
    client: "Nike Store",
    scope: "Instalasi AC Tenant Retail",
    image:
      "/gallery/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/WhatsApp%20Image%202026-10-24%20at%2009.10.49.jpeg",
    alt: "Dokumentasi instalasi AC di tenant Nike Mall Puri Indah Jakarta",
  },
  {
    id: "payless-medan-1",
    title: "Instalasi Jaringan AC Payless Centre Point Mall",
    category: "mall-retail",
    categoryLabel: "Mall & Retail",
    location: "Medan, Sumatera Utara",
    client: "Payless Shoesource",
    scope: "Central Ducting & Cassette",
    image:
      "/gallery/Proyek%20Payless%20Centre%20Point%20Medan/WhatsApp%20Image%202026-10-24%20at%2009.05.32.jpeg",
    alt: "Dokumentasi instalasi AC di Payless Centre Point Mall Medan",
  },
  {
    id: "wali-barokah-outdoor-1",
    title: "Persiapan & Pemasangan Outdoor Unit DMC",
    category: "komersial-hvac",
    categoryLabel: "Komersial & HVAC",
    location: "Kota Kediri",
    client: "Pondok Wali Barokah",
    scope: "Outdoor DMC Multi-Unit",
    image:
      "/gallery/Proyek%20Pondok%20Wali%20Barokah/Persiapan%20instalasi%20outdoor%20DMC%20pondok%20Wali%20Barokah.jpeg",
    alt: "Dokumentasi persiapan instalasi outdoor DMC di Pondok Wali Barokah",
  },
  {
    id: "galeria-bali-ahu-2",
    title: "Fabrikasi & Penataan Saluran AHU Galeria Bali",
    category: "komersial-hvac",
    categoryLabel: "Komersial & HVAC",
    location: "Kuta, Bali",
    client: "Mall Galeria Bali",
    scope: "Fabrikasi Saluran Udara AHU",
    image:
      "/gallery/Proyek%20Galeria%20Bali%20Mall/Instalasi%20AHU%20galeria%20Bali%20Mall(2).jpeg",
    alt: "Dokumentasi penataan saluran AHU di Galeria Bali Mall",
  },
  {
    id: "smk-budi-utomo-indoor-1",
    title: "Instalasi Unit AC Indoor Ruang Belajar SMK",
    category: "sekolah-fasilitas",
    categoryLabel: "Sekolah & Fasilitas",
    location: "Gading Mangu, Jombang",
    client: "SMK Budi Utomo",
    scope: "Instalasi Unit Split Indoor",
    image:
      "/gallery/Proyek%20SMK%20Budi%20Utomo%20Gading%20Mangu/Supply%20dan%20instalasi%20sekolahan%20SMK%20Budi%20Utomo%20Gading%20Mangu(1).jpeg",
    alt: "Dokumentasi instalasi unit indoor AC di SMK Budi Utomo",
  },
  {
    id: "growth-asia-unit-2",
    title: "Instalasi Pemipaan & Fitting Unit Outdoor Pabrik",
    category: "industri-pabrik",
    categoryLabel: "Industri & Pabrik",
    location: "Pasuruan, Jawa Timur",
    client: "PT Growth Asia",
    scope: "Pemipaan Tembaga Heavy Duty",
    image:
      "/gallery/Proyek%20PT.%20Growth%20Asia%20Pasuruan/Proyek%20PT.%20Growth%20Asia%20Pasuruan/WhatsApp%20Image%202026-10-26%20at%2011.48.18.jpeg",
    alt: "Dokumentasi pemipaan outdoor pabrik di PT Growth Asia Pasuruan",
  },
  {
    id: "nike-puri-indah-2",
    title: "Penataan Jalur Ducting & Ceiling Store Nike",
    category: "mall-retail",
    categoryLabel: "Mall & Retail",
    location: "Jakarta Barat",
    client: "Nike Store",
    scope: "Diffuser & Ceiling Ducting",
    image:
      "/gallery/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/WhatsApp%20Image%202026-10-24%20at%2009.10.48.jpeg",
    alt: "Dokumentasi penataan saluran ducting store Nike Mall Puri Indah",
  },
  {
    id: "payless-medan-2",
    title: "Pemasangan Unit Pendingin Ruang Store Payless",
    category: "mall-retail",
    categoryLabel: "Mall & Retail",
    location: "Medan, Sumatera Utara",
    client: "Payless Shoesource",
    scope: "Supply & Unit Installation",
    image:
      "/gallery/Proyek%20Payless%20Centre%20Point%20Medan/WhatsApp%20Image%202026-10-24%20at%2009.05.31.jpeg",
    alt: "Dokumentasi pemasangan unit pendingin di Store Payless Medan",
  },
  {
    id: "wali-barokah-loading",
    title: "Proses Loading Mesin Mitsubishi Splitduct",
    category: "komersial-hvac",
    categoryLabel: "Komersial & HVAC",
    location: "Kota Kediri",
    client: "Pondok Wali Barokah",
    scope: "Handling & Logistik Mesin HVAC",
    image:
      "/gallery/Proyek%20Pondok%20Wali%20Barokah/Proses%20Loading%20mesin%20Mitsubishi%20Pondok%20Wali%20Barokah.jpeg",
    alt: "Dokumentasi proses loading mesin Mitsubishi di Pondok Wali Barokah",
  },
  {
    id: "galeria-bali-ahu-3",
    title: "Pengujian Tekanan & Aliran Udara AHU Galeria",
    category: "komersial-hvac",
    categoryLabel: "Komersial & HVAC",
    location: "Kuta, Bali",
    client: "Mall Galeria Bali",
    scope: "Commissioning & Airflow Balancing",
    image:
      "/gallery/Proyek%20Galeria%20Bali%20Mall/Instalasi%20AHU%20galeria%20Bali%20Mall(1).jpeg",
    alt: "Dokumentasi pengujian AHU di Mall Galeria Bali",
  },
  {
    id: "smk-budi-utomo-outdoor",
    title: "Penempatan & Perakitan Bracket Outdoor SMK",
    category: "sekolah-fasilitas",
    categoryLabel: "Sekolah & Fasilitas",
    location: "Gading Mangu, Jombang",
    client: "SMK Budi Utomo",
    scope: "Bracket Dinabolt & Waterpass",
    image:
      "/gallery/Proyek%20SMK%20Budi%20Utomo%20Gading%20Mangu/Supply%20dan%20instalasi%20sekolahan%20SMK%20Budi%20Utomo%20Gading%20Mangu(2).jpeg",
    alt: "Dokumentasi perakitan bracket outdoor di SMK Budi Utomo",
  },
  {
    id: "growth-asia-manifold",
    title: "Uji Tekanan Manifold & Vakum Kompresor Pabrik",
    category: "industri-pabrik",
    categoryLabel: "Industri & Pabrik",
    location: "Pasuruan, Jawa Timur",
    client: "PT Growth Asia",
    scope: "Uji Vakum & Diagnosa Digital",
    image:
      "/gallery/Proyek%20PT.%20Growth%20Asia%20Pasuruan/Proyek%20PT.%20Growth%20Asia%20Pasuruan/WhatsApp%20Image%202026-10-26%20at%2021.39.29.jpeg",
    alt: "Dokumentasi uji tekanan manifold di PT Growth Asia Pasuruan",
  },
  {
    id: "nike-puri-indah-3",
    title: "Finishing & Serah Terima Unit Pendingin Nike",
    category: "mall-retail",
    categoryLabel: "Mall & Retail",
    location: "Jakarta Barat",
    client: "Nike Store",
    scope: "Commissioning & Uji Suhu",
    image:
      "/gallery/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/Proyek%20Nike%20Puri%20Indah%20Mall%20Jakarta/WhatsApp%20Image%202026-10-24%20at%2008.13.33.jpeg",
    alt: "Dokumentasi serah terima instalasi AC di tenant Nike Mall Puri Indah",
  },
  {
    id: "wali-barokah-splitduct-2",
    title: "Koneksi Pemipaan Tembaga Unit Splitduct 20 PK",
    category: "sekolah-fasilitas",
    categoryLabel: "Sekolah & Fasilitas",
    location: "Kota Kediri",
    client: "Pondok Wali Barokah",
    scope: "Brazing & Pemipaan Refrigerant",
    image:
      "/gallery/Proyek%20Pondok%20Wali%20Barokah/Instalasi%20mesin%20splitduct%2020%20PK%20Pondok%20Wali%20Barokah(1).jpeg",
    alt: "Dokumentasi pengelasan pemipaan tembaga unit splitduct 20 PK",
  },
];
