package imaging

import (
	"bytes"
	"fmt"
	"io"

	"github.com/nickalie/go-webpbin"
)

// ConvertToWebP membaca stream gambar (JPEG, PNG, GIF, BMP, WEBP, dll.)
// lalu mengonversi dan mengompres ke format WebP secara murni menggunakan cwebp binary terintegrasi.
// Kualitas di-set ke quality (0-100), mis. 82.
func ConvertToWebP(r io.Reader, quality uint) (*bytes.Reader, int64, error) {
	var out bytes.Buffer

	err := webpbin.NewCWebP().
		Quality(quality).
		Input(r).
		Output(&out).
		Run()

	if err != nil {
		return nil, 0, fmt.Errorf("gagal konversi gambar ke WebP: %w", err)
	}

	b := out.Bytes()
	return bytes.NewReader(b), int64(len(b)), nil
}
