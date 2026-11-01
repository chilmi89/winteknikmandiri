// Package apperr menyediakan tipe error aplikasi yang tidak bergantung
// pada layer HTTP, sehingga service bisa mengembalikan kesalahan yang
// terklasifikasi tanpa tahu status code-nya.
package apperr

import "fmt"

// Kind mengelompokkan jenis kesalahan aplikasi.
type Kind string

const (
	KindValidation  Kind = "validation"
	KindNotFound    Kind = "not_found"
	KindConflict    Kind = "conflict"
	KindUnavailable Kind = "unavailable"
	KindInternal    Kind = "internal"
)

// Error adalah error aplikasi yang membawa jenis, pesan, dan detail opsional.
type Error struct {
	Kind    Kind
	Message string
	Details any
	Err     error
}

func (e *Error) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

// Unwrap membuat *Error kompatibel dengan errors.Is/errors.As.
func (e *Error) Unwrap() error { return e.Err }

// New membuat error aplikasi baru.
func New(kind Kind, message string, details any) *Error {
	return &Error{Kind: kind, Message: message, Details: details}
}

// Validation menandai input pengguna tidak valid.
func Validation(message string, details any) *Error {
	return New(KindValidation, message, details)
}

// NotFound menandai data yang diminta tidak ada.
func NotFound(message string) *Error {
	return New(KindNotFound, message, nil)
}

// Conflict menandai konflik state, misalnya data duplikat.
func Conflict(message string) *Error {
	return New(KindConflict, message, nil)
}

// Unavailable menandai dependensi (database) belum siap.
func Unavailable(message string) *Error {
	return New(KindUnavailable, message, nil)
}

// Internal membungkus kesalahan tak terduga. Detail asli hanya dicatat di log.
func Internal(err error) *Error {
	return &Error{
		Kind:    KindInternal,
		Message: "Terjadi kesalahan pada server",
		Err:     err,
	}
}
