package middleware

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func Pagination() gin.HandlerFunc {
	return func(c *gin.Context) {
		page := positiveQueryInt(c, "page", 1)
		pageSize := positiveQueryInt(c, "page_size", 20)
		c.Set("page", page)
		c.Set("page_size", pageSize)
		c.Next()
	}
}

func positiveQueryInt(c *gin.Context, key string, fallback int) int {
	value, err := strconv.Atoi(c.DefaultQuery(key, strconv.Itoa(fallback)))
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}
