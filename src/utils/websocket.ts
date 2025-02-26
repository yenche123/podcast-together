const wsUrl = `ws://${window.location.host}`

export function createWebSocket() {
  const ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    console.log('WebSocket 连接已建立')
  }

  ws.onclose = () => {
    console.log('WebSocket 连接已关闭')
  }

  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error)
  }

  return ws
}