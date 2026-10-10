package middleware

import (
 "net/http"
 "net/http/httptest"
 "testing"

 "github.com/gin-gonic/gin"
)

func TestCORSOriginPolicy(t *testing.T) {
 t.Setenv("DYOS_CORS_ORIGINS", "https://partner.example")
 gin.SetMode(gin.TestMode)
 r:=gin.New()
 r.Use(CORS())
 r.GET("/api/ping",func(c *gin.Context){c.Status(http.StatusOK)})
 r.OPTIONS("/api/ping",func(c *gin.Context){c.Status(http.StatusNoContent)})
 for _,tc:=range []struct{origin,method string;want int;allow string}{
  {"https://os.detian.xin","OPTIONS",204,"https://os.detian.xin"},
  {"https://partner.example","OPTIONS",204,"https://partner.example"},
  {"https://evil.example","OPTIONS",403,""},
  {"https://evil.example","GET",200,""},
  {"","GET",200,""},
 } {
  req:=httptest.NewRequest(tc.method,"/api/ping",nil)
  if tc.origin!="" {req.Header.Set("Origin",tc.origin)}
  w:=httptest.NewRecorder()
  r.ServeHTTP(w,req)
  if w.Code!=tc.want || w.Header().Get("Access-Control-Allow-Origin")!=tc.allow {
   t.Errorf("%s %s: got status=%d origin=%q",tc.method,tc.origin,w.Code,w.Header().Get("Access-Control-Allow-Origin"))
  }
 }
}
