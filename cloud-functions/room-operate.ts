//@ts-ignore
import cloud from '@/cloud-sdk'

interface RequestParam {
  "x-pt-version": string
  "x-pt-client": string
  "x-pt-stamp": number
  "x-pt-language": string
  "x-pt-local-id": string
}

interface ContentData {
  infoType: "podcast"
  audioUrl: string
  sourceType?: string
  title?: string
  description?: string
  imageUrl?: string
  linkUrl?: string
}

interface ParticipantRes {
  nickName: string
  guestId: string
  heartbeatStamp: number
}

interface RoRes {
  roomId: string
  content: ContentData
  playStatus: "PLAYING" | "PAUSED"
  speedRate: "1"
  contentStamp: number
  participants: ParticipantRes[]
}

interface ResType {
  code: string
  errMsg?: string
  showMsg?: string
  data?: RoRes
}

//@ts-ignore
exports.main = async function (ctx: FunctionContext) {
  let err = checkEntry(ctx)
  if(err) return err

  let res: ResType
  const t = ctx.body.operateType
  if(t === "CREATE") {

  }

}

interface CreateBody extends RequestParam {
  operateType: "CREATE"
  roomData: ContentData
  nickName: string
}
async function handle_create(body: CreateBody) {
  const clientId = body["x-pt-local-id"]
  const roomData = body.roomData
  
}

/**
 * 检测入参和请求方式 
 */
//@ts-ignore
function checkEntry(ctx: FunctionContext): ResType | null {
  const { auth, body = {}, method, headers } = ctx
  
  let errData: ResType = { code: "E4000" }
  if(method !== "POST") {
    errData.code = "E4005"
    return errData
  }

  console.log("看一下入参的 body:::")
  console.log(body)
  console.log(" ")
  const localId = body["x-pt-local-id"]
  if(!localId) return errData

  let { operateType = "", nickName, roomId } = body
  let roomData: ContentData = body.roomData
  let oTypes = ["CREATE", "ENTER", "HEARTBEAT", "LEAVE"]
  if(!nickName) return errData
  if(!oTypes.includes(operateType)) return errData

  let oTypes2 = ["ENTER", "HEARTBEAT", "LEAVE"]
  if(!roomId && oTypes2.includes(operateType)) return errData
  if(operateType === "CREATE") {
    if(!roomData) return errData
    if(roomData.infoType !== "podcast") return errData
    if(!roomData.audioUrl) {
      errData.errMsg = "roomData.audioUrl is required"
      return errData
    }
  }
  
  return null
}
