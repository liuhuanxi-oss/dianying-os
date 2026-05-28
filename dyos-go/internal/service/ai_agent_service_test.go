package service

import (
	"testing"
)

func TestNewAIAgentService(t *testing.T) {
	s := NewAIAgentService(nil)
	if s == nil {
		t.Fatal("NewAIAgentService 返回 nil")
	}
	if s.ai == nil {
		t.Error("DeepSeek 客户端不应为 nil")
	}
}

func TestListAgents(t *testing.T) {
	s := NewAIAgentService(nil)
	agents := s.ListAgents()
	if len(agents) != 5 {
		t.Errorf("期望 5 个 Agent, 得到 %d", len(agents))
	}
	expectedTypes := []string{"business", "marketing", "review", "supply_chain", "content"}
	for i, agent := range agents {
		if agent["type"] != expectedTypes[i] {
			t.Errorf("Agent[%d] 期望 type=%s, 得到 %v", i, expectedTypes[i], agent["type"])
		}
	}
}

func TestAIAgentService_Trigger(t *testing.T) {
	s := NewAIAgentService(nil)
	task, err := s.Trigger("review", map[string]interface{}{"title": "测试任务"})
	if err != nil {
		t.Fatalf("Trigger 失败: %v", err)
	}
	if task == nil {
		t.Fatal("Trigger 返回 nil task")
	}
	if task.AgentType != "review" {
		t.Errorf("期望 AgentType=review, 得到 %s", task.AgentType)
	}
	if task.Status != "pending" {
		t.Errorf("初始状态应为 pending, 得到 %s", task.Status)
	}
}

func TestAIAgentService_Trigger_InvalidType(t *testing.T) {
	s := NewAIAgentService(nil)
	task, err := s.Trigger("invalid_type", nil)
	if err != nil {
		t.Fatalf("Trigger 不应返回错误: %v", err)
	}
	if task == nil {
		t.Fatal("Trigger 返回 nil task")
	}
}

func TestListTasks_Empty(t *testing.T) {
	s := NewAIAgentService(nil)
	result, err := s.ListTasks("", 1, 20)
	if err != nil {
		t.Fatalf("ListTasks 失败: %v", err)
	}
	if result == nil {
		t.Fatal("result 不应为 nil")
	}
	items, ok := result["items"]
	if !ok {
		t.Fatal("items 缺失")
	}
	if items == nil {
		t.Fatal("items 不应为 nil")
	}
}

func TestGetTask_NoDB(t *testing.T) {
	s := NewAIAgentService(nil)
	_, err := s.GetTask(1)
	if err == nil {
		t.Error("无数据库时 GetTask 应返回错误")
	}
}

func TestAgentSteps(t *testing.T) {
	s := NewAIAgentService(nil)
	cases := map[string]int{
		"business":     7,
		"marketing":    7,
		"review":       6,
		"supply_chain": 7,
		"content":      6,
		"unknown":      3,
	}
	for agentType, expected := range cases {
		steps := s.agentSteps(agentType)
		if len(steps) != expected {
			t.Errorf("agentSteps(%s) 期望 %d 步, 得到 %d", agentType, expected, len(steps))
		}
	}
}

func TestTaskTitle(t *testing.T) {
	s := NewAIAgentService(nil)
	title := s.taskTitle("review", map[string]interface{}{"title": "分析昨日评价"})
	if title == "" {
		t.Error("taskTitle 不应返回空字符串")
	}
}

func TestGenerateResult_AllTypes(t *testing.T) {
	s := NewAIAgentService(nil)
	for _, agentType := range []string{"business", "marketing", "review", "supply_chain", "content"} {
		result := s.generateResult(agentType, "{}")
		if result == "" {
			t.Errorf("generateResult(%s) 不应返回空字符串", agentType)
		}
	}
}

func TestUpdateConfig_NoDB(t *testing.T) {
	s := NewAIAgentService(nil)
	err := s.UpdateConfig("review", map[string]interface{}{"enabled": false})
	if err == nil {
		t.Error("无数据库时 UpdateConfig 应返回错误")
	}
}
