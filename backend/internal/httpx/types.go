package httpx

// ErrorResponse adalah format error standar untuk seluruh endpoint.
type ErrorResponse struct {
	Error   string `json:"error" example:"Validasi gagal"`
	Details any    `json:"details,omitempty"`
}

// HealthResponse adalah payload GET /health.
type HealthResponse struct {
	Status    string `json:"status" example:"healthy"`
	Service   string `json:"service" example:"CV Win Teknik Mandiri API"`
	Database  string `json:"database" example:"connected"`
	Timestamp string `json:"timestamp" example:"2026-11-01T08:00:00+07:00"`
}
