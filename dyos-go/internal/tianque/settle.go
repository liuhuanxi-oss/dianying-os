package tianque

type SettleAPI struct {
	client *Client
}

func NewSettleAPI(client *Client) *SettleAPI {
	return &SettleAPI{client: client}
}

func (api *SettleAPI) Query(data map[string]interface{}) (map[string]interface{}, error) {
	setDefault(data, "pageNo", "1")
	setDefault(data, "pageSize", "10")
	return api.client.Post("/query/settleQuery", data)
}

func (api *SettleAPI) QueryDetail(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/query/settleDetailQuery", data)
}
