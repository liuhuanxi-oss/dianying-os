package deepseek

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

// Client DeepSeek API 客户端 (兼容 OpenAI 格式)
type Client struct {
	apiKey     string
	baseURL    string
	model      string
	httpClient *http.Client
}

// NewClient 创建 DeepSeek 客户端
func NewClient() *Client {
	apiKey := os.Getenv("DEEPSEEK_API_KEY")
	baseURL := os.Getenv("DEEPSEEK_BASE_URL")
	model := os.Getenv("DEEPSEEK_MODEL")

	if apiKey == "" {
		apiKey = os.Getenv("OPENAI_API_KEY")
	}
	if baseURL == "" {
		baseURL = "https://api.deepseek.com"
	}
	if model == "" {
		model = "deepseek-chat"
	}

	return &Client{
		apiKey:     apiKey,
		baseURL:    strings.TrimRight(baseURL, "/"),
		model:      model,
		httpClient: &http.Client{Timeout: 60 * time.Second},
	}
}

// ChatMessage 聊天消息
type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatRequest 聊天请求
type ChatRequest struct {
	Model       string        `json:"model"`
	Messages    []ChatMessage `json:"messages"`
	Temperature float64       `json:"temperature,omitempty"`
	MaxTokens   int           `json:"max_tokens,omitempty"`
}

// ChatResponse 聊天响应
type ChatResponse struct {
	ID      string `json:"id"`
	Choices []struct {
		Message ChatMessage `json:"message"`
	} `json:"choices"`
	Usage struct {
		TotalTokens int `json:"total_tokens"`
	} `json:"usage"`
}

// Available 检查 API Key 是否可用
func (c *Client) Available() bool {
	return c.apiKey != "" && c.apiKey != "your-api-key-here"
}

// Chat 发起聊天请求
func (c *Client) Chat(systemPrompt string, userMessage string) (string, error) {
	if !c.Available() {
		return "", fmt.Errorf("DeepSeek API Key 未配置")
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
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("DeepSeek API 请求失败: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return "", fmt.Errorf("DeepSeek API 返回错误: status=%d body=%s", resp.StatusCode, string(respBody))
	}

	var chatResp ChatResponse
	if err := json.Unmarshal(respBody, &chatResp); err != nil {
		return "", err
	}
	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("DeepSeek 返回空响应")
	}

	return chatResp.Choices[0].Message.Content, nil
}

// AnalyzeComplaint 分析投诉内容
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

	// 清理可能的 markdown 标记
	result = strings.TrimPrefix(result, "```json")
	result = strings.TrimPrefix(result, "```")
	result = strings.TrimSuffix(result, "```")
	result = strings.TrimSpace(result)

	var analysis map[string]interface{}
	if err := json.Unmarshal([]byte(result), &analysis); err != nil {
		return nil, fmt.Errorf("解析DeepSeek响应失败: %w, raw=%s", err, result)
	}

	analysis["model_used"] = c.model
	analysis["fallback_used"] = false
	return analysis, nil
}
