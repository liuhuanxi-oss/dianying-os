import http from './index'

const scopePaths = {
  screen: '/ws/screen',
  chat: '/ws/chat',
  'reviews/alert': '/ws/reviews/alert',
}

/**
 * Open an admin-only real-time channel using a single-use, short-lived ticket.
 * Never put the JWT or ticket in the URL (which may be recorded in access logs).
 * Request a new ticket for each reconnect; tickets cannot be reused.
 */
export async function openAdminWebSocket(scope) {
  const path = scopePaths[scope]
  if (!path) throw new Error('Unsupported WebSocket scope')

  const { ticket } = await http.post('/admin/ws-ticket', { scope })
  if (!/^[0-9a-f]{64}$/.test(ticket || '')) {
    throw new Error('WebSocket ticket unavailable')
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsURL = `${protocol}//${window.location.host}${path}`
  return new WebSocket(wsURL, ['dyos-ws', `dyos-ticket.${ticket}`])
}
