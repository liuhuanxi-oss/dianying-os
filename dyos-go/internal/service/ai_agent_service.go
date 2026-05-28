package service

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"sync"
	"time"

	"dyos-go/internal/model"
	"dyos-go/pkg/deepseek"

	"gorm.io/gorm"
)

type AIAgentService struct {
	db     *gorm.DB
	mu     sync.Mutex
	running map[uint]chan struct{}
	ai     *deepseek.Client
}

func NewAIAgentService(db *gorm.DB) *AIAgentService {
	return &AIAgentService{
		db:      db,
		running: make(map[uint]chan struct{}),
		ai:      deepseek.NewClient(),
	}
}

var agentDefs = []map[string]interface{}{
	{"type": "business", "name": "经营分析Agent", "desc": "多维度经营数据分析，识别增长机会与成本优化点", "icon": "trending-up"},
	{"type": "marketing", "name": "营销策略Agent", "desc": "生成个性化营销方案，优化投放ROI", "icon": "target"},
	{"type": "review", "name": "评价管理Agent", "desc": "智能回复评价，情感分析与差警预警", "icon": "message-square"},
	{"type": "supply_chain", "name": "供应链Agent", "desc": "库存预测、采购建议、供应商评估", "icon": "truck"},
	{"type": "content", "name": "内容创作Agent", "desc": "自动生成多平台营销内容与海报", "icon": "pen-tool"},
}

func (s *AIAgentService) ListAgents() []map[string]interface{} {
	result := make([]map[string]interface{}, 0, len(agentDefs))
	for _, def := range agentDefs {
		agent := copyMap(def)
		total, running, lastTask := s.agentStats(def["type"].(string))
		agent["total_tasks"] = total
		agent["running_tasks"] = running
		if lastTask != nil {
			agent["last_task"] = lastTask
		}
		result = append(result, agent)
	}
	return result
}

func (s *AIAgentService) Trigger(agentType string, params map[string]interface{}) (*model.AIAgentTask, error) {
	paramsJSON, _ := json.Marshal(params)
	title := s.taskTitle(agentType, params)
	task := &model.AIAgentTask{
		AgentType: agentType,
		Title:     title,
		Status:    "pending",
		Progress:  0,
		Params:    string(paramsJSON),
		StartTime: time.Now().Format("2006-01-02 15:04:05"),
		CreatedAt: time.Now(),
	}
	if s.db != nil {
		if err := s.db.Create(task).Error; err != nil {
			return nil, err
		}
	} else {
		task.ID = uint(rand.Intn(9000) + 1000)
	}
	s.runTask(task)
	return task, nil
}

func (s *AIAgentService) ListTasks(agentType string, page, size int) (map[string]interface{}, error) {
	if size <= 0 {
		size = 20
	}
	if page <= 0 {
		page = 1
	}
	if s.db == nil {
		return map[string]interface{}{"items": []model.AIAgentTask{}, "total": int64(0), "page": page, "size": size}, nil
	}
	var tasks []model.AIAgentTask
	var total int64
	q := s.db.Model(&model.AIAgentTask{})
	if agentType != "" {
		q = q.Where("agent_type = ?", agentType)
	}
	q.Count(&total)
	if err := q.Order("id DESC").Offset((page - 1) * size).Limit(size).Find(&tasks).Error; err != nil {
		return nil, err
	}
	return map[string]interface{}{"items": tasks, "total": total, "page": page, "size": size}, nil
}

func (s *AIAgentService) GetTask(id uint) (*model.AIAgentTask, error) {
	var task model.AIAgentTask
	if s.db == nil {
		return nil, fmt.Errorf("数据库不可用")
	}
	if err := s.db.First(&task, id).Error; err != nil {
		return nil, err
	}
	return &task, nil
}

func (s *AIAgentService) CancelTask(id uint) error {
	s.mu.Lock()
	if ch, ok := s.running[id]; ok {
		close(ch)
		delete(s.running, id)
	}
	s.mu.Unlock()
	if s.db != nil {
		return s.db.Model(&model.AIAgentTask{}).Where("id = ?", id).Updates(map[string]interface{}{"status": "cancelled", "end_time": time.Now().Format("2006-01-02 15:04:05")}).Error
	}
	return nil
}

func (s *AIAgentService) GetConfig(agentType string) ([]model.AIAgentConfig, error) {
	if s.db == nil {
		configs := make([]model.AIAgentConfig, 0, len(agentDefs))
		for i, def := range agentDefs {
			configs = append(configs, model.AIAgentConfig{
				ID: uint(i + 1), AgentType: def["type"].(string), Enabled: true,
				Schedule: "manual", MaxRetries: 3, TimeoutSecs: 300, ModelName: "deepseek-v4",
			})
		}
		return configs, nil
	}
	var configs []model.AIAgentConfig
	q := s.db.Model(&model.AIAgentConfig{})
	if agentType != "" {
		q = q.Where("agent_type = ?", agentType)
	}
	if err := q.Find(&configs).Error; err != nil {
		return nil, err
	}
	if len(configs) == 0 {
		for _, def := range agentDefs {
			configs = append(configs, model.AIAgentConfig{
				AgentType: def["type"].(string), Enabled: true,
				Schedule: "manual", MaxRetries: 3, TimeoutSecs: 300, ModelName: "deepseek-v4",
			})
		}
	}
	return configs, nil
}

func (s *AIAgentService) UpdateConfig(agentType string, updates map[string]interface{}) error {
	if s.db == nil {
		return fmt.Errorf("数据库不可用")
	}
	var cfg model.AIAgentConfig
	if err := s.db.Where("agent_type = ?", agentType).First(&cfg).Error; err != nil {
		cfg = model.AIAgentConfig{AgentType: agentType, Enabled: true, Schedule: "manual", MaxRetries: 3, TimeoutSecs: 300}
		s.db.Create(&cfg)
	}
	return s.db.Model(&cfg).Updates(updates).Error
}

func (s *AIAgentService) runTask(task *model.AIAgentTask) {
	ch := make(chan struct{})
	s.mu.Lock()
	s.running[task.ID] = ch
	s.mu.Unlock()

	go func() {
		defer func() {
			s.mu.Lock()
			delete(s.running, task.ID)
			s.mu.Unlock()
		}()
		s.updateTask(task.ID, "running", 10)
		steps := s.agentSteps(task.AgentType)
		for i, step := range steps {
			select {
			case <-ch:
				return
			default:
			}
			delay := time.Duration(800+rand.Intn(1400)) * time.Millisecond
			time.Sleep(delay)
			progress := 10 + (i+1)*(70/len(steps))
			s.updateTask(task.ID, "running", progress)
			_ = step
		}

		// 调用 DeepSeek API 生成结果
		if s.ai.Available() {
			systemPrompt := s.buildSystemPrompt(task.AgentType)
			userPrompt := s.buildUserPrompt(task.AgentType, task.Params)
			result, err := s.ai.Chat(systemPrompt, userPrompt)
			if err == nil && result != "" {
				s.updateTask(task.ID, "running", 92)
				s.finishTask(task.ID, result)
				return
			}
			// 降级到模拟结果
			s.updateTask(task.ID, "running", 90)
		}

		result := s.generateResult(task.AgentType, task.Params)
		s.finishTask(task.ID, result)
	}()
}

func (s *AIAgentService) updateTask(id uint, status string, progress int) {
	if s.db == nil {
		return
	}
	s.db.Model(&model.AIAgentTask{}).Where("id = ?", id).Updates(map[string]interface{}{"status": status, "progress": progress})
}

func (s *AIAgentService) finishTask(id uint, result string) {
	if s.db == nil {
		return
	}
	s.db.Model(&model.AIAgentTask{}).Where("id = ?", id).Updates(map[string]interface{}{"status": "completed", "progress": 100, "result": result, "end_time": time.Now().Format("2006-01-02 15:04:05")})
}

func (s *AIAgentService) agentStats(agentType string) (int64, int64, *model.AIAgentTask) {
	if s.db == nil {
		return int64(rand.Intn(200)), int64(rand.Intn(5)), nil
	}
	var total, running int64
	s.db.Model(&model.AIAgentTask{}).Where("agent_type = ?", agentType).Count(&total)
	s.db.Model(&model.AIAgentTask{}).Where("agent_type = ? AND status = ?", agentType, "running").Count(&running)
	var last model.AIAgentTask
	s.db.Where("agent_type = ?", agentType).Order("id DESC").First(&last)
	if last.ID == 0 {
		return total, running, nil
	}
	return total, running, &last
}

func (s *AIAgentService) taskTitle(agentType string, params map[string]interface{}) string {
	prefix := ""
	for _, def := range agentDefs {
		if def["type"] == agentType {
			prefix = def["name"].(string)
			break
		}
	}
	if t, ok := params["title"].(string); ok && t != "" {
		return prefix + " - " + t
	}
	return prefix + " - 任务 " + time.Now().Format("15:04:05")
}

func (s *AIAgentService) agentSteps(agentType string) []string {
	switch agentType {
	case "business":
		return []string{"数据采集", "指标计算", "趋势分析", "异常检测", "机会识别", "策略生成", "报告输出"}
	case "marketing":
		return []string{"受众分析", "渠道评估", "创意生成", "预算分配", "A/B方案", "效果预测", "策略输出"}
	case "review":
		return []string{"评价拉取", "情感分析", "关键词提取", "回复草稿", "质量审核", "一键发布"}
	case "supply_chain":
		return []string{"库存扫描", "销量预测", "缺口计算", "供应商比价", "采购计划", "风险评估", "建议输出"}
	case "content":
		return []string{"热点捕捉", "选题策划", "文案创作", "图片生成", "多平台适配", "定时发布"}
	default:
		return []string{"分析中", "生成中", "完成"}
	}
}

func (s *AIAgentService) buildSystemPrompt(agentType string) string {
	switch agentType {
	case "business":
		return "你是专业的企业经营分析师，擅长数据驱动的经营诊断和增长建议。请基于提供的数据，输出结构化的经营分析报告，包含：健康度评分、关键亮点、风险预警、行动建议。用JSON格式返回。"
	case "marketing":
		return "你是资深营销策略专家，擅长制定精准的营销方案和渠道策略。请基于商户信息，输出营销策略方案，包含：营销主题、渠道分配、预算建议、预期ROI。用JSON格式返回。"
	case "review":
		return "你是专业的评价管理专家，擅长分析用户评价情感和生成个性化回复。请分析提供的评价内容，输出情感分析结果和回复建议。用JSON格式返回。"
	case "supply_chain":
		return "你是供应链管理专家，擅长库存预测和采购优化。请基于商户数据，输出供应链分析，包含：库存预警、采购建议、风险提示。用JSON格式返回。"
	case "content":
		return "你是资深社交媒体内容创作者，擅长为门店撰写小红书、抖音、大众点评等平台的营销内容。请创作有吸引力的内容，包含：标题、正文、话题标签、发布建议。用JSON格式返回。"
	default:
		return "你是门店运营AI助手，请基于用户需求输出专业的分析和建议。用JSON格式返回。"
	}
}

func (s *AIAgentService) buildUserPrompt(agentType string, paramsJSON string) string {
	switch agentType {
	case "business":
		return fmt.Sprintf("请基于以下门店运营数据进行分析，输出经营诊断报告（JSON格式）：\n%s", paramsJSON)
	case "marketing":
		return fmt.Sprintf("请为以下商户制定营销策略方案（JSON格式）：\n%s", paramsJSON)
	case "review":
		return fmt.Sprintf("请分析以下评价内容并生成回复建议（JSON格式）：\n%s", paramsJSON)
	case "supply_chain":
		return fmt.Sprintf("请分析以下库存数据并给出采购建议（JSON格式）：\n%s", paramsJSON)
	case "content":
		return fmt.Sprintf("请为以下门店创作社交媒体内容（JSON格式，支持多平台）：\n%s", paramsJSON)
	default:
		return fmt.Sprintf("请根据以下参数输出分析结果（JSON格式）：\n%s", paramsJSON)
	}
}

func (s *AIAgentService) generateResult(agentType string, paramsJSON string) string {
	results := map[string]interface{}{"generated_at": time.Now().Format("2006-01-02 15:04:05")}
	switch agentType {
	case "business":
		results["summary"] = "经营健康度评分 87/100，环比提升 3 分"
		results["highlights"] = []string{"客单价环比上升 5.2%", "午市翻台率接近上限建议扩位", "近 7 天差评集中在配送时效"}
		results["risks"] = []string{"华东区 3 家店连续 2 周 GMV 下滑", "库存周转天数 42 天（行业均值 28）"}
		results["recommendations"] = []map[string]interface{}{{"action": "推出「午市商务套餐」提升客单", "priority": "high", "impact": "预计增收 ¥12,000/月"}, {"action": "对华东区门店启动诊断并调整引流策略", "priority": "high", "impact": "挽回约 ¥8,000/周"}}
	case "marketing":
		results["campaign"] = "夏日清凉节·全场8折"
		results["channels"] = []map[string]interface{}{{"name": "抖音本地生活", "budget_pct": 40, "estimated_roi": 3.2}, {"name": "大众点评霸王餐", "budget_pct": 30, "estimated_roi": 2.8}, {"name": "小程序 push", "budget_pct": 30, "estimated_roi": 4.5}}
		results["total_budget"] = 15000
		results["estimated_revenue"] = 52000
	case "review":
		results["reviews_processed"] = 128
		results["sentiment"] = map[string]int{"positive": 92, "neutral": 24, "negative": 12}
		results["urgent"] = []map[string]interface{}{{"platform": "大众点评", "rating": 1, "content": "等了一个小时菜才上来，服务员态度还差", "reply": "非常抱歉给您带来不好的体验...已安排店长跟进，"}}
	case "supply_chain":
		results["items_flagged"] = 3
		results["suggestions"] = []map[string]interface{}{{"sku": "牛肉卷", "current_stock": 12, "suggested_order": 45, "urgency": "high"}, {"sku": "生菜", "current_stock": 8, "suggested_order": 30, "urgency": "medium"}}
	case "content":
		results["platforms"] = []string{"小红书", "抖音", "大众点评"}
		results["posts"] = []map[string]interface{}{{"platform": "小红书", "title": "藏在巷子里的宝藏火锅店🔥一周吃三次都不腻", "hashtags": []string{"#火锅探店", "#城市美食", "#宝藏店铺"}}, {"platform": "抖音", "script": "【开场】凌晨5点去菜市场...【中段】后厨秘制底料...", "duration": 45}}
	}
	data, _ := json.Marshal(results)
	return string(data)
}

func copyMap(src map[string]interface{}) map[string]interface{} {
	dst := make(map[string]interface{}, len(src))
	for k, v := range src {
		dst[k] = v
	}
	return dst
}
