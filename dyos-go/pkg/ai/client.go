package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

type Backend string

const (
	BackendDeepSeek Backend = "deepseek"
	BackendQwen     Backend = "qwen"
	BackendOpenAI   Backend = "openai"
)

type Client struct {
	apiKey     string
	baseURL    string
	model      string
	backend    Backend
	httpClient *http.Client
}

func NewClient() *Client {
	backend := Backend(os.Getenv("AI_BACKEND"))
	if backend == "" {
		backend = detectBackend()
	}

	apiKey := os.Getenv("AI_API_KEY")
	baseURL := os.Getenv("AI_BASE_URL")
	model := os.Getenv("AI_MODEL")

	// 向后兼容旧的 DeepSeek 环境变量
	if apiKey == "" {
		apiKey = os.Getenv("DEEPSEEK_API_KEY")
	}
	if apiKey == "" {
		apiKey = os.Getenv("OPENAI_API_KEY")
	}
	if baseURL == "" {
		baseURL = defaultBaseURL(backend)
	}
	if model == "" {
		model = defaultModel(backend)
	}

	return &Client{
		apiKey:     apiKey,
		baseURL:    strings.TrimRight(baseURL, "/"),
		model:      model,
		backend:    backend,
		httpClient: &http.Client{Timeout: 120 * time.Second},
	}
}

func detectBackend() Backend {
	if os.Getenv("DEEPSEEK_API_KEY") != "" || os.Getenv("DEEPSEEK_BASE_URL") != "" {
		return BackendDeepSeek
	}
	if os.Getenv("QWEN_LOCAL") == "true" || os.Getenv("OPENCLAW_NAS") == "true" {
		return BackendQwen
	}
	return BackendDeepSeek
}

func defaultBaseURL(b Backend) string {
	switch b {
	case BackendQwen:
		return "http://127.0.0.1:8000"
	case BackendOpenAI:
		return "https://api.openai.com"
	default:
		return "https://api.deepseek.com"
	}
}

func defaultModel(b Backend) string {
	switch b {
	case BackendQwen:
		return "qwen2.5:7b"
	case BackendOpenAI:
		return "gpt-4o"
	default:
		return "deepseek-chat"
	}
}

func (c *Client) Backend() Backend    { return c.backend }
func (c *Client) Model() string       { return c.model }
func (c *Client) IsLocal() bool       { return c.backend == BackendQwen }

func (c *Client) Available() bool {
	if c.backend == BackendQwen {
		return true
	}
	return c.apiKey != "" && c.apiKey != "your-api-key-here"
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Model       string        `json:"model"`
	Messages    []ChatMessage `json:"messages"`
	Temperature float64       `json:"temperature,omitempty"`
	MaxTokens   int           `json:"max_tokens,omitempty"`
}

type ChatResponse struct {
	ID      string `json:"id"`
	Choices []struct {
		Message ChatMessage `json:"message"`
	} `json:"choices"`
	Usage struct {
		TotalTokens int `json:"total_tokens"`
	} `json:"usage"`
}

func (c *Client) Chat(systemPrompt string, userMessage string) (string, error) {
	if !c.Available() {
		return "", fmt.Errorf("AI 客户端未配置: backend=%s", c.backend)
	}

	messages := []ChatMessage{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: userMessage},
	}

	reqBody := ChatRequest{
		Model:       c.model,
		Messages:    messages,
		Temperature: 0.3,
		MaxTokens:   1024,
	}

	body, _ := json.Marshal(reqBody)
	req, err := http.NewRequest("POST", c.baseURL+"/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("AI API 请求失败 [%s]: %w", c.backend, err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return "", fmt.Errorf("AI API 错误 [%s]: status=%d body=%s", c.backend, resp.StatusCode, string(respBody))
	}

	var chatResp ChatResponse
	if err := json.Unmarshal(respBody, &chatResp); err != nil {
		return "", err
	}
	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("AI 返回空响应 [%s]", c.backend)
	}

	return chatResp.Choices[0].Message.Content, nil
}

func (c *Client) AnalyzeComplaint(content string, complaintType string, amount float64) (map[string]interface{}, error) {
	systemPrompt := `你是支付投诉分析专家。请分析以下投诉，返回JSON格式：
{
  "category": "food_safety|duplicate_charge|no_service|service_attitude|price_dispute|refund_delay|other",
  "urgency": "critical|high|normal",
  "refund_decision": "auto_refund|auto_refund_partial|manual_review|escalate|reject",
  "refund_amount": 0.00,
  "reasoning": "分析理由",
  "confidence": 0.0-1.0,
  "suggested_reply": "建议回复内容"
}
规则：
- 食品安全/诈骗/重复扣款 → critical, auto_refund
- 未收到服务 → high, auto_refund
- 服务态度 → normal, manual_review
- 退款延迟 → high, auto_refund_partial
- 价格争议 → normal, manual_review
- 仅返回JSON，不要有其他文字`

	userMessage := fmt.Sprintf("投诉内容: %s\n投诉类型: %s\n涉及金额: %.2f", content, complaintType, amount)
	result, err := c.Chat(systemPrompt, userMessage)
	if err != nil {
		return nil, err
	}

	result = strings.TrimPrefix(result, "```json")
	result = strings.TrimPrefix(result, "```")
	result = strings.TrimSuffix(result, "```")
	result = strings.TrimSpace(result)

	var analysis map[string]interface{}
	if err := json.Unmarshal([]byte(result), &analysis); err != nil {
		return nil, fmt.Errorf("解析AI响应失败: %w, raw=%s", err, result)
	}

	analysis["model_used"] = c.model
	analysis["backend"] = string(c.backend)
	analysis["local_inference"] = c.IsLocal()
	return analysis, nil
}
