package handler

import (
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"

    "dyos-go/internal/middleware"
    "dyos-go/internal/service"
    jwtpkg "dyos-go/pkg/jwt"
    "github.com/gin-gonic/gin"
)

// Until a canonical merchant identity exists for legacy finance rows,
// these routes must never return records belonging to another merchant.
func TestMerchantFinanceRoutesFailClosedWithoutIdentityMapping(t *testing.T) {
    gin.SetMode(gin.TestMode)
    jwtpkg.SetSecret(strings.Repeat("f", 40))
    token, err := jwtpkg.Sign(jwtpkg.Claims{UserID: 7, Role: "merchant", MerchantID: 42})
    if err != nil { t.Fatal(err) }

    r := gin.New()
    group := r.Group("/api/merchant")
    group.Use(middleware.MerchantAuth(), middleware.TenantIsolation())
    NewFinanceHandler(service.NewFinanceService(nil)).RegisterMerchantRoutes(group)

    paths := []struct{ method, path string }{
        {http.MethodGet, "/api/merchant/payments"},
        {http.MethodGet, "/api/merchant/payments/any-transaction"},
        {http.MethodPost, "/api/merchant/payments/refund"},
        {http.MethodGet, "/api/merchant/finance/transactions"},
        {http.MethodGet, "/api/merchant/finance/transactions/any-transaction"},
        {http.MethodGet, "/api/merchant/finance/refunds"},
        {http.MethodGet, "/api/merchant/finance/invoices"},
    }
    for _, tc := range paths {
        t.Run(tc.method+" "+tc.path, func(t *testing.T) {
            req := httptest.NewRequest(tc.method, tc.path, nil)
            req.Header.Set("Authorization", "Bearer "+token)
            w := httptest.NewRecorder()
            r.ServeHTTP(w, req)
            if w.Code != http.StatusServiceUnavailable {
                t.Fatalf("got %d want 503: %s", w.Code, w.Body.String())
            }
        })
    }
}
