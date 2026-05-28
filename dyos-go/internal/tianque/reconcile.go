package tianque

type ReconcileAPI struct {
	client *Client
}

func NewReconcileAPI(client *Client) *ReconcileAPI {
	return &ReconcileAPI{client: client}
}

func (api *ReconcileAPI) Download(data map[string]interface{}) (map[string]interface{}, error) {
	setDefault(data, "billType", "01")
	return api.client.Post("/reconcile/downloadFile", data)
}
