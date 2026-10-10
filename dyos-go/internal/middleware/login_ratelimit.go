package middleware

import (
 "net/http"
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
  // ClientIP trusts only explicitly configured Gin proxy addresses.
  ip := strings.TrimSpace(c.ClientIP())
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
