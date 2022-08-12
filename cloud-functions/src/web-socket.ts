import cloud from '@/cloud-sdk'
const db = cloud.database()

// 最小可操作的时间间隔，小于该值，不响应
const MIN_DURATION_FOR_A_PERSON = 250   

type SpeedRate = "0.8" | "1" | "1.2" | "1.5" | "1.7"

interface RoomStatus {
  roomId: string
  playStatus: "PLAYING" | "PAUSED"
  speedRate: SpeedRate
  operator: string
  contentStamp: number
  operateStamp: number
}

interface ResToFe {
  responseType: "CONNECTED" | "NEW_STATUS"
  roomStatus?: RoomStatus
}


interface ReqBase {
  operateType: "FIRST_SEND" | "SET_PLAYER"
  roomId: string
  "x-pt-local-id": string
  "x-pt-stamp": number
}

interface ReqOperatePlayer extends ReqBase {
  playStatus: "PLAYING" | "PAUSED"
  speedRate: "1"
  contentStamp: number
}


exports.main = async function (ctx: FunctionContext) {
  const { method } = ctx
  if(method === "WebSocket:error") {
    console.log("WebSocket:error.........")
    return
  }

  // 建立 WebSocket
  if(method === "WebSocket:connection") {
    console.log("WebSocket:connection..........")
    //@ts-ignore
    ctx.socket.createStamp = Date.now()
    let send: ResToFe = { responseType: "CONNECTED" }
    let msg: string = JSON.stringify(send)
    ctx.socket.send(msg)
    return
  }

  // 收到来自客户端的消息
  if(method === "WebSocket:message") {
    console.log("WebSocket:message..........")
    const { data } = ctx.params;
    let req = getReqObject(data)
    let checkRes = checkReqObject(req as ReqBase)
    if(!checkRes) {
      ctx.socket.close()
      return
    }

    let { operateType } = req as ReqBase
    if(operateType === "FIRST_SEND") {
      await handle_first_send(ctx, req as ReqBase)
    }
    else if(operateType === "SET_PLAYER") {
      await handle_set_player(ctx, req as ReqOperatePlayer)
    }
    return
  }

  // 收到关闭连接的请求
  if(method === "WebSocket:close") {
    console.log("收到关闭连接的请求.............")
    ctx.socket.close()
    return
  }

}

async function handle_first_send(ctx: FunctionContext, req: ReqBase): Promise<void> {
  const { roomId } = req
  const clientId: string = req["x-pt-local-id"]
  const room: Room = await _getRoom(roomId) as Room
  const guestId = _getOperatorGuestId(clientId, room)
  if(!guestId) {
    ctx.socket.close()
    return
  }
  //@ts-ignore
  ctx.socket.roomId = roomId

  // 封装最新 RoomStatus
  let roomStatus: RoomStatus = {
    roomId,
    playStatus: room.playStatus,
    speedRate: room.speedRate,
    operator: room.operator,
    contentStamp: room.contentStamp,
    operateStamp: room.operateStamp,
  }
  let resToFe: ResToFe = {
    responseType: "NEW_STATUS",
    roomStatus,
  }
  let msg: string = JSON.stringify(resToFe)
  ctx.socket.send(msg)
}

async function handle_set_player(ctx: FunctionContext, req: ReqOperatePlayer): Promise<void> {
  const { roomId, playStatus, speedRate, contentStamp } = req
  const clientId: string = req["x-pt-local-id"]
  const room: Room = await _getRoom(roomId) as Room
  const guestId = _getOperatorGuestId(clientId, room)
  if(!guestId) {
    ctx.socket.close()
    return
  }

  const s1 = req["x-pt-stamp"]
  const s2 = room.operateStamp
  if(guestId === room.operator) {
    const diff = s1 - s2
    if(diff < MIN_DURATION_FOR_A_PERSON) return
  }

  let oPlayStatus = room.playStatus
  let oSpeedRate = room.speedRate
  let oContentStamp = room.contentStamp
  const diff2 = Math.abs(contentStamp - oContentStamp)
  if(playStatus === oPlayStatus && speedRate === oSpeedRate && diff2 <= 500) return

  let newStatus = {
    playStatus,
    speedRate,
    contentStamp,
    operateStamp: s1,
    operator: guestId,
  }
  await _updateRoom(roomId, newStatus)
  const roomStatus: RoomStatus = {...newStatus, roomId }
  const resToFe: ResToFe = {
    responseType: "NEW_STATUS",
    roomStatus,
  }
  const msg: string = JSON.stringify(resToFe)
  cloud.sockets.forEach(socket => {
    //@ts-ignore
    if(socket.roomId === roomId) {
      socket.send(msg)
    }
  })
}


function checkReqObject(data: ReqBase | ReqOperatePlayer): boolean {
  if(!data) return false
  let { operateType, roomId } = data
  let cliendId = data["x-pt-local-id"]
  let stamp = data["x-pt-stamp"]
  if(!operateType || !roomId || !cliendId || !stamp) return false
  if(operateType === "SET_PLAYER") {
    let { playStatus, speedRate, contentStamp } = data as ReqOperatePlayer
    if(!playStatus || !speedRate) return false
    if(typeof contentStamp !== "number") return false
  } 

  return true
}

function getReqObject(data: any): ReqBase | undefined {
  if(!data) return

  let req: ReqBase
  try {
    let tmpStr = data.toString()
    if(!tmpStr) return
    req = JSON.parse(tmpStr)
  }
  catch(err) {
    console.log("getReqObject 出现错误......")
    console.log(err)
    return
  }
  if(!req) return
  return req
}



/************* 以下是关于房间的设置和函数，跟本函数没有太大的关系  ***********/

interface ContentData {
  infoType: "podcast"
  audioUrl: string
  sourceType?: string
  title?: string
  description?: string
  imageUrl?: string
  linkUrl?: string
}


interface Participant {
  nickName: string
  enterStamp: number
  heartbeatStamp: number
  userAgent?: string
  guestId: string
  nonce: string
}

interface Room {
  _id: string
  title?: string
  content: ContentData
  oState: "OK" | "EXPIRED" | "DELETED"
  playStatus: "PLAYING" | "PAUSED"
  speedRate: SpeedRate
  contentStamp: number
  operateStamp: number
  operator: string
  createStamp: number
  owner: string
  participants: Participant[]
}

/**
 * 修改房间
 */
 async function _updateRoom(roomId: string, data: Record<string, any>) {
  const col = db.collection("Room")
  const res = await col.doc(roomId).update(data)
  console.log("查看一下因为播放状态 修改房间的结果........")
  console.log(res)
  console.log(" ")
  return res
}

/**
 * 获取当前访问者的 guestId
 * 返回 undefined 代表访问者不在房间里
 */
function _getOperatorGuestId(clientId: string, room?: Room): string | undefined {
  if(!room) return
  let { oState, participants = [] } = room
  if(oState === "EXPIRED" || oState === "DELETED") return
  let me = participants.find(v => v.nonce === clientId)
  if(!me) return
  return me.guestId
}


/**
 * 查找房间
 */
 async function _getRoom(roomId: string): Promise<Room | undefined> {
  const col = db.collection("Room")
  const res = await col.doc(roomId).get()
  let room: Room | undefined = res.data
  return room
}
