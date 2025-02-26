import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: 'https://polished-mantis-17335.upstash.io',
  token: 'AUO3AAIjcDE0OGFlN2FjNTczZDE0NzU0OWU5MjI4ZjhkYTUzZWJlYnAxMA'
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const testRoom = {
      _id: 'test-room-1',
      title: '测试房间',
      oState: 'OK',
      playStatus: 'PLAYING',
      speedRate: '1',
      contentStamp: Date.now(),
      operateStamp: Date.now(),
      operator: 'test-user',
      createStamp: Date.now(),
      owner: 'test-owner',
      participants: [{
        nickName: '测试用户',
        enterStamp: Date.now(),
        heartbeatStamp: Date.now(),
        guestId: 'test-guest',
        nonce: 'test-nonce'
      }]
    }

    await redis.hset('rooms', {
      'test-room-1': JSON.stringify(testRoom)
    })

    return res.status(200).json({
      code: '0000',
      data: { success: true }
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ code: 'E5000' })
  }
}