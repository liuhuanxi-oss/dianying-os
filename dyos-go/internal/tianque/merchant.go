package tianque

type MerchantAPI struct {
	client *Client
}

func NewMerchantAPI(client *Client) *MerchantAPI {
	return &MerchantAPI{client: client}
}

func (api *MerchantAPI) Apply(data map[string]interface{}) (map[string]interface{}, error) {
	setDefault(data, "operationalType", "01")
	setDefault(data, "haveLicenseNo", "01")
	setDefault(data, "mecTypeFlag", "00")
	setDefault(data, "identityTyp", "00")
	setDefault(data, "actTyp", "01")
	setDefault(data, "regProvCd", "110000000000")
	setDefault(data, "regCityCd", "110100000000")
	setDefault(data, "regDistCd", "110105000000")
	setDefault(data, "mccCd", "5311")
	if _, ok := data["qrcodeList"]; !ok {
		data["qrcodeList"] = []map[string]string{
			{"rateType": "01", "rate": "0.72"},
			{"rateType": "02", "rate": "0.72"},
			{"rateType": "06", "rate": "0.72"},
			{"rateType": "07", "rate": "0.72"},
		}
	}
	return api.client.Post("/merchant/income", data)
}

func (api *MerchantAPI) Query(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/merchant/incomeQuery", data)
}

func (api *MerchantAPI) Modify(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/merchant/updateMerchantInfo", data)
}

func (api *MerchantAPI) QueryInfo(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/merchant/merchantInfoQuery", data)
}

func (api *MerchantAPI) QueryAuditStatus(data map[string]interface{}) (map[string]interface{}, error) {
	return api.client.Post("/merchant/auditStatusQuery", data)
}

func setDefault(data map[string]interface{}, key string, value interface{}) {
	if data == nil {
		return
	}
	if current, ok := data[key]; !ok || current == nil || current == "" {
		data[key] = value
	}
}
