/**
 * Utilitas kompresi media otomatis di browser (Client-Side)
 * - Gambar otomatis di-resize dan dikonversi ke format WebP (menghemat hingga 90%+ ukuran file)
 * - Video otomatis di-extract thumbnail posternya ke format WebP
 */

export type ImageCompressionResult = {
  file: File;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
  previewUrl: string;
};

export type VideoPosterResult = {
  posterFile: File;
  posterUrl: string;
};

/**
 * Format ukuran byte ke string yang mudah dibaca (misal: "4.2 MB", "185 KB")
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Mengompresi file gambar (JPEG/PNG/WEBP/dsb) ke WebP dengan resolusi optimal banner (max 1920px)
 */
export async function compressImageToWebP(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<ImageCompressionResult> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.82 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error("Gagal memuat elemen gambar"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Pertahankan aspect ratio saat me-resize
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Canvas 2D context tidak tersedia"));
        }

        // Gambar ulang di canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Gagal mengompres gambar ke format WebP"));
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const compressedFile = new File([blob], cleanName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const savedBytes = Math.max(0, originalSize - compressedSize);
            const savedPercent = Math.round((savedBytes / originalSize) * 100);
            const previewUrl = URL.createObjectURL(compressedFile);

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              savedPercent,
              previewUrl,
            });
          },
          "image/webp",
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Mengambil satu frame video (pada detik ke-1) dan mengonversinya menjadi poster thumbnail WebP
 */
export async function extractVideoPosterWebP(file: File): Promise<VideoPosterResult> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const videoUrl = URL.createObjectURL(file);

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = videoUrl;

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error("Gagal memuat file video untuk membuat thumbnail"));
    };

    video.onloadeddata = () => {
      // Seek ke detik ke-1 (atau detik ke-0 jika video lebih pendek)
      video.currentTime = Math.min(1.0, Math.max(0.1, video.duration / 4));
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxWidth = 1280;
        let width = video.videoWidth || 1280;
        let height = video.videoHeight || 720;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(videoUrl);
          return reject(new Error("Canvas context tidak tersedia"));
        }

        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(videoUrl);
            if (!blob) {
              return reject(new Error("Gagal membuat thumbnail WebP"));
            }

            const cleanName =
              file.name.replace(/\.[^/.]+$/, "") + "-poster.webp";
            const posterFile = new File([blob], cleanName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            const posterUrl = URL.createObjectURL(posterFile);
            resolve({ posterFile, posterUrl });
          },
          "image/webp",
          0.85
        );
      } catch (err) {
        URL.revokeObjectURL(videoUrl);
        reject(err);
      }
    };
  });
}
