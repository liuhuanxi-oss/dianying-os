package screen

import (
	"sync"
	"time"

	"dyos-go/internal/service"

	"github.com/gorilla/websocket"
)

type Hub struct {
	service *service.ScreenService
	clients map[*websocket.Conn]struct{}
	mu      sync.RWMutex
}

func NewHub(service *service.ScreenService) *Hub {
	return &Hub{service: service, clients: make(map[*websocket.Conn]struct{})}
}

func (h *Hub) Add(conn *websocket.Conn) {
	h.mu.Lock()
	h.clients[conn] = struct{}{}
	h.mu.Unlock()
	_ = conn.WriteJSON(h.service.TickMessage())
}

func (h *Hub) Remove(conn *websocket.Conn) {
	h.mu.Lock()
	delete(h.clients, conn)
	h.mu.Unlock()
	_ = conn.Close()
}

func (h *Hub) Run() {
	ticker := time.NewTicker(3 * time.Second)
	defer ticker.Stop()
	for range ticker.C {
		h.Broadcast(h.service.TickMessage())
	}
}

func (h *Hub) Broadcast(message map[string]interface{}) {
	h.mu.RLock()
	clients := make([]*websocket.Conn, 0, len(h.clients))
	for conn := range h.clients {
		clients = append(clients, conn)
	}
	h.mu.RUnlock()
	for _, conn := range clients {
		if err := conn.WriteJSON(message); err != nil {
			h.Remove(conn)
		}
	}
}

func (h *Hub) Count() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
