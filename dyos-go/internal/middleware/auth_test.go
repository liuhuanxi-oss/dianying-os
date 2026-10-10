package middleware

import (
 "net/http"
 "net/http/httptest"
 "strings"
 "testing"

 jwtpkg "dyos-go/pkg/jwt"
 "github.com/gin-gonic/gin"
)

func TestAdminAuthRejectsNonAdminRoles(t *testing.T) {
 gin.SetMode(gin.TestMode)
 jwtpkg.SetSecret(strings.Repeat("a", 40))
 for _, tc := range []struct{ role string; want int }{
  {"admin", http.StatusOK},
  {"agent", http.StatusForbidden},
  {"merchant", http.StatusForbidden},
 } {
  t.Run(tc.role, func(t *testing.T) {
   token, err := jwtpkg.Sign(jwtpkg.Claims{UserID:1, Role:tc.role, AgentID:5, MerchantID:6})
   if err != nil { t.Fatal(err) }
   r := gin.New()
   r.GET("/api/admin/ping", AdminAuth(), func(c *gin.Context){ c.Status(http.StatusOK) })
   req := httptest.NewRequest(http.MethodGet, "/api/admin/ping", nil)
   req.Header.Set("Authorization", "Bearer "+token)
   w := httptest.NewRecorder()
   r.ServeHTTP(w, req)
   if w.Code != tc.want { t.Fatalf("role %s: got %d want %d: %s",tc.role,w.Code,tc.want,w.Body.String()) }
  })
 }
}

func TestAdminAuthRequiresToken(t *testing.T) {
 r:=gin.New()
 r.GET("/api/admin/ping",AdminAuth(),func(c *gin.Context){c.Status(http.StatusOK)})
 w:=httptest.NewRecorder()
 r.ServeHTTP(w,httptest.NewRequest(http.MethodGet,"/api/admin/ping",nil))
 if w.Code!=http.StatusUnauthorized {t.Fatalf("got %d want 401",w.Code)}
}
