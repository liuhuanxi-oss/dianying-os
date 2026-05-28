package deepseek

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestNewClient(t *testing.T) {
	c := NewClient()
	if c == nil {
		t.Fatal("NewClient 返回 nil")
	}
	if c.baseURL == "" {
		t.Error("baseURL 不应为空")
	}
	if c.model == "" {
		t.Error("model 不应为空")
	}
}

func TestAvailable_NoKey(t *testing.T) {
	c := &Client{apiKey: "", baseURL: "https://api.deepseek.com", model: "deepseek-chat"}
	if c.Available() {
		t.Error("空 API key 时 Available 应返回 false")
	}
}

func TestAvailable_WithKey(t *testing.T) {
	c := &Client{apiKey: "sk-test-key", baseURL: "https://api.deepseek.com", model: "deepseek-chat"}
	if !c.Available() {
		t.Error("有效 API key 时 Available 应返回 true")
	}
}

func TestAvailable_PlaceholderKey(t *testing.T) {
	c := &Client{apiKey: "your-api-key-here", baseURL: "https://api.deepseek.com", model: "deepseek-chat"}
	if c.Available() {
		t.Error("占位符 API key 时 Available 应返回 false")
	}
}

func TestChat_MockServer(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			t.Errorf("期望 POST, 得到 %s", r.Method)
		}
		if r.Header.Get("Authorization") != "Bearer sk-test" {
			t.Errorf("期望 Authorization header, 得到 %s", r.Header.Get("Authorization"))
		}
		resp := ChatResponse{
			ID: "test-id",
			Choices: []struct {
				Message ChatMessage `json:"message"`
			}{
				{Message: ChatMessage{Role: "assistant", Content: "你好！有什么可以帮助你的？"}},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	c := &Client{apiKey: "sk-test", baseURL: server.URL, model: "deepseek-chat", httpClient: server.Client()}
	result, err := c.Chat("你是一个助手", "你好")
	if err != nil {
		t.Fatalf("Chat 失败: %v", err)
	}
	if result != "你好！有什么可以帮助你的？" {
		t.Errorf("期望 '你好！有什么可以帮助你的？', 得到 '%s'", result)
	}
}

func TestChat_NoAPIKey(t *testing.T) {
	c := &Client{apiKey: "", baseURL: "https://api.deepseek.com", model: "deepseek-chat"}
	_, err := c.Chat("system", "hello")
	if err == nil {
		t.Error("无 API key 时应返回错误")
	}
}

func TestAnalyzeComplaint_MockServer(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		resp := ChatResponse{
			Choices: []struct {
				Message ChatMessage `json:"message"`
			}{
				{Message: ChatMessage{Role: "assistant", Content: `{"category":"food_safety","urgency":"critical","refund_decision":"auto_refund","refund_amount":128.00,"reasoning":"食品安全投诉，需全额退款","confidence":0.95,"suggested_reply":"非常抱歉给您带来困扰"}`}},
			},
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	c := &Client{apiKey: "sk-test", baseURL: server.URL, model: "deepseek-chat", httpClient: server.Client()}
	result, err := c.AnalyzeComplaint("食物中有异物", "food_safety", 128.00)
	if err != nil {
		t.Fatalf("AnalyzeComplaint 失败: %v", err)
	}
	if result["category"] != "food_safety" {
		t.Errorf("期望 category=food_safety, 得到 %v", result["category"])
	}
	if result["refund_amount"] != 128.00 {
		t.Errorf("期望 refund_amount=128, 得到 %v", result["refund_amount"])
	}
	if result["model_used"] != "deepseek-chat" {
		t.Errorf("期望 model_used=deepseek-chat, 得到 %v", result["model_used"])
	}
}
