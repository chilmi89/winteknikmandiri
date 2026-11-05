"use client";

import { useId, useMemo, useRef, useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  CheckCircle2,
  Eye,
  Film,
  HelpCircle,
  ImageIcon,
  Loader2,
  MessageCircle,
  Palette,
  Pipette,
  RotateCcw,
  Save,
  Sparkles,
  Type,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  compressImageToWebP,
  extractVideoPosterWebP,
  formatBytes,
} from "@/lib/mediaCompressor";
import {
  fetchHomeHero,
  updateHomeHero,
  uploadHeroMedia,
} from "@/lib/dashboard/homeHero";

export type HomeHeroData = {
  badge_text: string;
  badge_colors: Record<number, string>;
  title: string;
  title_colors: Record<number, string>;
  slogan: string;
  slogan_colors: Record<number, string>;
  description: string;
  description_colors: Record<number, string>;
  media_type: "image" | "video";
  media_url: string;
  thumbnail_url: string;
  cta_primary_text: string;
  cta_primary_url: string;
  cta_secondary_text: string;
  cta_secondary_url: string;
  is_active: boolean;
};

const BRAND_PALETTE = [
  { name: "Putih", hex: "#FFFFFF" },
  { name: "Merah WTM", hex: "#A82020" },
  { name: "Coral Red", hex: "#FF6B6B" },
  { name: "Biru Teknik", hex: "#2279CF" },
  { name: "Ice Blue", hex: "#8ACFF8" },
  { name: "Amber Gold", hex: "#F59E0B" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Navy", hex: "#0A2540" },
];

const DEFAULT_HERO: HomeHeroData = {
  badge_text: "KONTRAKTOR AC • KEDIRI • SEJAK 2014",
  badge_colors: {
    0: "#FFFFFF",
    1: "#FF6B6B",
    2: "#8ACFF8",
    3: "#FFFFFF",
    4: "#8ACFF8",
    5: "#FFFFFF",
    6: "#F59E0B",
  },
  title: "WIN TEKNIK MANDIRI AC KEDIRI",
  title_colors: {
    0: "#FF6B6B",
    1: "#2279CF",
    2: "#2279CF",
    3: "#FFFFFF",
    4: "#FFFFFF",
  },
  slogan: "FRESH AIR, FRESH MIND, YOUR AC SOLUTIONS",
  slogan_colors: {
    0: "#8ACFF8",
    1: "#FFFFFF",
    2: "#8ACFF8",
    3: "#FFFFFF",
    4: "#FFFFFF",
    5: "#FF6B6B",
    6: "#FFFFFF",
  },
  description:
    "Pengadaan, instalasi, dan pemeliharaan AC serta ducting untuk hunian, komersial, dan industri di Kediri Raya",
  description_colors: {
    3: "#8ACFF8",
    4: "#FF6B6B",
    6: "#2279CF",
    11: "#F59E0B",
  },
  media_type: "video",
  media_url: "",
  thumbnail_url: "",
  cta_primary_text: "Konsultasi via WhatsApp",
  cta_primary_url: "https://wa.me/6281216622840",
  cta_secondary_text: "Lihat layanan",
  cta_secondary_url: "#layanan",
  is_active: true,
};

/** Normalisasi URL MinIO lokal dari http://localhost(:80|:443)/media ke relative /media */
export function normalizeMediaUrl(url: string): string {
  if (!url) return "";
  return url.replace(/^https?:\/\/localhost(:80|:443)?\/media/, "/media");
}

/** Komponen editor kata interaktif dengan input bebas tanpa lag/spasi hilang */
type WordColorEditorProps = {
  title: string;
  description?: string;
  text: string;
  colors: Record<number, string>;
  onTextChange: (newText: string) => void;
  onColorsChange: (newColors: Record<number, string>) => void;
  defaultColor?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  maxChars?: number;
};

function WordColorEditor({
  title,
  description,
  text,
  colors,
  onTextChange,
  onColorsChange,
  defaultColor = "#FFFFFF",
  multiline = false,
  rows = 3,
  placeholder,
  maxChars = 300,
}: WordColorEditorProps) {
  const colorInputId = useId();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Pisahkan kata secara dinamis dari string murni tanpa mengubah state teks
  const words = useMemo(() => {
    return text.split(/\s+/).filter(Boolean);
  }, [text]);

  function toggleSelectWord(index: number) {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  function handleSelectAll() {
    if (selectedIndices.length === words.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(words.map((_, i) => i));
    }
  }

  function applyColorToSelected(color: string) {
    if (selectedIndices.length === 0) return;
    const next = { ...colors };
    for (const idx of selectedIndices) {
      next[idx] = color;
    }
    onColorsChange(next);
  }

  const activeColor =
    selectedIndices.length > 0
      ? colors[selectedIndices[0]] || defaultColor
      : defaultColor;

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-xs space-y-3.5">
      {/* Header Elemen */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div>
          <label className="text-[13px] font-semibold text-slate-800 block">
            {title}
          </label>
          {description && (
            <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        <span className="font-mono text-[11px] tabular-nums text-slate-400">
          {text.length}/{maxChars}
        </span>
      </div>

      {/* Input Kalimat: String murni sehingga spasi & ketikan bebas 100% */}
      <div>
        {multiline ? (
          <Textarea
            rows={rows}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            maxLength={maxChars}
            placeholder={placeholder}
            className="min-h-20 resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] leading-relaxed text-slate-800 shadow-xs hover:border-slate-400 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10"
          />
        ) : (
          <Input
            type="text"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            maxLength={maxChars}
            placeholder={placeholder}
            className="h-9.5 rounded-lg border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-800 shadow-xs hover:border-slate-400 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10"
          />
        )}
      </div>

      {/* Baris Chip Kata Interaktif dengan Teks Seragam & Flag Warna di Samping */}
      {words.length > 0 && (
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Pipette className="size-3 text-[#0A2540]" />
              Klik kata untuk mengganti warna:
            </span>

            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-semibold text-[#0A2540] hover:underline transition-all flex items-center gap-1"
            >
              <CheckCheck className="size-3.5" />
              {selectedIndices.length === words.length
                ? "Batal Pilih"
                : "Pilih Semua Kata"}
            </button>
          </div>

          {/* Daftar Chip Kata: Teks Selalu Hitam Pekat, Flag Warna di Kiri */}
          <div className="flex flex-wrap items-center gap-2 max-h-44 overflow-y-auto p-1">
            {words.map((word, index) => {
              const isSelected = selectedIndices.includes(index);
              const color = colors[index] || defaultColor;
              const isWhite =
                color.toLowerCase() === "#ffffff" ||
                color.toLowerCase() === "#fff";

              return (
                <button
                  key={`${word}-${index}`}
                  type="button"
                  onClick={() => toggleSelectWord(index)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all border ${
                    isSelected
                      ? "border-2 border-[#0A2540] bg-[#0A2540]/5 text-slate-900 shadow-xs ring-2 ring-[#0A2540]/15 scale-[1.03]"
                      : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 shadow-xs"
                  }`}
                >
                  {/* Flag / Dot Warna di Samping */}
                  <span
                    className={`size-3 rounded-full shrink-0 shadow-2xs ${
                      isWhite
                        ? "border-2 border-slate-400 bg-white"
                        : "border border-black/15"
                    }`}
                    style={{ backgroundColor: color }}
                  />

                  {/* Teks Kata Selalu Hitam / Gelap agar Terbaca Jelas */}
                  <span className="text-slate-800">{word}</span>
                </button>
              );
            })}
          </div>

          {/* Toolbar Warna Muncul Saat Ada Kata yang Dipilih */}
          {selectedIndices.length > 0 && (
            <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-lg border border-slate-300 shadow-sm text-slate-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-700">
                  Warna untuk {selectedIndices.length} kata terpilih:
                </span>
                <div className="flex items-center gap-1.5">
                  {BRAND_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      onClick={() => applyColorToSelected(c.hex)}
                      className={`group relative flex size-7 items-center justify-center rounded-md border shadow-xs transition-transform hover:scale-115 active:scale-95 ${
                        c.hex === "#FFFFFF"
                          ? "border-2 border-slate-400 bg-white"
                          : "border-black/20"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {activeColor.toLowerCase() === c.hex.toLowerCase() && (
                        <Check
                          className={`size-3.5 stroke-[3] ${
                            c.hex === "#FFFFFF" ? "text-slate-900" : "text-white"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Hex Color Picker */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor={colorInputId}
                  className="flex items-center gap-1.5 cursor-pointer rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-mono font-semibold text-slate-800 hover:bg-slate-100 shadow-2xs"
                >
                  <div
                    className="relative size-4.5 overflow-hidden rounded-full border border-slate-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: activeColor }}
                  >
                    <input
                      id={colorInputId}
                      type="color"
                      value={activeColor}
                      onChange={(e) => applyColorToSelected(e.target.value)}
                      className="absolute -inset-2 size-10 cursor-pointer opacity-0"
                    />
                  </div>
                  <span>{activeColor.toUpperCase()}</span>
                </label>

                <button
                  type="button"
                  title="Selesai / Tutup Pilihan"
                  onClick={() => setSelectedIndices([])}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HomeHeroManager() {
  const [data, setData] = useState<HomeHeroData>(DEFAULT_HERO);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    original: string;
    compressed: string;
    percent: number;
    type: "image" | "video";
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange<K extends keyof HomeHeroData>(
    field: K,
    value: HomeHeroData[K]
  ) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFileProcess(file: File) {
    setCompressing(true);
    setCompressionStats(null);

    try {
      if (data.media_type === "image") {
        if (!file.type.startsWith("image/")) {
          throw new Error("File harus berupa gambar (.jpg, .png, .webp, .avif)");
        }
        // 1. Kompresi gambar ke WebP di browser
        const result = await compressImageToWebP(file);

        // 2. Upload file WebP ke backend storage (MinIO)
        const uploaded = await uploadHeroMedia(result.file);
        handleChange("media_url", normalizeMediaUrl(uploaded.url));

        setCompressionStats({
          original: formatBytes(result.originalSize),
          compressed: formatBytes(result.compressedSize),
          percent: result.savedPercent,
          type: "image",
        });

        toast.add({
          title: "Foto berhasil dikompres ke WebP & diunggah",
          description: `Hemat ${result.savedPercent}% (${formatBytes(result.originalSize)} ➔ ${formatBytes(result.compressedSize)})`,
          type: "success",
        });
      } else {
        if (!file.type.startsWith("video/")) {
          throw new Error("File harus berupa video (.mp4, .webm, .mov)");
        }

        // 1. Upload file video ke backend storage (MinIO)
        const uploadedVideo = await uploadHeroMedia(file);
        handleChange("media_url", normalizeMediaUrl(uploadedVideo.url));

        // 2. Ekstrak frame poster thumbnail ke WebP & upload ke backend
        try {
          const poster = await extractVideoPosterWebP(file);
          const uploadedPoster = await uploadHeroMedia(poster.posterFile);
          handleChange("thumbnail_url", normalizeMediaUrl(uploadedPoster.url));
        } catch {
          // Poster opsional
        }

        setCompressionStats({
          original: formatBytes(file.size),
          compressed: "Optimal",
          percent: 0,
          type: "video",
        });

        toast.add({
          title: "Video berhasil diunggah & poster WebP dibuat otomatis",
          type: "success",
        });
      }
    } catch (err) {
      toast.add({
        title: "Gagal memproses file",
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
        type: "error",
      });
    } finally {
      setCompressing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFileProcess(file);
  }

  function handleReset() {
    setData(DEFAULT_HERO);
    setCompressionStats(null);
    toast.add({
      title: "Data di-reset",
      description: "Pengaturan hero dikembalikan ke default.",
      type: "info",
    });
  }

  useEffect(() => {
    let active = true;
    async function loadData() {
      const hero = await fetchHomeHero();
      if (active && hero) {
        setData({
          ...hero,
          media_url: normalizeMediaUrl(hero.media_url),
          thumbnail_url: normalizeMediaUrl(hero.thumbnail_url),
        });
      }
    }
    void loadData();
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      await updateHomeHero(data);
      toast.add({
        title: "Perubahan hero disimpan",
        description: "Pengaturan warna per kata dan media berhasil disimpan ke database.",
        type: "success",
      });
    } catch (err) {
      toast.add({
        title: "Gagal menyimpan",
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  // Helper pemisah kata untuk render di Live Preview
  const badgeWords = useMemo(
    () => data.badge_text.split(/\s+/).filter(Boolean),
    [data.badge_text]
  );
  const titleWords = useMemo(
    () => data.title.split(/\s+/).filter(Boolean),
    [data.title]
  );
  const sloganWords = useMemo(
    () => data.slogan.split(/\s+/).filter(Boolean),
    [data.slogan]
  );
  const descriptionWords = useMemo(
    () => data.description.split(/\s+/).filter(Boolean),
    [data.description]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header Halaman */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Hero Beranda
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Aktif di Publik
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Kelola teks judul, slogan, deskripsi, warna kustom per kata, dan media latar banner utama.
        </p>
      </div>

      {/* Grid 2 Kolom: Form Editor di Kiri & Live Preview di Kanan */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Kolom Kiri: Form Editor */}
        <form
          id="hero-form"
          onSubmit={handleSave}
          className="flex flex-col gap-5 lg:col-span-7"
        >
          {/* Section 1: Konten Tipografi dengan Kustom Warna Per Kata */}
          <div className="space-y-4">
            <div className="flex h-8 items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-[#0A2540]/5 text-[#0A2540]">
                <Palette className="size-3.5" />
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                1. Kustomisasi Teks & Warna Per Kata
              </h2>
            </div>

            {/* 1. Badge Text */}
            <WordColorEditor
              title="Badge Atas"
              description="Teks pengantar kecil di atas judul utama"
              text={data.badge_text}
              colors={data.badge_colors}
              onTextChange={(val) => handleChange("badge_text", val)}
              onColorsChange={(colors) => handleChange("badge_colors", colors)}
              defaultColor="#FFFFFF"
              placeholder="KONTRAKTOR AC • KEDIRI • SEJAK 2014"
              maxChars={120}
            />

            {/* 2. Judul Utama H1 */}
            <WordColorEditor
              title="Judul Utama (H1)"
              description="Judul besar utama — klik kata seperti 'WIN' untuk memberi warna merah"
              text={data.title}
              colors={data.title_colors}
              onTextChange={(val) => handleChange("title", val)}
              onColorsChange={(colors) => handleChange("title_colors", colors)}
              defaultColor="#FFFFFF"
              placeholder="WIN TEKNIK MANDIRI AC KEDIRI"
              maxChars={150}
            />

            {/* 3. Slogan */}
            <WordColorEditor
              title="Slogan / Tagline"
              description="Slogan di bawah judul utama"
              text={data.slogan}
              colors={data.slogan_colors}
              onTextChange={(val) => handleChange("slogan", val)}
              onColorsChange={(colors) => handleChange("slogan_colors", colors)}
              defaultColor="#FFFFFF"
              placeholder="FRESH AIR, FRESH MIND, YOUR AC SOLUTIONS"
              maxChars={200}
            />

            {/* 4. Deskripsi */}
            <WordColorEditor
              title="Deskripsi Ringkas"
              description="Paragraf penjelasan layanan di bawah slogan"
              text={data.description}
              colors={data.description_colors}
              onTextChange={(val) => handleChange("description", val)}
              onColorsChange={(colors) =>
                handleChange("description_colors", colors)
              }
              defaultColor="#FFFFFF"
              multiline
              rows={3}
              placeholder="Pengadaan, instalasi, dan pemeliharaan AC serta ducting..."
              maxChars={400}
            />
          </div>

          {/* Section 2: Media Latar Belakang */}
          <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-[#0A2540]/5 text-[#0A2540]">
                  <Film className="size-3.5" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  2. Media Latar Belakang
                </h2>
              </div>

              {/* Segmented Switcher */}
              <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-semibold shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleChange("media_type", "video")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                    data.media_type === "video"
                      ? "bg-white text-[#0A2540] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Film className="size-3.5" />
                  Video (.mp4)
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("media_type", "image")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                    data.media_type === "image"
                      ? "bg-white text-[#0A2540] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ImageIcon className="size-3.5" />
                  Foto / Gambar
                </button>
              </div>
            </div>

            {/* SAKLAR TOGGLE ON / OFF PRIORITAS VIDEO vs FOTO */}
            <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-slate-50/80 p-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2.5 rounded-full ${
                      data.media_type === "video"
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="text-sm font-bold text-slate-900">
                    {data.media_type === "video"
                      ? "Saklar: Video Aktif (Prioritas Video Bergerak)"
                      : "Saklar: Foto Aktif (Prioritas Foto Statis)"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {data.media_type === "video"
                    ? "Website publik akan memutar video background secara otomatis."
                    : "Website publik akan menampilkan foto/gambar latar belakang."}
                </p>
              </div>

              {/* Saklar Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={data.media_type === "video"}
                onClick={() =>
                  handleChange(
                    "media_type",
                    data.media_type === "video" ? "image" : "video"
                  )
                }
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-xs ${
                  data.media_type === "video"
                    ? "bg-emerald-600"
                    : "bg-slate-300"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block size-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    data.media_type === "video"
                      ? "translate-x-6"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-4">
              {/* Dropzone Upload dengan Auto-Compress */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={
                    data.media_type === "image"
                      ? "image/jpeg,image/png,image/webp,image/avif"
                      : "video/mp4,video/webm,video/quicktime"
                  }
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFileProcess(file);
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#0A2540] bg-[#0A2540]/5 scale-[1.01]"
                      : "border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50 shadow-2xs"
                  }`}
                >
                  {compressing ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader2 className="size-8 animate-spin text-[#0A2540]" />
                      <p className="text-xs font-semibold text-slate-800">
                        {data.media_type === "image"
                          ? "Mengompresi gambar ke WebP otomatis..."
                          : "Memproses video & membuat poster thumbnail WebP..."}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Resolusi dioptimasi ke batas maksimal 1080p
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-white border border-slate-200 text-[#0A2540] shadow-xs group-hover:scale-110 transition-transform">
                        <UploadCloud className="size-5" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          <span className="text-[#0A2540] font-bold hover:underline">
                            Klik untuk upload
                          </span>{" "}
                          atau tarik file {data.media_type === "image" ? "foto" : "video"} ke sini
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {data.media_type === "image"
                            ? "Foto otomatis di-resize & dikonversi ke WebP (hemat hingga 90%+ ukuran)"
                            : "Video otomatis dibuatkan poster thumbnail WebP"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Compression Stats Badge */}
                {compressionStats && (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                      <span>
                        {compressionStats.type === "image" ? (
                          <>
                            <strong>Auto-WebP Berhasil:</strong> {compressionStats.original} ➔ {compressionStats.compressed}{" "}
                            <span className="rounded bg-emerald-200/80 px-1.5 py-0.5 font-bold text-emerald-900 ml-1">
                              Hemat {compressionStats.percent}%!
                            </span>
                          </>
                        ) : (
                          <>
                            <strong>Video Dimuat:</strong> {compressionStats.original} · Poster WebP otomatis dibuat
                          </>
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCompressionStats(null)}
                      className="text-emerald-700 hover:text-emerald-900"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Input URL Manual / Hasil Upload */}
              <div>
                <label
                  htmlFor="media_url"
                  className="text-[13px] font-semibold text-slate-800 block mb-1.5"
                >
                  {data.media_type === "video"
                    ? "Path / URL File Video (.mp4 / .webm)"
                    : "Path / URL Gambar (.webp / .jpg)"}
                </label>
                <Input
                  id="media_url"
                  value={data.media_url}
                  onChange={(e) => handleChange("media_url", e.target.value)}
                  placeholder={
                    data.media_type === "video"
                      ? "/hero-section/video_hero_ac.mp4"
                      : "/images/wtm-pemasangan.jpg"
                  }
                  className="h-9.5 font-mono text-[12px] rounded-lg border border-slate-300 bg-white px-3 text-slate-800 shadow-xs hover:border-slate-400 focus:border-[#0A2540]"
                />
              </div>

              {data.media_type === "video" && (
                <div>
                  <label
                    htmlFor="thumbnail_url"
                    className="text-[13px] font-semibold text-slate-800 block mb-1.5"
                  >
                    Poster Cadangan (Thumbnail saat video buffering)
                  </label>
                  <Input
                    id="thumbnail_url"
                    value={data.thumbnail_url}
                    onChange={(e) =>
                      handleChange("thumbnail_url", e.target.value)
                    }
                    placeholder="/images/wtm-pemasangan.jpg"
                    className="h-9.5 font-mono text-[12px] rounded-lg border border-slate-300 bg-white px-3 text-slate-800 shadow-xs hover:border-slate-400 focus:border-[#0A2540]"
                  />
                </div>
              )}
            </div>
          </div>

          

          {/* Section 4: Status Banner */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50/70 p-4 shadow-xs">
            <Checkbox
              id="hero_is_active"
              checked={data.is_active}
              onCheckedChange={(checked) =>
                handleChange("is_active", Boolean(checked))
              }
              className="size-4.5 rounded border-slate-300 data-checked:border-[#0A2540] data-checked:bg-[#0A2540]"
            />
            <label
              htmlFor="hero_is_active"
              className="cursor-pointer select-none text-[13px] font-medium text-slate-800"
            >
              Aktifkan konfigurasi hero ini di beranda publik website
            </label>
          </div>
        </form>

        {/* Kolom Kanan: Live Interactive Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="flex h-8 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-[#0A2540]/5 text-[#0A2540]">
                <Eye className="size-3.5" />
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Live Preview (Warna Real-time)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              16:9 Banner Mock
            </span>
          </div>

          {/* Frame Miniatur Hero */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-700/80 bg-[#0A2540] shadow-xl text-center select-none">
            {/* Latar Belakang Media */}
            {data.media_url ? (
              data.media_type === "video" ? (
                <video
                  key={normalizeMediaUrl(data.media_url)}
                  src={normalizeMediaUrl(data.media_url)}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster={normalizeMediaUrl(data.thumbnail_url) || undefined}
                  onLoadedData={(e) => {
                    e.currentTarget.muted = true;
                    e.currentTarget.play().catch(() => {});
                  }}
                  className="absolute inset-0 size-full object-cover object-center opacity-60"
                >
                  <source
                    src={normalizeMediaUrl(data.media_url)}
                    type="video/mp4"
                  />
                </video>
              ) : (
                <div
                  className="absolute inset-0 size-full bg-cover bg-center opacity-60"
                  style={{
                    backgroundImage: `url(${normalizeMediaUrl(data.media_url)})`,
                  }}
                />
              )
            ) : (
              <div className="absolute inset-0 size-full bg-gradient-to-br from-[#071a2e] to-[#0A2540]" />
            )}

            {/* Gradient Overlay Gelap khas WTM */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A2540]/85 via-[#0A2540]/55 to-[#0A2540]/95" />

            {/* Konten Miniatur dengan Warna Per Kata */}
            <div className="relative z-10 flex size-full flex-col items-center justify-center p-4">
              {/* Badge Text (Render per kata) */}
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] flex flex-wrap justify-center gap-x-1">
                {badgeWords.map((word, i) => (
                  <span
                    key={i}
                    style={{ color: data.badge_colors[i] || "#FFFFFF" }}
                  >
                    {word}
                  </span>
                ))}
              </p>

              {/* Judul H1 (Render per kata) */}
              <h2 className="mt-2 text-balance text-base sm:text-xl font-bold leading-tight tracking-tight flex flex-wrap justify-center gap-x-1.5">
                {titleWords.map((word, i) => (
                  <span
                    key={i}
                    style={{ color: data.title_colors[i] || "#FFFFFF" }}
                  >
                    {word}
                  </span>
                ))}
              </h2>

              {/* Slogan (Render per kata) */}
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] flex flex-wrap justify-center gap-x-1">
                {sloganWords.map((word, i) => (
                  <span
                    key={i}
                    style={{ color: data.slogan_colors[i] || "#FFFFFF" }}
                  >
                    {word}
                  </span>
                ))}
              </p>

              {/* Deskripsi (Render per kata) */}
              <p className="mt-2 max-w-xs text-[10px] leading-relaxed line-clamp-2 flex flex-wrap justify-center gap-x-1">
                {descriptionWords.map((word, i) => (
                  <span
                    key={i}
                    style={{ color: data.description_colors[i] || "#FFFFFF" }}
                  >
                    {word}
                  </span>
                ))}
              </p>

              {/* Tombol Miniatur */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-[#A82020] px-2.5 py-1 text-[9px] font-semibold text-white shadow-xs">
                  <MessageCircle className="size-2.5" />
                  {data.cta_primary_text || "WhatsApp"}
                  <ArrowUpRight className="size-2.5" />
                </span>

                <span className="inline-flex items-center gap-1 rounded border border-white/30 bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-white">
                  {data.cta_secondary_text || "Layanan"}
                  <ArrowRight className="size-2.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Simpan & Reset tepat di bawah Preview Video */}
          <div className="flex items-center gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={saving}
              className="flex-1 h-10 gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
            >
              <RotateCcw className="size-3.5 text-slate-500" />
              Reset Default
            </Button>

            <Button
              type="submit"
              form="hero-form"
              disabled={saving}
              className="flex-1 h-10 gap-2 rounded-xl bg-[#0A2540] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#071a2e] active:scale-[0.98]"
            >
              <Save className="size-3.5" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>

          {/* Info Card Bantuan */}
          
        </div>
      </div>
    </div>
  );
}

export default HomeHeroManager;
