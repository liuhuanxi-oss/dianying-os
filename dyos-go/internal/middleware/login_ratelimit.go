package middleware

import (
 "net/http"
 "net"
 "strings"
 "sync"
 "time"

 "dyos-go/pkg/response"
 "github.com/gin-gonic/gin"
)

// LoginRateLimit provides defense-in-depth for password guessing. Configure
// a shared gateway limiter when deploying multiple server instances.
func LoginRateLimit() gin.HandlerFunc {
 type attempt struct { count int; reset time.Time }
 var mu sync.Mutex
 attempts := map[string]attempt{}
 const window = time.Minute
 const limit = 5
 return func(c *gin.Context) {
  // Only use the immediate peer IP. X-Forwarded-For is untrusted unless a
  // known proxy is explicitly configured with Gin SetTrustedProxies.
  ip := strings.TrimSpace(c.Request.RemoteAddr)
  if host, _, err := net.SplitHostPort(ip); err == nil { ip = host }
  if ip == "" { ip = "unknown" }
  now := time.Now()
  mu.Lock()
  if len(attempts) > 10000 {
   for key, v := range attempts { if !now.Before(v.reset) { delete(attempts,key) } }
  }
  v := attempts[ip]
  if !now.Before(v.reset) { v = attempt{reset: now.Add(window)} }
  v.count++
  attempts[ip] = v
  mu.Unlock()
  if v.count > limit {
   c.Header("Retry-After", "60")
   response.Error(c, http.StatusTooManyRequests, 42901, "登录尝试过于频繁，请稍后再试")
   c.Abort()
   return
  }
  c.Next()
 }
}
