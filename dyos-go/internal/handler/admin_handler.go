package handler

import (
	"net/http"
	"strconv"

	"dyos-go/internal/service"
	"dyos-go/pkg/response"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	service *service.AdminService
}

func NewAdminHandler(service *service.AdminService) *AdminHandler {
	return &AdminHandler{service: service}
}

func (h *AdminHandler) RegisterRoutes(group *gin.RouterGroup) {
	// M3 handlers (agent/sale/finance) now handle these routes
	_ = group.Group("/") // placeholder - admin handler methods preserved for reuse
}

func (h *AdminHandler) ListAgents(c *gin.Context) {
	result, err := h.service.ListAgents(page(c), size(c), c.Query("level"), c.Query("status"), c.Query("keyword"))
	respond(c, result, err, "获取代理商列表失败")
}
func (h *AdminHandler) AgentStats(c *gin.Context) {
	result, err := h.service.AgentStats()
	respond(c, result, err, "获取代理商统计失败")
}
func (h *AdminHandler) AgentDashboard(c *gin.Context) {
	result, err := h.service.AgentDashboard()
	respond(c, result, err, "获取代理商看板失败")
}
func (h *AdminHandler) ServiceProviders(c *gin.Context) {
	result, err := h.service.ServiceProviders(page(c), size(c), c.Query("qualification"))
	respond(c, result, err, "获取服务商列表失败")
}
func (h *AdminHandler) GetAgent(c *gin.Context) {
	id, ok := pathUint(c, "agent_id")
	if !ok {
		badID(c)
		return
	}
	result, err := h.service.GetAgent(id)
	respond(c, result, err, "获取代理商详情失败")
}
func (h *AdminHandler) AgentMerchants(c *gin.Context) {
	_, ok := pathUint(c, "agent_id")
	if !ok {
		badID(c)
		return
	}
	result, err := h.service.AgentMerchants(page(c), size(c))
	respond(c, result, err, "获取下级商户失败")
}
func (h *AdminHandler) AgentCommission(c *gin.Context) {
	id, ok := pathUint(c, "agent_id")
	if !ok {
		badID(c)
		return
	}
	result, err := h.service.AgentCommission(id)
	respond(c, result, err, "获取佣金信息失败")
}
func (h *AdminHandler) CreateAgent(c *gin.Context) {
	var req service.AgentCreateRequest
	if bind(c, &req) {
		id, err := h.service.CreateAgent(req)
		respond(c, gin.H{"id": id}, err, "创建代理商失败")
	}
}
func (h *AdminHandler) UpdateAgent(c *gin.Context) {
	id, ok := pathUint(c, "agent_id")
	if !ok {
		badID(c)
		return
	}
	var req service.AgentUpdateRequest
	if bind(c, &req) {
		respond(c, nil, h.service.UpdateAgent(id, req), "更新代理商失败")
	}
}
func (h *AdminHandler) DeleteAgent(c *gin.Context) {
	id, ok := pathUint(c, "agent_id")
	if !ok {
		badID(c)
		return
	}
	respond(c, nil, h.service.DeleteAgent(id), "删除代理商失败")
}

func (h *AdminHandler) ListSales(c *gin.Context) {
	result, err := h.service.ListSales(page(c), size(c), c.Query("status"), c.Query("region"))
	respond(c, result, err, "获取业务员列表失败")
}
func (h *AdminHandler) SalesStats(c *gin.Context) {
	result, err := h.service.SalesStats()
	respond(c, result, err, "获取业务员统计失败")
}
func (h *AdminHandler) GetSale(c *gin.Context) {
	id, ok := pathUint(c, "sales_id")
	if !ok {
		badID(c)
		return
	}
	result, err := h.service.GetSale(id)
	respond(c, result, err, "获取业务员详情失败")
}
func (h *AdminHandler) CreateSale(c *gin.Context) {
	var req service.SaleCreateRequest
	if bind(c, &req) {
		id, err := h.service.CreateSale(req)
		respond(c, gin.H{"id": id}, err, "创建业务员失败")
	}
}
func (h *AdminHandler) UpdateSale(c *gin.Context) {
	id, ok := pathUint(c, "sales_id")
	if !ok {
		badID(c)
		return
	}
	var req service.SaleCreateRequest
	if bind(c, &req) {
		respond(c, nil, h.service.UpdateSale(id, req), "更新业务员失败")
	}
}
func (h *AdminHandler) DeleteSale(c *gin.Context) {
	id, ok := pathUint(c, "sales_id")
	if !ok {
		badID(c)
		return
	}
	respond(c, nil, h.service.DeleteSale(id), "删除业务员失败")
}
func (h *AdminHandler) SalesPerformance(c *gin.Context) {
	result, err := h.service.SalesPerformance(c.Query("month"))
	respond(c, result, err, "获取业务员业绩失败")
}
func (h *AdminHandler) CustomerAssigns(c *gin.Context) {
	result, err := h.service.CustomerAssigns(page(c), size(c))
	respond(c, result, err, "获取客户分配列表失败")
}
func (h *AdminHandler) CreateCustomerAssign(c *gin.Context) {
	var req service.CustomerAssignRequest
	if bind(c, &req) {
		id, err := h.service.CreateCustomerAssign(req)
		respond(c, gin.H{"id": id}, err, "客户分配失败")
	}
}
func (h *AdminHandler) AssignSalesCustomers(c *gin.Context) { response.Success(c, nil) }
func (h *AdminHandler) SaleCustomers(c *gin.Context) {
	result, err := h.service.AgentMerchants(page(c), size(c))
	respond(c, result, err, "获取业务员客户失败")
}
func (h *AdminHandler) VisitRecords(c *gin.Context) {
	result, err := h.service.VisitRecords(page(c), size(c), c.Query("salesman"))
	respond(c, result, err, "获取跟访记录失败")
}
func (h *AdminHandler) CreateVisitRecord(c *gin.Context) {
	req := service.VisitCreateRequest{Merchant: c.Query("merchant"), Salesman: c.Query("salesman"), Type: c.Query("visit_type"), Content: c.Query("content"), NextVisit: c.Query("next_visit")}
	id, err := h.service.CreateVisitRecord(req)
	respond(c, gin.H{"id": id}, err, "创建跟访记录失败")
}

func (h *AdminHandler) RevenueTrend(c *gin.Context) {
	response.Success(c, h.service.RevenueTrend(queryInt(c, "months", 12)))
}
func (h *AdminHandler) RevenueStats(c *gin.Context) {
	result, err := h.service.RevenueStats()
	respond(c, result, err, "获取收入统计失败")
}
func (h *AdminHandler) ListBilling(c *gin.Context) {
	result, err := h.service.ListBilling(page(c), size(c), c.Query("status"), c.Query("merchant"))
	respond(c, result, err, "获取账单列表失败")
}
func (h *AdminHandler) GetBilling(c *gin.Context) {
	result, err := h.service.GetBilling(c.Param("bill_id"))
	respond(c, result, err, "获取账单详情失败")
}
func (h *AdminHandler) ConfirmBilling(c *gin.Context) {
	respond(c, nil, h.service.ConfirmBilling(c.Param("bill_id")), "确认账单失败")
}
func (h *AdminHandler) ListRefunds(c *gin.Context) {
	result, err := h.service.ListRefunds(page(c), size(c), c.Query("status"))
	respond(c, result, err, "获取退款列表失败")
}
func (h *AdminHandler) CreateRefundPlaceholder(c *gin.Context) { response.Success(c, nil) }
func (h *AdminHandler) ApproveRefund(c *gin.Context) {
	id, ok := pathUint(c, "refund_id")
	if !ok {
		badID(c)
		return
	}
	respond(c, nil, h.service.UpdateRefundStatus(id, "approved"), "审批退款失败")
}
func (h *AdminHandler) RejectRefund(c *gin.Context) {
	id, ok := pathUint(c, "refund_id")
	if !ok {
		badID(c)
		return
	}
	respond(c, nil, h.service.UpdateRefundStatus(id, "rejected"), "拒绝退款失败")
}
func (h *AdminHandler) ListInvoices(c *gin.Context) {
	result, err := h.service.ListInvoices(page(c), size(c), c.Query("status"))
	respond(c, result, err, "获取发票列表失败")
}
func (h *AdminHandler) CreateInvoice(c *gin.Context) {
	req := service.InvoiceCreateRequest{Merchant: c.Query("merchant"), Type: c.DefaultQuery("invoice_type", c.Query("type")), Amount: queryFloat(c, "amount", 0)}
	id, err := h.service.CreateInvoice(req)
	respond(c, gin.H{"id": id}, err, "创建发票失败")
}
func (h *AdminHandler) UpdateInvoice(c *gin.Context) {
	id, ok := pathUint(c, "invoice_id")
	if !ok {
		badID(c)
		return
	}
	respond(c, nil, h.service.UpdateInvoiceStatus(id, c.Query("status")), "更新发票失败")
}

func bind(c *gin.Context, req interface{}) bool {
	if err := c.ShouldBindJSON(req); err != nil {
		response.Error(c, http.StatusBadRequest, response.CodeBadRequest, "请求参数错误")
		return false
	}
	return true
}

func respond(c *gin.Context, data interface{}, err error, msg string) {
	if err != nil {
		response.Error(c, http.StatusInternalServerError, response.CodeServerError, msg)
		return
	}
	response.Success(c, data)
}

func pathUint(c *gin.Context, key string) (uint, bool) {
	value, err := strconv.ParseUint(c.Param(key), 10, 64)
	if err != nil || value == 0 {
		return 0, false
	}
	return uint(value), true
}

func badID(c *gin.Context) {
	response.Error(c, http.StatusBadRequest, response.CodeBadRequest, "ID无效")
}
func page(c *gin.Context) int { return queryInt(c, "page", 1) }
func size(c *gin.Context) int { return queryInt(c, "size", queryInt(c, "page_size", 20)) }
func queryInt(c *gin.Context, key string, fallback int) int {
	value, err := strconv.Atoi(c.DefaultQuery(key, strconv.Itoa(fallback)))
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}
func queryFloat(c *gin.Context, key string, fallback float64) float64 {
	value, err := strconv.ParseFloat(c.DefaultQuery(key, ""), 64)
	if err != nil {
		return fallback
	}
	return value
}
