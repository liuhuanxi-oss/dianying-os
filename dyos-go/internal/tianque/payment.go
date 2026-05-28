package tianque

import (
	"fmt"
	"time"
)

func nowMillis() int64 {
	return time.Now().UnixMilli()
}

type PaymentAPI struct {
	client *Client
}

func NewPaymentAPI(client *Client) *PaymentAPI {
	return &PaymentAPI{client: client}
}

func (api *PaymentAPI) CreateScanPay(data map[string]interface{}) (map[string]interface{}, error) {
	setDefault(data, "mno", api.client.orgID)
	setDefault(data, "ordNo", fmt.Sprintf("T%d", nowMillis()))
	setDefault(data, "subject", "订单支付")
	setDefault(data, "trmIp", "127.0.0.1")
	setDefault(data, "timeExpire", "5")
	setDefault(data, "ledgerAccountFlag", "01")
	return api.client.Post("/order/activePlusScan", data)
}

func (api *PaymentAPI) ReverseScan(data map[string]interface{}) (map[string]interface{}, error) {
	setDefault(data, "mno", api.client.orgID)
	setDefault(data, "ordNo", fmt.Sprintf("T%d", nowMillis()))
	setDefault(data, "subject", "订单支付")
	setDefault(data, "trmIp", "127.0.0.1")
	return api.client.Post("/order/reverseScan", data)
}

func (api *PaymentAPI) Query(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/query/tradeQuery", data)
}

func (api *PaymentAPI) Refund(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/order/refund", data)
}

func (api *PaymentAPI) RefundQuery(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/query/refundQuery", data)
}

func (api *PaymentAPI) Close(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/order/close", data)
}

func (api *PaymentAPI) FeeQuery(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/query/feeQuery", data)
}
