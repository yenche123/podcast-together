import cloud from '@/cloud-sdk'
const db = cloud.database()

interface Participant {
  nickName: string
  enterStamp: number
  heartbeatStamp: number
  userAgent?: string
  guestId: string
  nonce: string
}

type SpeedRate = "0.8" | "1" | "1.2" | "1.5" | "1.7"

interface Room {
  _id: string
  title?: string
  // content: ContentData    本函数用不到
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

exports.main = async function (ctx: FunctionContext) {

  // 去查询正在播放的房间
  await handle_main()
}

// 处理在播放中的房间，看人们是否还在（用心跳判断），不在的话就暂停播放器
async function handle_main() {
  // 查询 playStatus 为 PLAYING 并且 oState 为 OK 的房间
  const col = db.collection("Room")
  const res = await col.where({
    oState: "OK",
    playStatus: "PLAYING"
  }).orderBy("operateStamp", "asc").get()

  const list = res.data

  if(!list || list.length < 1) {
    console.log("查无在播放中的房间......")
    return
  }

  let totalUpdated = 0
  const now = Date.now()
  for(let i=0; i<list.length; i++) {
    const room = list[i] as Room
    let { participants, operateStamp, contentStamp, _id, speedRate } = room
    if(participants.length < 1) {
      // 没有任何人，就直接把 playStatus 切换为 PAUSED
      totalUpdated++
      await _updateRoom(_id, { playStatus: "PAUSED" })
      continue
    }

    // 还有其他人，先去寻找最后一个 heartbeatStamp
    // 再踢掉过去 50s 内没有任何心跳的人
    const oldLen = participants.length
    let lastHeartbeat = 1
    const SEC_50_AGO = now - (50 * 1000)
    participants = participants.filter(person => {
      if(person.heartbeatStamp > lastHeartbeat) lastHeartbeat = person.heartbeatStamp
      return person.heartbeatStamp > SEC_50_AGO
    })
    const newLen = participants.length
    // 如果人数没有发生变化，就代表大家都还在听，不需要换状态
    if(newLen === oldLen) continue

    let newData: Partial<Room> = {
      participants,
    }
    // 如果房间里的人数过滤后没有任何人了，暂停播放器到最后一个心跳的时间
    if(newLen === 0) {
      let speedRateNum = Number(speedRate)
      if(isNaN(speedRateNum) || speedRateNum >= 1.71) speedRateNum = 1
      const diffMilli = lastHeartbeat - operateStamp
      newData.playStatus = "PAUSED"
      newData.contentStamp = contentStamp + (diffMilli * speedRateNum)
      newData.operateStamp = now
      newData.operator = ""
    }
    totalUpdated++
    await _updateRoom(_id, newData)
  }

  console.log(`总共更新了 ${totalUpdated} 个房间...........`)
  return true  
}

/**
 * 修改房间
 */
 async function _updateRoom(roomId: string, data: Partial<Room>) {
  const col = db.collection("Room")
  const res = await col.doc(roomId).update(data)
  console.log(`查看一下修改房间号为 ${roomId} 的结果........`)
  console.log(res)
  console.log(" ")
  return res
}