package response

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestSuccess(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/", nil)

	Success(c, map[string]string{"key": "value"})

	if w.Code != http.StatusOK {
		t.Errorf("期望状态码 200, 得到 %d", w.Code)
	}
}

func TestError(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/", nil)

	Error(c, http.StatusBadRequest, CodeBadRequest, "参数错误")

	if w.Code != http.StatusBadRequest {
		t.Errorf("期望状态码 400, 得到 %d", w.Code)
	}
}

func TestErrorUnauthorized(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/", nil)

	Error(c, http.StatusUnauthorized, CodeUnauthorized, "未登录")

	if w.Code != http.StatusUnauthorized {
		t.Errorf("期望状态码 401, 得到 %d", w.Code)
	}
}
