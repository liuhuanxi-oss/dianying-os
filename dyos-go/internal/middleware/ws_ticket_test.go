package middleware

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"
    "time"

    jwtpkg "dyos-go/pkg/jwt"
    "github.com/gin-gonic/gin"
)

func TestWSTicketOnceScopeAndExpiry(t *testing.T) {
    m := NewWSTicketManager()
    key, err := m.create("screen", 42)
    if err != nil { t.Fatal(err) }
    if _, ok := m.consume(key, "chat"); ok { t.Fatal("scope confusion") }
    if _, ok := m.consume(key, "screen"); ok { t.Fatal("failed ticket must be spent") }
    key, err = m.create("screen", 42)
    if err != nil { t.Fatal(err) }
    user, ok := m.consume(key, "screen")
    if !ok || user != 42 { t.Fatalf("valid ticket rejected: %d %v", user, ok) }
    if _, ok := m.consume(key, "screen"); ok { t.Fatal("replayed ticket") }
    clock := time.Now()
    m.now = func() time.Time { return clock }
    expired, err := m.create("chat", 42)
    if err != nil { t.Fatal(err) }
    clock = clock.Add(ticketLifetime)
    if _, ok := m.consume(expired, "chat"); ok { t.Fatal("expired ticket accepted") }
}

func TestWSTicketAuthenticatedHandshake(t *testing.T) {
    gin.SetMode(gin.TestMode)
    jwtpkg.SetSecret(strings.Repeat("k", 40))
    m := NewWSTicketManager()
    r := gin.New()
    admin := r.Group("/api/admin")
    admin.Use(AdminAuth())
    admin.POST("/ws-ticket", m.IssueWS)
    ws := r.Group("/ws")
    ws.Use(m.RequireWSTicket())
    ws.GET("/screen", func(c *gin.Context) {
        if c.GetString("role") != "admin" || c.GetUint("user_id") != 100 {
            c.Status(http.StatusForbidden)
            return
        }
        c.Status(http.StatusOK)
    })
    create := func(role string, withToken bool) *httptest.ResponseRecorder {
        t.Helper()
        req := httptest.NewRequest(http.MethodPost, "/api/admin/ws-ticket", bytes.NewBufferString(`{"scope":"screen"}`))
        req.Header.Set("Content-Type", "application/json")
        if withToken {
            jwt, err := jwtpkg.Sign(jwtpkg.Claims{UserID: 100, Role: role})
            if err != nil { t.Fatal(err) }
            req.Header.Set("Authorization", "Bearer "+jwt)
        }
        w := httptest.NewRecorder()
        r.ServeHTTP(w, req)
        return w
    }
    if w := create("admin", false); w.Code != http.StatusUnauthorized { t.Fatalf("anonymous issue %d", w.Code) }
    if w := create("agent", true); w.Code != http.StatusForbidden { t.Fatalf("agent issue %d", w.Code) }
    issued := create("admin", true)
    if issued.Code != http.StatusOK { t.Fatalf("admin issue %d: %s", issued.Code, issued.Body.String()) }
    var body struct { Data struct { Ticket string `json:"ticket"` } `json:"data"` }
    if err := json.Unmarshal(issued.Body.Bytes(), &body); err != nil { t.Fatal(err) }
    if len(body.Data.Ticket) != 64 { t.Fatalf("unexpected ticket length %d: %s", len(body.Data.Ticket), issued.Body.String()) }
    handshake := func(protocol string) int {
        req := httptest.NewRequest(http.MethodGet, "/ws/screen", nil)
        if protocol != "" { req.Header.Set("Sec-WebSocket-Protocol", protocol) }
        w := httptest.NewRecorder()
        r.ServeHTTP(w, req)
        return w.Code
    }
    if status := handshake(""); status != http.StatusUnauthorized { t.Fatalf("anonymous websocket %d", status) }
    if status := handshake("dyos-ws, dyos-ticket."+body.Data.Ticket); status != http.StatusOK { t.Fatalf("valid ticket %d", status) }
    if status := handshake("dyos-ws, dyos-ticket."+body.Data.Ticket); status != http.StatusUnauthorized { t.Fatalf("replay %d", status) }
    second := create("admin", true)
    _ = json.Unmarshal(second.Body.Bytes(), &body)
    if status := handshake("dyos-ticket."+body.Data.Ticket); status != http.StatusUnauthorized { t.Fatalf("missing protocol %d", status) }
}
