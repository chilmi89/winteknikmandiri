package imaging

import (
	"bytes"
	"fmt"
	"io"
	"log"

	"github.com/nickalie/go-webpbin"
)

// ConvertToWebP membaca stream gambar (JPEG, PNG, GIF, BMP, WEBP, dll.)
// lalu mengonversi dan mengompres ke format WebP menggunakan cwebp binary (disediakan oleh libwebp-tools di Alpine).
// Jika cwebp gagal atau tidak tersedia di lingkungan tertentu, fungsi ini mengembalikan
// raw buffer asli sebagai fallback aman agar upload tidak gagal.
func ConvertToWebP(r io.Reader, quality uint) (reader io.ReadSeeker, size int64, isWebP bool, err error) {
	// Salin seluruh isi reader ke memori agar bisa dibaca ulang jika perlu fallback
	data, err := io.ReadAll(r)
	if err != nil {
		return nil, 0, false, fmt.Errorf("membaca stream gambar: %w", err)
	}

	var out bytes.Buffer
	err = webpbin.NewCWebP().
		Quality(quality).
		Input(bytes.NewReader(data)).
		Output(&out).
		Run()

	if err == nil && out.Len() > 0 {
		b := out.Bytes()
		return bytes.NewReader(b), int64(len(b)), true, nil
	}

	// Fallback aman bila cwebp belum terpasang di host
	log.Printf("[IMAGING WARNING] cwebp tidak tersedia atau gagal konversi (%v), menyimpan file gambar asli tanpa WebP", err)
	return bytes.NewReader(data), int64(len(data)), false, nil
}
