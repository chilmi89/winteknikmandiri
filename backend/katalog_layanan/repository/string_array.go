package repository

import (
	"database/sql/driver"
	"fmt"
	"strings"
)

// StringArray adalah custom type untuk membaca dan menulis PostgreSQL text[]
// yang 100% kompatibel dengan database/sql + pgx stdlib driver tanpa error "unsupported Scan".
type StringArray []string

// Scan membaca representasi string array dari PostgreSQL (misal: {"item 1","item 2"}).
func (a *StringArray) Scan(src any) error {
	if src == nil {
		*a = []string{}
		return nil
	}

	var s string
	switch v := src.(type) {
	case string:
		s = v
	case []byte:
		s = string(v)
	case []string:
		*a = v
		return nil
	default:
		return fmt.Errorf("unsupported Scan source type: %T", src)
	}

	s = strings.TrimSpace(s)
	if s == "" || s == "{}" {
		*a = []string{}
		return nil
	}

	// Buang kurung kurawal pembuka dan penutup
	if strings.HasPrefix(s, "{") && strings.HasSuffix(s, "}") {
		s = s[1 : len(s)-1]
	}

	// Parsing elemen yang dipisahkan koma dengan menangani tanda kutip
	var items []string
	var current strings.Builder
	inQuote := false
	escaped := false

	for i := 0; i < len(s); i++ {
		ch := s[i]
		if escaped {
			current.WriteByte(ch)
			escaped = false
			continue
		}
		if ch == '\\' {
			escaped = true
			continue
		}
		if ch == '"' {
			inQuote = !inQuote
			continue
		}
		if ch == ',' && !inQuote {
			items = append(items, strings.TrimSpace(current.String()))
			current.Reset()
			continue
		}
		current.WriteByte(ch)
	}
	if current.Len() > 0 || inQuote {
		items = append(items, strings.TrimSpace(current.String()))
	}

	*a = items
	return nil
}

// Value mengonversi StringArray ke representasi teks PostgreSQL text[]: {"item 1","item 2"}.
func (a StringArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return "{}", nil
	}

	var buf strings.Builder
	buf.WriteByte('{')
	for i, s := range a {
		if i > 0 {
			buf.WriteByte(',')
		}
		// Escape tanda kutip dan backslash
		buf.WriteByte('"')
		r := strings.NewReplacer(`\`, `\\`, `"`, `\"`)
		buf.WriteString(r.Replace(s))
		buf.WriteByte('"')
	}
	buf.WriteByte('}')
	return buf.String(), nil
}
