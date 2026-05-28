package handler

import (
	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type AdminV1Handler struct {
	service *service.AdminV1Service
}

func NewAdminV1Handler(service *service.AdminV1Service) *AdminV1Handler {
	return &AdminV1Handler{service: service}
}

func (h *AdminV1Handler) RegisterRoutes(group *gin.RouterGroup) {
	content := group.Group("/content")
	{
		content.GET("/knowledge", h.ListKnowledge)
		content.GET("/knowledge/:article_id", h.GetKnowledge)
		content.POST("/knowledge", h.CreateKnowledge)
		content.PUT("/knowledge/:article_id", h.UpdateKnowledge)
		content.GET("/ai-templates", h.AITemplates)
		content.GET("/announcements", h.ListAnnouncements)
		content.POST("/announcements", h.CreateAnnouncement)
		content.PUT("/announcements/:announcement_id", h.UpdateAnnouncement)
		content.DELETE("/announcements/:announcement_id", h.DeleteAnnouncement)
		content.GET("/activities", h.ListActivities)
		content.POST("/activities", h.CreateActivity)
		content.PUT("/activities/:activity_id", h.UpdateActivity)
	}

	analytics := group.Group("/analytics")
	{
		analytics.GET("/overview", h.AnalyticsOverview)
		analytics.GET("/gmv-trend", h.GMVTrend)
		analytics.GET("/industry-report", h.IndustryReport)
		analytics.GET("/ai-stats", h.AIStats)
		analytics.GET("/churn-warning", h.ChurnWarnings)
		analytics.GET("/churn-warning/:warning_id", h.ChurnWarningDetail)
		analytics.POST("/churn-warning/:warning_id/handle", h.HandleChurnWarning)
	}

	payment := group.Group("/payment")
	{
		payment.GET("/channels", h.PaymentChannels)
		payment.GET("/channels/:channel_name", h.PaymentChannels)
		payment.PUT("/channels/:channel_name", h.UpdatePaymentChannel)
		payment.GET("/transactions", h.PaymentTransactions)
		payment.GET("/transactions/:transaction_id", h.PaymentTransactionDetail)
		payment.GET("/fee-config", h.PaymentPricing)
		payment.PUT("/fee-config/:version", h.UpdatePaymentPricing)
		payment.GET("/split-payment", h.SplitPayment)
		payment.GET("/reconciliation", h.Reconciliation)
		payment.POST("/reconciliation/settle", h.SettleReconciliation)
	}

	customer := group.Group("/customer")
	{
		customer.GET("/onboarding", h.Onboarding)
		customer.GET("/onboarding/:merchant_id", h.OnboardingDetail)
		customer.GET("/health-score", h.HealthScore)
		customer.GET("/renewal", h.Renewal)
		customer.POST("/renewal/:merchant_id", h.RenewalAction)
		customer.GET("/upgrade-funnel", h.UpgradeFunnel)
		customer.GET("/wake-up", h.WakeUp)
		customer.POST("/wake-up/:task_id/send", h.WakeUpSend)
	}

	channel := group.Group("/channel")
	{
		channel.GET("/analysis", h.ChannelAnalysis)
		channel.GET("/invite-fission", h.InviteFission)
		channel.GET("/trial", h.Trial)
		channel.GET("/partners", h.ListPartners)
		channel.POST("/partners", h.CreatePartner)
	}

	support := group.Group("/support")
	{
		support.GET("/tickets", h.ListTickets)
		support.POST("/tickets", h.CreateTicket)
		support.PUT("/tickets/:ticket_id", h.UpdateTicket)
		support.GET("/faq", h.ListFAQ)
		support.POST("/faq", h.CreateFAQ)
		support.GET("/satisfaction", h.Satisfaction)
	}

	product := group.Group("/product")
	{
		product.GET("/feature-flags", h.FeatureFlags)
		product.PUT("/feature-flags/:flag_id", h.UpdateFeatureFlag)
		product.GET("/ab-test", h.ABTests)
		product.POST("/ab-test", h.CreateABTest)
		product.GET("/requirements", h.Requirements)
		product.POST("/requirements/:req_id/vote", h.VoteRequirement)
		product.GET("/versions", h.Versions)
	}

	security := group.Group("/security")
	{
		security.GET("/login-security", h.LoginSecurity)
		security.POST("/login-security/:log_id/handle", h.HandleLoginSecurity)
		security.GET("/data-masking", h.DataMasking)
		security.PUT("/data-masking/:rule_id", h.UpdateDataMasking)
		security.GET("/compliance", h.Compliance)
	}

	settings := group.Group("/settings")
	{
		settings.GET("/roles", h.ListRoles)
		settings.POST("/roles", h.CreateRole)
		settings.PUT("/roles/:role_id", h.UpdateRole)
		settings.GET("/operation-logs", h.OperationLogs)
		settings.GET("/pricing", h.SettingsPricing)
		settings.PUT("/pricing/:version", h.UpdateSettingsPricing)
		settings.GET("/notifications", h.Notifications)
		settings.POST("/notifications/:notification_id/read", h.ReadNotification)
	}
}

func (h *AdminV1Handler) ListKnowledge(c *gin.Context) {
	result, err := h.service.ListKnowledge(page(c), size(c), c.Query("category"), c.Query("status"))
	respond(c, result, err, "获取知识库失败")
}
func (h *AdminV1Handler) GetKnowledge(c *gin.Context) {
	id, ok := pathUint(c, "article_id")
	if !ok {
		badID(c)
		return
	}
	result, err := h.service.GetKnowledge(id)
	respond(c, result, err, "获取知识详情失败")
}
func (h *AdminV1Handler) CreateKnowledge(c *gin.Context) {
	id, err := h.service.CreateKnowledge(c.Query("title"), c.Query("category"), c.Query("content"))
	respond(c, gin.H{"id": id}, err, "创建知识失败")
}
func (h *AdminV1Handler) UpdateKnowledge(c *gin.Context) {
	id, ok := pathUint(c, "article_id")
	if !ok {
		badID(c)
		return
	}
	respond(c, nil, h.service.UpdateKnowledgeStatus(id, c.Query("status")), "更新知识失败")
}
func (h *AdminV1Handler) AITemplates(c *gin.Context) {
	result, err := h.service.ListAITemplates(page(c), size(c), c.Query("category"))
	respond(c, result, err, "获取AI模板失败")
}
func (h *AdminV1Handler) ListAnnouncements(c *gin.Context) {
	result, err := h.service.ListAnnouncements(page(c), size(c), c.Query("status"))
	respond(c, result, err, "获取公告失败")
}
func (h *AdminV1Handler) CreateAnnouncement(c *gin.Context) {
	var req service.AnnouncementRequest
	if bind(c, &req) {
		id, err := h.service.CreateAnnouncement(req)
		respond(c, gin.H{"id": id}, err, "创建公告失败")
	}
}
func (h *AdminV1Handler) UpdateAnnouncement(c *gin.Context) {
	id, ok := pathUint(c, "announcement_id")
	if !ok {
		badID(c)
		return
	}
	var req service.AnnouncementRequest
	if bind(c, &req) {
		respond(c, nil, h.service.UpdateAnnouncement(id, req), "更新公告失败")
	}
}
func (h *AdminV1Handler) DeleteAnnouncement(c *gin.Context) {
	id, ok := pathUint(c, "announcement_id")
	if !ok {
		badID(c)
		return
	}
	respond(c, nil, h.service.DeleteAnnouncement(id), "删除公告失败")
}
func (h *AdminV1Handler) ListActivities(c *gin.Context) {
	result, err := h.service.ListActivities(page(c), size(c), c.Query("status"))
	respond(c, result, err, "获取活动失败")
}
func (h *AdminV1Handler) CreateActivity(c *gin.Context) {
	var req service.ActivityRequest
	if bind(c, &req) {
		id, err := h.service.CreateActivity(req)
		respond(c, gin.H{"id": id}, err, "创建活动失败")
	}
}
func (h *AdminV1Handler) UpdateActivity(c *gin.Context) {
	id, ok := pathUint(c, "activity_id")
	if !ok {
		badID(c)
		return
	}
	var req service.ActivityRequest
	if bind(c, &req) {
		respond(c, nil, h.service.UpdateActivity(id, req), "更新活动失败")
	}
}

func (h *AdminV1Handler) AnalyticsOverview(c *gin.Context) {
	result, err := h.service.AnalyticsOverview()
	respond(c, result, err, "获取数据总览失败")
}
func (h *AdminV1Handler) GMVTrend(c *gin.Context) {
	response.Success(c, h.service.GMVTrend(queryInt(c, "months", 12)))
}
func (h *AdminV1Handler) IndustryReport(c *gin.Context) {
	response.Success(c, h.service.IndustryReport())
}
func (h *AdminV1Handler) AIStats(c *gin.Context) { response.Success(c, h.service.AIStats()) }
func (h *AdminV1Handler) ChurnWarnings(c *gin.Context) {
	result, err := h.service.ListChurnWarnings(page(c), size(c), queryInt(c, "threshold", 0))
	respond(c, result, err, "获取流失预警失败")
}
func (h *AdminV1Handler) ChurnWarningDetail(c *gin.Context) {
	id, ok := pathUint(c, "warning_id")
	if !ok {
		badID(c)
		return
	}
	result, err := h.service.GetChurnWarning(id)
	respond(c, result, err, "获取预警详情失败")
}
func (h *AdminV1Handler) HandleChurnWarning(c *gin.Context) {
	response.Success(c, gin.H{"action": c.Query("action")})
}

func (h *AdminV1Handler) PaymentChannels(c *gin.Context) {
	result, err := h.service.ListPaymentChannels()
	respond(c, result, err, "获取支付通道失败")
}
func (h *AdminV1Handler) UpdatePaymentChannel(c *gin.Context) {
	respond(c, nil, h.service.UpdatePaymentChannel(c.Param("channel_name"), c.Query("status"), queryFloat(c, "fee", 0)), "更新支付通道失败")
}
func (h *AdminV1Handler) PaymentTransactions(c *gin.Context) {
	result, err := h.service.ListPaymentTransactions(page(c), size(c), c.Query("status"), c.Query("merchant"))
	respond(c, result, err, "获取交易流水失败")
}
func (h *AdminV1Handler) PaymentTransactionDetail(c *gin.Context) {
	result, err := h.service.GetPaymentTransaction(c.Param("transaction_id"))
	respond(c, result, err, "获取交易详情失败")
}
func (h *AdminV1Handler) PaymentPricing(c *gin.Context) {
	result, err := h.service.ListPricing()
	respond(c, result, err, "获取费率配置失败")
}
func (h *AdminV1Handler) UpdatePaymentPricing(c *gin.Context) {
	respond(c, nil, h.service.UpdatePricing(c.Param("version"), queryFloat(c, "price", 0), c.Query("features")), "更新费率配置失败")
}
func (h *AdminV1Handler) SplitPayment(c *gin.Context) {
	response.Success(c, h.service.SplitPayment(page(c), size(c)))
}
func (h *AdminV1Handler) Reconciliation(c *gin.Context) {
	response.Success(c, h.service.Reconciliation(c.Query("month")))
}
func (h *AdminV1Handler) SettleReconciliation(c *gin.Context) {
	response.Success(c, gin.H{"agent": c.Query("agent"), "month": c.Query("month")})
}

func (h *AdminV1Handler) Onboarding(c *gin.Context) {
	response.Success(c, h.service.Onboarding(page(c), size(c)))
}
func (h *AdminV1Handler) OnboardingDetail(c *gin.Context) {
	id, ok := pathUint(c, "merchant_id")
	if !ok {
		badID(c)
		return
	}
	response.Success(c, h.service.OnboardingDetail(id))
}
func (h *AdminV1Handler) HealthScore(c *gin.Context) {
	response.Success(c, h.service.HealthScore(page(c), size(c), queryInt(c, "threshold", 0)))
}
func (h *AdminV1Handler) Renewal(c *gin.Context) {
	response.Success(c, h.service.Renewal(page(c), size(c), queryInt(c, "days_threshold", 30)))
}
func (h *AdminV1Handler) RenewalAction(c *gin.Context) { response.Success(c, nil) }
func (h *AdminV1Handler) UpgradeFunnel(c *gin.Context) {
	response.Success(c, h.service.UpgradeFunnel())
}
func (h *AdminV1Handler) WakeUp(c *gin.Context) {
	response.Success(c, h.service.WakeUp(page(c), size(c)))
}
func (h *AdminV1Handler) WakeUpSend(c *gin.Context) { response.Success(c, nil) }

func (h *AdminV1Handler) ChannelAnalysis(c *gin.Context) {
	result, err := h.service.ChannelAnalysis()
	respond(c, result, err, "获取渠道分析失败")
}
func (h *AdminV1Handler) InviteFission(c *gin.Context) {
	response.Success(c, h.service.InviteFission())
}
func (h *AdminV1Handler) Trial(c *gin.Context) { response.Success(c, h.service.Trial()) }
func (h *AdminV1Handler) ListPartners(c *gin.Context) {
	result, err := h.service.ListPartners(page(c), size(c), c.Query("status"))
	respond(c, result, err, "获取合作伙伴失败")
}
func (h *AdminV1Handler) CreatePartner(c *gin.Context) {
	var req service.PartnerRequest
	if bind(c, &req) {
		id, err := h.service.CreatePartner(req)
		respond(c, gin.H{"id": id}, err, "创建合作伙伴失败")
	}
}

func (h *AdminV1Handler) ListTickets(c *gin.Context) {
	result, err := h.service.ListTickets(page(c), size(c), c.Query("status"), c.Query("priority"))
	respond(c, result, err, "获取工单失败")
}
func (h *AdminV1Handler) CreateTicket(c *gin.Context) {
	var req service.TicketRequest
	if bind(c, &req) {
		id, err := h.service.CreateTicket(req)
		respond(c, gin.H{"id": id}, err, "创建工单失败")
	}
}
func (h *AdminV1Handler) UpdateTicket(c *gin.Context) {
	var req service.TicketUpdateRequest
	if bind(c, &req) {
		respond(c, nil, h.service.UpdateTicket(c.Param("ticket_id"), req), "更新工单失败")
	}
}
func (h *AdminV1Handler) ListFAQ(c *gin.Context) {
	result, err := h.service.ListFAQ(page(c), size(c), c.Query("category"))
	respond(c, result, err, "获取FAQ失败")
}
func (h *AdminV1Handler) CreateFAQ(c *gin.Context) {
	var req service.FAQRequest
	if bind(c, &req) {
		id, err := h.service.CreateFAQ(req)
		respond(c, gin.H{"id": id}, err, "创建FAQ失败")
	}
}
func (h *AdminV1Handler) Satisfaction(c *gin.Context) { response.Success(c, h.service.Satisfaction()) }

func (h *AdminV1Handler) FeatureFlags(c *gin.Context) {
	result, err := h.service.ListFeatureFlags(page(c), size(c), c.Query("status"))
	respond(c, result, err, "获取功能开关失败")
}
func (h *AdminV1Handler) UpdateFeatureFlag(c *gin.Context) {
	id, ok := pathUint(c, "flag_id")
	if !ok {
		badID(c)
		return
	}
	respond(c, nil, h.service.UpdateFeatureFlag(id, c.Query("status")), "更新功能开关失败")
}
func (h *AdminV1Handler) ABTests(c *gin.Context) {
	response.Success(c, h.service.ABTests(page(c), size(c)))
}
func (h *AdminV1Handler) CreateABTest(c *gin.Context) {
	var req service.ABTestRequest
	if bind(c, &req) {
		response.Success(c, h.service.CreateABTest(req))
	}
}
func (h *AdminV1Handler) Requirements(c *gin.Context) {
	result, err := h.service.ListRequirements(page(c), size(c), c.Query("status"))
	respond(c, result, err, "获取需求池失败")
}
func (h *AdminV1Handler) VoteRequirement(c *gin.Context) {
	id, ok := pathUint(c, "req_id")
	if !ok {
		badID(c)
		return
	}
	respond(c, nil, h.service.VoteRequirement(id), "投票失败")
}
func (h *AdminV1Handler) Versions(c *gin.Context) {
	result, err := h.service.ListVersions(page(c), size(c))
	respond(c, result, err, "获取版本列表失败")
}

func (h *AdminV1Handler) LoginSecurity(c *gin.Context) {
	result, err := h.service.ListLoginLogs(page(c), size(c), c.Query("status"))
	respond(c, result, err, "获取登录安全日志失败")
}
func (h *AdminV1Handler) HandleLoginSecurity(c *gin.Context) { response.Success(c, nil) }
func (h *AdminV1Handler) DataMasking(c *gin.Context) {
	response.Success(c, gin.H{"rules": h.service.DataMaskingRules()})
}
func (h *AdminV1Handler) UpdateDataMasking(c *gin.Context) { response.Success(c, nil) }
func (h *AdminV1Handler) Compliance(c *gin.Context) {
	response.Success(c, h.service.Compliance(page(c), size(c)))
}

func (h *AdminV1Handler) ListRoles(c *gin.Context) {
	result, err := h.service.ListRoles(page(c), size(c))
	respond(c, result, err, "获取角色失败")
}
func (h *AdminV1Handler) CreateRole(c *gin.Context) {
	var req service.RoleRequest
	if bind(c, &req) {
		id, err := h.service.CreateRole(req)
		respond(c, gin.H{"id": id}, err, "创建角色失败")
	}
}
func (h *AdminV1Handler) UpdateRole(c *gin.Context) {
	id, ok := pathUint(c, "role_id")
	if !ok {
		badID(c)
		return
	}
	var req service.RoleRequest
	if bind(c, &req) {
		respond(c, nil, h.service.UpdateRole(id, req), "更新角色失败")
	}
}
func (h *AdminV1Handler) OperationLogs(c *gin.Context) {
	result, err := h.service.ListOperationLogs(page(c), size(c), c.Query("operator"), c.Query("type"))
	respond(c, result, err, "获取操作日志失败")
}
func (h *AdminV1Handler) SettingsPricing(c *gin.Context) {
	result, err := h.service.ListPricing()
	respond(c, result, err, "获取定价失败")
}
func (h *AdminV1Handler) UpdateSettingsPricing(c *gin.Context) {
	respond(c, nil, h.service.UpdatePricing(c.Param("version"), queryFloat(c, "price", 0), c.Query("features")), "更新定价失败")
}
func (h *AdminV1Handler) Notifications(c *gin.Context) {
	response.Success(c, h.service.Notifications(page(c), size(c), c.Query("status")))
}
func (h *AdminV1Handler) ReadNotification(c *gin.Context) { response.Success(c, nil) }
