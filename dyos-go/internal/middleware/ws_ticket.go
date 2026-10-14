package middleware

import (
    "crypto/rand"
    "encoding/hex"
    "net/http"
    "strings"
    "sync"
    "time"

    "dyos-go/pkg/response"
    "github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
)

// WSTicketManager issues single-use browser WebSocket credentials. Never put
// the JWT or ticket into a URL: proxy access logs commonly record query strings.
type WSTicketManager struct {
    mu sync.Mutex
    pending map[string]wsTicket
    now func() time.Time
}

type wsTicket struct {
    scope string
    userID uint
    expires time.Time
}

const ticketLifetime = 30 * time.Second
const maxPendingWSTickets = 2048
const wsTicketPrefix = "dyos-ticket."
const wsProtocol = "dyos-ws"

func NewWSTicketManager() *WSTicketManager {
    return &WSTicketManager{pending: make(map[string]wsTicket), now: time.Now}
}

func validWSScope(scope string) bool {
    switch scope {
    case "screen", "chat", "reviews/alert":
        return true
    }
    return false
}

func (m *WSTicketManager) create(scope string, userID uint) (string, error) {
    var b [32]byte
    if _, err := rand.Read(b[:]); err != nil {
        return "", err
    }
    token := hex.EncodeToString(b[:])
    m.mu.Lock()
    defer m.mu.Unlock()
    now := m.now()
    for key, v := range m.pending {
        if !now.Before(v.expires) { delete(m.pending, key) }
    }
    if len(m.pending) >= maxPendingWSTickets {
        return "", errTicketCapacity
    }
    m.pending[token] = wsTicket{scope: scope, userID: userID, expires: now.Add(ticketLifetime)}
    return token, nil
}

func (m *WSTicketManager) consume(token, scope string) (uint, bool) {
    m.mu.Lock()
    defer m.mu.Unlock()
    ticket, ok := m.pending[token]
    if !ok { return 0, false }
    // Reject retries regardless of the scope or expiry outcome.
    delete(m.pending, token)
    if !m.now().Before(ticket.expires) || ticket.scope != scope || ticket.userID == 0 {
        return 0, false
    }
    return ticket.userID, true
}

type ticketCapacityError struct{}
func (ticketCapacityError) Error() string { return "too many pending websocket tickets" }
var errTicketCapacity error = ticketCapacityError{}

// IssueWS is installed exclusively inside the admin-authenticated router group.
func (m *WSTicketManager) IssueWS(c *gin.Context) {
    if c.GetString("role") != "admin" || c.GetUint("user_id") == 0 {
        response.Error(c, http.StatusForbidden, response.CodeForbidden, "无权限申请实时连接凭证")
        return
    }
    var req struct { Scope string `json:"scope" binding:"required"` }
    if err := c.ShouldBindJSON(&req); err != nil || !validWSScope(req.Scope) {
        response.Error(c, http.StatusBadRequest, response.CodeBadRequest, "实时连接范围无效")
        return
    }
    token, err := m.create(req.Scope, c.GetUint("user_id"))
    if err != nil {
        response.Error(c, http.StatusServiceUnavailable, response.CodeServerError, "暂时无法创建实时连接")
        return
    }
    c.Header("Cache-Control", "no-store")
    response.Success(c, gin.H{"ticket": token, "scope": req.Scope, "expires_in": int(ticketLifetime.Seconds())})
}

// RequireWSTicket checks the subprotocol header before the websocket upgrade.
// The browser offers both "dyos-ws" and "dyos-ticket.<secret>"; the server
// negotiates only "dyos-ws" so the secret is not echoed in the response.
func (m *WSTicketManager) RequireWSTicket() gin.HandlerFunc {
    return func(c *gin.Context) {
        scope := strings.TrimPrefix(c.Request.URL.Path, "/ws/")
        if !validWSScope(scope) {
            response.Error(c, http.StatusForbidden, response.CodeForbidden, "不支持的实时连接")
            c.Abort()
            return
        }
        var ticket string
        var hasProtocol bool
        for _, candidate := range websocket.Subprotocols(c.Request) {
            if candidate == wsProtocol { hasProtocol = true }
            if strings.HasPrefix(candidate, wsTicketPrefix) {
                if ticket != "" { ticket = ""; break }
                ticket = strings.TrimPrefix(candidate, wsTicketPrefix)
            }
        }
        if !hasProtocol || len(ticket) != 64 {
            response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "缺少实时连接授权")
            c.Abort()
            return
        }
        userID, ok := m.consume(ticket, scope)
        if !ok {
            response.Error(c, http.StatusUnauthorized, response.CodeUnauthorized, "实时连接授权无效或已过期")
            c.Abort()
            return
        }
        c.Set("role", "admin")
        c.Set("user_id", userID)
        c.Next()
    }
}
