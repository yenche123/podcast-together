import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Redis } from '@upstash/redis'

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

const redis = new Redis({
  url: 'https://polished-mantis-17335.upstash.io',
  token: 'AUO3AAIjcDE0OGFlN2FjNTczZDE0NzU0OWU5MjI4ZjhkYTUzZWJlYnAxMA'
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 'E4005' })
  }

  try {
    const result = await handle_main()
    return res.status(200).json({
      code: '0000',
      data: { success: result }
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ code: 'E5000' })
  }
}

async function handle_main() {
  // 使用 scan 获取所有以 room 开头的 key
  const [, keys] = await redis.scan(0, {
    match: "room:*",
    count: 100
  })
  
  if (!keys || keys.length === 0) {
    console.log("查无房间数据......")
    return true
  }
  // 获取所有房间的数据
  const rooms: Record<string, any> = {};
  keys.forEach((key, index) => {
    console.log(`键 ${index}: ${key}`);
    rooms[key] = rooms[key]
  });
      

  const playingRooms = Object.entries(rooms)
    .map(([id, room]) => ({ _id: id, ...JSON.parse(room as string) }))
    .filter(room => room.oState === 'OK' && room.playStatus === 'PLAYING')
    .sort((a, b) => a.operateStamp - b.operateStamp)
  if (playingRooms.length === 0) {
    console.log("查无在播放中的房间......")
    return true
  }


  let totalUpdated = 0
  const now = Date.now()

  for (const room of playingRooms) {
    let { participants, operateStamp, contentStamp, _id, speedRate } = room
    if (participants.length < 1) {
      totalUpdated++
      await _updateRoom(_id, { playStatus: "PAUSED" })
      continue
    }

    const oldLen = participants.length
    let lastHeartbeat = 1
    const SEC_50_AGO = now - (50 * 1000)
    participants = participants.filter((person: Participant) => {
      if (person.heartbeatStamp > lastHeartbeat) lastHeartbeat = person.heartbeatStamp
      return person.heartbeatStamp > SEC_50_AGO
    })
    const newLen = participants.length
    if (newLen === oldLen) continue

    let newData: Partial<Room> = {
      participants,
    }

    if (newLen === 0) {
      let speedRateNum = Number(speedRate)
      if (isNaN(speedRateNum) || speedRateNum >= 1.71) speedRateNum = 1
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

async function _updateRoom(roomId: string, data: Partial<Room>) {
  const room = await redis.get(roomId)
  if (!room) return null

  const updatedRoom = { ...JSON.parse(room as string), ...data }
  await redis.set(roomId, JSON.stringify(updatedRoom))

  console.log(`查看一下修改房间号为 ${roomId} 的结果........`)
  console.log(updatedRoom)
  console.log(" ")
  return updatedRoom
}