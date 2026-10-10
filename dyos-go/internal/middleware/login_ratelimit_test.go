package middleware

import (
 "net/http"
 "net/http/httptest"
 "testing"

 "github.com/gin-gonic/gin"
)

func TestLoginRateLimitSharedAcrossRoutes(t *testing.T) {
 gin.SetMode(gin.TestMode)
 r:=gin.New()
 limiter:=LoginRateLimit()
 r.POST("/api/login",limiter,func(c *gin.Context){c.Status(http.StatusUnauthorized)})
 r.POST("/api/auth/login",limiter,func(c *gin.Context){c.Status(http.StatusUnauthorized)})
 for i:=0;i<7;i++ {
  path:="/api/login"
  if i%2==1 {path="/api/auth/login"}
  req:=httptest.NewRequest(http.MethodPost,path,nil)
  req.RemoteAddr="192.0.2.10:12345"
  w:=httptest.NewRecorder()
  r.ServeHTTP(w,req)
  expected:=http.StatusUnauthorized
  if i>=5 {expected=http.StatusTooManyRequests}
  if w.Code!=expected {t.Fatalf("attempt %d got %d want %d",i+1,w.Code,expected)}
 }
 req:=httptest.NewRequest(http.MethodPost,"/api/login",nil)
 req.RemoteAddr="192.0.2.11:2222"
 w:=httptest.NewRecorder()
 r.ServeHTTP(w,req)
 if w.Code!=http.StatusUnauthorized {t.Fatalf("other IP got %d",w.Code)}
}
