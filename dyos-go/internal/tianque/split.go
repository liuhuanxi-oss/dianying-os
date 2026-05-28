package tianque

type SplitAPI struct {
	client *Client
}

func NewSplitAPI(client *Client) *SplitAPI {
	return &SplitAPI{client: client}
}

func (api *SplitAPI) Apply(data map[string]interface{}) (map[string]interface{}, error) {
	setDefault(data, "uuid", newReqID())
	setDefault(data, "ledgerAccountFlag", "01")
	return api.client.Post("/query/ledger/launchLedger", data)
}

func (api *SplitAPI) Query(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/query/ledger/queryLedger", data)
}

func (api *SplitAPI) SignAgreement(data map[string]interface{}) (map[string]interface{}, error) {
	setDefault(data, "signType", "01")
	return api.client.Post("/query/ledger/signAgreement", data)
}

func (api *SplitAPI) QueryAgreement(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/query/ledger/querySignAgreement", data)
}
