import util from "../../../utils/util"
import { WsMsgRes } from "../../../type/type-room-page"

interface WsCallbacks {
  onopen?: (socket: Event) => void
  onmessage?: (res: WsMsgRes) => void
  onclose?: (res: CloseEvent) => void
  onerror?: (res: Event) => void
}

export function initWebSocket(callbacks: WsCallbacks) {
  const _env = util.getEnv()
  const { WEBSOCKET_URL } = _env
  console.log(`start init websocket: ${WEBSOCKET_URL}`)
  
  const connect = () => {
    const ws = new WebSocket(WEBSOCKET_URL)
    
    ws.onopen = (socket: Event) => {
      console.log("ws opened.........")
      callbacks.onopen?.(socket)
    }

    ws.onerror = (error: Event) => {
      const wsError = error.target as WebSocket;
      console.log("WebSocket 错误详情:", {
        readyState: wsError.readyState,
        url: wsError.url,
        protocol: wsError.protocol,
        bufferedAmount: wsError.bufferedAmount,
        extensions: wsError.extensions,
        binaryType: wsError.binaryType
      });
      callbacks.onerror?.(error)
    }

    ws.onclose = (event: CloseEvent) => {
      console.log("WebSocket 关闭详情:", {
        code: event.code,        // 关闭状态码
        reason: event.reason,    // 关闭原因
        wasClean: event.wasClean, // 是否正常关闭
        timestamp: new Date().toISOString(),
        readyState: ws.readyState
      });
      callbacks.onclose?.(event)
    }

    ws.onmessage = (event) => {
      console.log('收到服务器消息:', event.data)
      try {
        const data = JSON.parse(event.data)
        callbacks.onmessage?.(data)
        console.log('消息处理完成，WebSocket状态:', ws.readyState)
      } catch (err) {
        console.error('解析消息失败:', err)
      }
    }
    return ws
  }
  return connect()
}


export function sendToWebSocket(ws: WebSocket | null, obj: Record<string, any>): boolean {
  let msg: string
  try {
    msg = JSON.stringify(obj)
  }
  catch(err) {
    console.log("解析失败")
    console.log(err)
    return false
  }
  if(!ws) {
    console.log("ws 不存在，无法发送...........")
    console.log(" ")
    return false
  }
  
  if(obj.operateType === "SET_PLAYER") {
    console.log("使用 web-socket 操作播放器消息: ")
    console.log(obj)
    console.log(" ")
  }
  

  try {
    console.log("ws 发送消息: %s", msg)
    ws.send(msg)
  }
  catch(err) {
    console.log("使用 web-socket 发送消息失败.......")
    console.log(err)
    console.log(" ")
    return false
  }
  return true
}