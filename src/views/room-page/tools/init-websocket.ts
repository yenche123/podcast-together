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
  let ws = new WebSocket(WEBSOCKET_URL)
  ws.onopen = (socket: Event) => {
    console.log("ws opened.........")
    console.log(socket)
    console.log(" ")
  }

  ws.onmessage = (res) => {
    const message = res.data
    const msgRes = util.strToObj<WsMsgRes>(message)
    
    if(!msgRes) return
    callbacks.onmessage && callbacks.onmessage(msgRes)
  }

  ws.onclose = (res) => {
    console.log("ws.onclose.......")
    console.log(`res: `, res)
    console.log(` `)
  }

  ws.onerror = (res) => {
    console.log("ws.onerror.......")
    console.log(res)
    console.log(" ")
  }
  return ws
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