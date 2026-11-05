export type InquiryStatus = "pending" | "diproses" | "selesai" | "batal";

export type Inquiry = {
  id: string;
  name: string;
  phone: string;
  service: string;
  address: string;
  notes: string;
  status: InquiryStatus;
  date: string;
};

export type InquiryPayload = {
  name: string;
  phone: string;
  service: string;
  address: string;
  notes: string;
  status: InquiryStatus;
};

export type InquiryStatusMeta = {
  label: string;
  tone: "warning" | "info" | "success" | "danger" | "neutral";
};

export const inquiryStatusMeta: Record<InquiryStatus, InquiryStatusMeta> = {
  pending: { label: "Menunggu", tone: "warning" },
  diproses: { label: "Diproses", tone: "info" },
  selesai: { label: "Selesai", tone: "success" },
  batal: { label: "Dibatalkan", tone: "danger" },
};

export const inquiryStatusOrder: InquiryStatus[] = [
  "pending",
  "diproses",
  "selesai",
  "batal",
];

export type InquiryServiceTone = "info" | "violet" | "success" | "warning" | "neutral";

export function serviceTone(service: string): InquiryServiceTone {
  const value = service.toLowerCase();

  if (value.includes("ducting")) return "violet";
  if (value.includes("vrf") || value.includes("instalasi")) return "info";
  if (value.includes("maintenance") || value.includes("cuci")) return "success";
  if (value.includes("freon") || value.includes("perbaikan")) return "warning";

  return "neutral";
}

let mockInquiries: Inquiry[] = [
  {
    id: "inq-1",
    name: "Budi Santoso",
    phone: "0812-1662-2840",
    service: "Instalasi VRF & Ducting",
    address: "Jl. Dhoho No. 12, Kediri",
    notes: "Survei gedung kantor 3 lantai, estimasi 6 indoor unit.",
    status: "diproses",
    date: "2026-10-30T09:24:00+07:00",
  },
  {
    id: "inq-2",
    name: "Siti Aminah",
    phone: "0813-3355-1122",
    service: "Cuci AC Berkala",
    address: "Perum Ngadiluwih Blok C-4",
    notes: "3 unit AC Split 1 PK, minta jadwal hari Sabtu pagi.",
    status: "pending",
    date: "2026-10-30T08:02:00+07:00",
  },
  {
    id: "inq-3",
    name: "PT Sinar Pangan",
    phone: "0812-9900-4411",
    service: "Fabrikasi Ducting BJLS",
    address: "Kawasan Industri Pare, Kediri",
    notes: "Exhaust hood area dapur produksi, panjang ±24 meter.",
    status: "selesai",
    date: "2026-10-29T14:15:00+07:00",
  },
  {
    id: "inq-4",
    name: "Andi Pratama",
    phone: "0857-8181-2020",
    service: "Tambah Freon & Perbaikan",
    address: "Jl. Mastrip No. 88, Kediri",
    notes: "AC berisik dan hembusan angin kurang dingin.",
    status: "pending",
    date: "2026-10-29T11:40:00+07:00",
  },
  {
    id: "inq-5",
    name: "Mall Galeria Kediri",
    phone: "0354-770-881",
    service: "Maintenance AHU",
    address: "Area Mall Lantai 2",
    notes: "Perawatan berkala AHU central tenant utama.",
    status: "diproses",
    date: "2026-10-28T16:05:00+07:00",
  },
  {
    id: "inq-6",
    name: "Dewi Lestari",
    phone: "0821-4477-9090",
    service: "Pemasangan AC Baru",
    address: "Jl. Kilisuci No. 21, Kediri",
    notes: "Pemasangan unit Daikin 1/2 PK pipa 4 meter.",
    status: "selesai",
    date: "2026-10-28T10:30:00+07:00",
  },
  {
    id: "inq-7",
    name: "Rizky Maulana",
    phone: "0819-2233-4455",
    service: "Perbaikan AC Tidak Dingin",
    address: "Jl. Veteran No. 45, Kediri",
    notes: "Unit kamar tidur menyala tetapi tidak mendinginkan ruangan.",
    status: "pending",
    date: "2026-10-27T13:10:00+07:00",
  },
  {
    id: "inq-8",
    name: "SDN Ngadiluwih 2",
    phone: "0813-7788-9900",
    service: "Instalasi AC Sekolah",
    address: "Jl. Raya Ngadiluwih, Kediri",
    notes: "Pengadaan dan pemasangan 4 unit AC untuk ruang kelas.",
    status: "diproses",
    date: "2026-10-26T09:45:00+07:00",
  },
];

function delay(ms = 140) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listInquiries(): Promise<Inquiry[]> {
  await delay();
  return [...mockInquiries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function createInquiry(payload: InquiryPayload): Promise<Inquiry> {
  await delay();
  const inquiry: Inquiry = {
    id: `inq-${Date.now()}`,
    ...payload,
    date: new Date().toISOString(),
  };
  mockInquiries = [inquiry, ...mockInquiries];
  return inquiry;
}

export async function updateInquiry(
  id: string,
  payload: InquiryPayload
): Promise<Inquiry> {
  await delay();
  const index = mockInquiries.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("Permohonan tidak ditemukan.");
  }

  mockInquiries[index] = { ...mockInquiries[index], ...payload };
  return mockInquiries[index];
}

export async function deleteInquiry(id: string): Promise<void> {
  await delay();
  mockInquiries = mockInquiries.filter((item) => item.id !== id);
}
