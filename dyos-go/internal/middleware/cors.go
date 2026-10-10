package middleware

import (
 "net/http"
 "net/url"
 "os"
 "strings"

 "github.com/gin-gonic/gin"
)

// CORS authorizes browser origins explicitly. Same-origin requests do not
// require CORS headers. Do not use wildcard origin for authenticated APIs.
func CORS() gin.HandlerFunc {
 allowed := map[string]bool{}
 for _, raw := range strings.Split(os.Getenv("DYOS_CORS_ORIGINS"), ",") {
  origin := strings.TrimSpace(raw)
  u, err := url.Parse(origin)
  if err != nil || (u.Scheme != "https" && u.Scheme != "http") || u.Host == "" || u.Path != "" || u.RawQuery != "" || u.Fragment != "" || u.User != nil {
   continue
  }
  if u.Scheme+"://"+u.Host != origin { continue }
  allowed[origin] = true
 }
 // Canonical production website. Additional cross-origin clients must be
 // reviewed and explicitly listed in DYOS_CORS_ORIGINS.
 allowed["https://os.detian.xin"] = true
 return func(c *gin.Context) {
  origin := c.GetHeader("Origin")
  if origin != "" {
   if !allowed[origin] {
    if c.Request.Method == http.MethodOptions {
     c.AbortWithStatus(http.StatusForbidden)
     return
    }
    c.Next()
    return
   }
   c.Header("Access-Control-Allow-Origin", origin)
   c.Header("Vary", "Origin")
   c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
   c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
  }
  if c.Request.Method == http.MethodOptions {
   c.AbortWithStatus(http.StatusNoContent)
   return
  }
  c.Next()
 }
}
