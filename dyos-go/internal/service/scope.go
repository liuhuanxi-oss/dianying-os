package service

type DataScope struct {
	MerchantID *uint
	AgentID    *uint
}

func defaultString(value string, fallback string) string {
	if value == "" {
		return fallback
	}
	return value
}
