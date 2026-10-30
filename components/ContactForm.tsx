"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, MessageCircle, Send } from "lucide-react";
import { waLink } from "@/lib/site";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

const serviceOptions = [
  "Cuci AC & Deep Cleaning",
  "Pemasangan AC Baru / Bekas",
  "Bongkar Pasang & Relokasi AC",
  "Perbaikan & Service Kerusakan AC",
  "Pengisian & Tambah Freon (R32 / R410A / R22)",
  "Pengadaan & Fabrikasi Ducting AC",
  "Instalasi Jaringan AC VRF / VRV",
  "Kontrak Maintenance Gedung / Perusahaan",
  "Lainnya / Konsultasi Beban Ruangan",
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: serviceOptions[0],
    address: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedMessage = [
      "Halo CV Win Teknik Mandiri, saya ingin mengirim permohonan konsultasi via website resmi:",
      "",
      `• Nama: ${formData.name || "-"}`,
      `• No. Telepon / WhatsApp: ${formData.phone || "-"}`,
      `• Kebutuhan Layanan: ${formData.service}`,
      `• Lokasi / Alamat: ${formData.address || "Kediri"}`,
      `• Keterangan / Keluhan: ${formData.notes || "-"}`,
      "",
      "Mohon informasi ketersediaan jadwal teknisi dan penawarannya. Terima kasih.",
    ].join("\n");

    const link = waLink(formattedMessage);
    window.open(link, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  return (
    <div className="group relative overflow-hidden border border-[#0A2540]/10 bg-white p-6 shadow-[0_12px_32px_rgba(10,37,64,0.04)] transition-[border-color,box-shadow] duration-500 hover:border-[#A82020] hover:shadow-[0_24px_50px_-24px_rgba(10,37,64,0.25)] sm:p-8">
      {/* Top Red Accent Line */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 bg-[#A82020] transition-transform duration-500 ease-out group-hover:scale-x-100"
      />

      {/* Card Sheen Effect */}
      <span
        aria-hidden="true"
        className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0"
      />

      <div className="flex items-center gap-2.5">
        <span className="size-2 bg-[#A82020]" />
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#A82020]">
          Form Konsultasi Cepat
        </p>
      </div>

      <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#0A2540]">
        Kirim Kebutuhan AC Anda
      </h3>
      <p className="mt-1.5 text-xs text-[#0A2540]/65 sm:text-[13px]">
        Isi form berikut untuk langsung terhubung ke WhatsApp customer service CV
        Win Teknik Mandiri dengan pesan terstruktur.
      </p>

      {submitted ? (
        <div className="mt-6 border border-[#A82020]/20 bg-[#8ACFF8]/10 p-5">
          <div className="flex items-center gap-2 text-[#A82020]">
            <CheckCircle2 className="size-5 shrink-0" />
            <h4 className="font-semibold text-[#0A2540]">
              Pesan Siap Terkirim ke WhatsApp
            </h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#0A2540]/70">
            Jendela WhatsApp telah dibuka. Jika belum terbuka otomatis, silakan klik
            tombol di bawah ini untuk membuka chat langsung:
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            className={`mt-4 inline-flex items-center gap-2 bg-[#A82020] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#8e1919] ${focusRing}`}
          >
            <MessageCircle className="size-4" />
            Buka WhatsApp Ulang
            <ArrowUpRight className="size-3.5" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0A2540]/70"
              >
                Nama Lengkap / PIC Proyek <span className="text-[#A82020]">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Bpk. Hendra"
                className={`mt-1.5 w-full border border-[#0A2540]/15 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] placeholder:text-[#0A2540]/30 transition-colors hover:border-[#A82020] focus:border-[#A82020] ${focusRing}`}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0A2540]/70"
              >
                No. WhatsApp / Telepon <span className="text-[#A82020]">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Contoh: 08123456789"
                className={`mt-1.5 w-full border border-[#0A2540]/15 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] placeholder:text-[#0A2540]/30 transition-colors hover:border-[#A82020] focus:border-[#A82020] ${focusRing}`}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="service"
                className="block font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0A2540]/70"
              >
                Pilihan Layanan
              </label>
              <select
                id="service"
                value={formData.service}
                onChange={(e) =>
                  setFormData({ ...formData, service: e.target.value })
                }
                className={`mt-1.5 w-full border border-[#0A2540]/15 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] transition-colors hover:border-[#A82020] focus:border-[#A82020] ${focusRing}`}
              >
                {serviceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0A2540]/70"
              >
                Lokasi / Alamat Pekerjaan
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Contoh: Ngadiluwih, Kab. Kediri"
                className={`mt-1.5 w-full border border-[#0A2540]/15 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] placeholder:text-[#0A2540]/30 transition-colors hover:border-[#A82020] focus:border-[#A82020] ${focusRing}`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#0A2540]/70"
            >
              Keterangan Tambahan / Gejala Kerusakan{" "}
              <span className="text-[#A82020]">*</span>
            </label>
            <textarea
              id="notes"
              required
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Jelaskan jenis unit, jumlah PK, atau kendala AC Anda (misal: AC tidak dingin, bocor air, butuh pasang baru pipa 5 meter)..."
              className={`mt-1.5 w-full border border-[#0A2540]/15 bg-white px-3.5 py-2.5 text-sm text-[#0A2540] placeholder:text-[#0A2540]/30 transition-colors hover:border-[#A82020] focus:border-[#A82020] ${focusRing}`}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className={`inline-flex w-full items-center justify-center gap-2 bg-[#A82020] px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-[#8e1919] hover:shadow-[0_12px_28px_-12px_rgba(168,32,32,0.4)] ${focusRing}`}
            >
              <Send className="size-4" />
              <span>Kirim Pesan via WhatsApp</span>
              <ArrowUpRight className="size-4" />
            </button>
          </div>

          <p className="font-mono text-[10px] text-[#0A2540]/45 text-center">
            Privasi Terjamin · Data hanya digunakan untuk penjadwalan & estimasi teknisi resmi CV WTM
          </p>
        </form>
      )}
    </div>
  );
}
