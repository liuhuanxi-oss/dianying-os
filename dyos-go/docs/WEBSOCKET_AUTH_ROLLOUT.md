# WebSocket authentication rollout (admin only)

## Risk addressed

The Go server exposes `GET /ws/screen`, `GET /ws/chat`, and
`GET /ws/reviews/alert` for global real-time streams. An `Origin`
allowlist only protects cooperating browsers; it is **not** authentication.
These streams must not be opened by anonymous, agent or merchant sessions.

## Protocol

1. Admin signs in and receives their regular JWT.
2. Admin SPA makes `POST /api/admin/ws-ticket` with a Bearer header and
   `{"scope":"screen"}`, `{"scope":"chat"}`, or
   `{"scope":"reviews/alert"}`.
3. The API responds with a cryptographically random 256-bit `ticket`
   valid for 30 seconds, for exactly one endpoint and exactly one upgrade.
4. Browser connects with `new WebSocket(wsURL, ['dyos-ws',
   'dyos-ticket.' + ticket])`.
5. Server consumes and validates the ticket before upgrading, returning only
   the non-secret `dyos-ws` subprotocol. Ticket reuse fails.

The frontend helper `src/api/websocket.js` implements this handshake.
Every reconnection must obtain a fresh ticket; never place credentials in
the URL, localStorage, telemetry or diagnostics.

## Pre-merge compatibility gates

- Audit all deployed WebSocket clients, including older website assets and
  native scripts. The new endpoints intentionally reject anonymous,
  agent, merchant, and legacy header-only connections.
- Wire each active admin screen/chat/review client to the helper and verify
  a live connection, reconnection and disconnect. Merely adding the helper
  does not migrate callers automatically.
- Agent/merchant feeds need their **own tenant-scoped event hubs**, token
  issuing endpoints and separate authorization; never share global streams.
- The repository Nginx template contains a `location /ws/` block. The
  actual Baota vhost may differ: inspect it and confirm 101 Switching
  Protocols, forwarding `Upgrade`, `Connection`, `Origin`, and
  `Sec-WebSocket-Protocol`. Do not overwrite the running vhost from
  this template.
- The in-memory ticket store is valid only within one Go server process.
  Multi-instance deployments need a shared, atomic single-use ticket store.
- `DYOS_WS_ORIGINS` must enumerate any approved cross-origin web clients.
  Browser clients without an Origin header are rejected by origin checking.
- JWT/session revocation and online user status checks are not covered by
  the ticket layer. Keep this PR in draft until those risks are accepted or
  implemented.

## Acceptance matrix

- No ticket / forged ticket / expired ticket / replay: HTTP 401.
- Agent or merchant requesting a ticket: HTTP 403.
- Ticket obtained for screen applied to chat: HTTP 401; ticket consumed.
- Admin with valid ticket and allowed Origin: successful websocket upgrade.
- Disallowed browser Origin: upgrade rejected.
- Production Nginx routes traffic to the correct Go instance.
- No ticket appears in application access log query strings.
