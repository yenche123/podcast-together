import type { VercelRequest, VercelResponse } from '@vercel/node'

const handler = (req: VercelRequest, res: VercelResponse) => {
  res.status(200).json({
    message: 'Hello World',
    timestamp: new Date().toISOString()
  })
}

export default handler