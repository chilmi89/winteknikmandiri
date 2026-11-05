package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/url"
	"path"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// Config menampung konfigurasi koneksi ke MinIO / S3.
type Config struct {
	Endpoint      string // misal: "minio:9000" (docker) atau "localhost:9000" (lokal)
	AccessKey     string // root user atau access key MinIO
	SecretKey     string // root password atau secret key MinIO
	Bucket        string // nama bucket, default "wtm-media"
	UseSSL        bool   // false untuk HTTP internal / lokal
	PublicBaseURL string // URL dasar publik via Caddy, misal "http://localhost/media" atau "/media"
}

// Client membungkus *minio.Client dengan helper spesifik untuk CV Win Teknik Mandiri.
type Client struct {
	s3            *minio.Client
	bucket        string
	publicBaseURL string
}

// Global storage client singleton bila diperlukan.
var S3Client *Client

// NewClient menginisialisasi koneksi ke MinIO dan memverifikasi bucket.
func NewClient(ctx context.Context, cfg Config) (*Client, error) {
	if cfg.Bucket == "" {
		cfg.Bucket = "wtm-media"
	}
	if cfg.PublicBaseURL == "" {
		cfg.PublicBaseURL = "/media"
	}
	// Normalisasi publicBaseURL: hapus trailing slash
	cfg.PublicBaseURL = strings.TrimRight(cfg.PublicBaseURL, "/")

	s3, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("gagal membuat client MinIO: %w", err)
	}

	client := &Client{
		s3:            s3,
		bucket:        cfg.Bucket,
		publicBaseURL: cfg.PublicBaseURL,
	}

	// Pastikan bucket sudah ada atau coba buat jika belum ada
	exists, err := s3.BucketExists(ctx, cfg.Bucket)
	if err != nil {
		log.Printf("[STORAGE WARNING] Gagal memeriksa bucket %s: %v (akan dicoba lagi nanti)", cfg.Bucket, err)
	} else if !exists {
		err = s3.MakeBucket(ctx, cfg.Bucket, minio.MakeBucketOptions{})
		if err != nil {
			log.Printf("[STORAGE WARNING] Gagal membuat bucket %s: %v", cfg.Bucket, err)
		} else {
			log.Printf("[STORAGE] Bucket %s berhasil dibuat.", cfg.Bucket)
		}
	} else {
		log.Printf("[STORAGE] Terhubung ke MinIO bucket: %s", cfg.Bucket)
	}

	S3Client = client
	return client, nil
}

// UploadServicePhoto mengunggah foto layanan ke folder (prefix) "services/" pada bucket wtm-media.
// Menghasilkan objectKey unik dan URL publik yang siap dipakai di frontend.
func (c *Client) UploadServicePhoto(
	ctx context.Context,
	originalFilename string,
	reader io.Reader,
	size int64,
	contentType string,
) (objectKey string, publicURL string, err error) {
	if c == nil || c.s3 == nil {
		return "", "", fmt.Errorf("storage client belum terinisialisasi")
	}

	ext := strings.ToLower(path.Ext(originalFilename))
	if ext == "" {
		ext = ".jpg"
	}

	// Format objectKey: services/YYYYMMDD-uuid.ext
	datePrefix := time.Now().Format("20060102")
	uniqueName := fmt.Sprintf("%s-%s%s", datePrefix, uuid.New().String()[:8], ext)
	objectKey = path.Join("services", uniqueName)

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	_, err = c.s3.PutObject(ctx, c.bucket, objectKey, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
		UserMetadata: map[string]string{
			"original-name": url.QueryEscape(originalFilename),
			"category":      "services",
		},
	})
	if err != nil {
		return "", "", fmt.Errorf("gagal upload foto layanan ke MinIO: %w", err)
	}

	publicURL = c.GetPublicURL(objectKey)
	return objectKey, publicURL, nil
}

// DeleteObject menghapus objek dari bucket berdasarkan objectKey.
func (c *Client) DeleteObject(ctx context.Context, objectKey string) error {
	if c == nil || c.s3 == nil {
		return fmt.Errorf("storage client belum terinisialisasi")
	}
	return c.s3.RemoveObject(ctx, c.bucket, objectKey, minio.RemoveObjectOptions{})
}

// GetPublicURL mengonversi objectKey menjadi URL publik melalui reverse proxy Caddy (/media/...).
// Contoh: services/20261103-abc.jpg -> /media/wtm-media/services/20261103-abc.jpg
func (c *Client) GetPublicURL(objectKey string) string {
	cleanedKey := strings.TrimLeft(objectKey, "/")
	return fmt.Sprintf("%s/%s/%s", c.publicBaseURL, c.bucket, cleanedKey)
}

// S3 mengekspos client asli bila ada kebutuhan operasi S3 tingkat rendah.
func (c *Client) S3() *minio.Client {
	return c.s3
}

// Bucket mengembalikan nama bucket aktif.
func (c *Client) Bucket() string {
	return c.bucket
}
