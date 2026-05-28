package middleware

import (
	"net/http"
	"sync"
	"time"

	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type visitor struct {
	count    int
	lastSeen time.Time
}

var (
	visitors   = make(map[string]*visitor)
	mu         sync.Mutex
	rateLimit  = 100             // 每个IP每分钟最大请求数
	rateWindow = 1 * time.Minute // 窗口期1分钟
)

func init() {
	go func() {
		for {
			time.Sleep(5 * time.Minute)
			mu.Lock()
			for ip, v := range visitors {
				if time.Since(v.lastSeen) > rateWindow {
					delete(visitors, ip)
				}
			}
			mu.Unlock()
		}
	}()
}

func RateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		mu.Lock()
		v, exists := visitors[ip]
		if !exists || time.Since(v.lastSeen) > rateWindow {
			visitors[ip] = &visitor{count: 1, lastSeen: time.Now()}
			mu.Unlock()
			c.Next()
			return
		}
		v.lastSeen = time.Now()
		v.count++
		mu.Unlock()
		if v.count > rateLimit {
			response.Error(c, http.StatusTooManyRequests, 42901, "请求过于频繁，请稍后再试")
			c.Abort()
			return
		}
		c.Next()
	}
}
