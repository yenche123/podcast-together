import type { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // body, query 为请求参数, auth 是授权对象
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-pt-version, x-pt-client, x-pt-stamp, x-pt-language, x-pt-local-id');
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 原有的接口逻辑
  console.log("headers: ")
  console.log(req.headers)
  console.log(" ")
  console.log("body: ")
  console.log(req.body)
  console.log(" ")
  console.log("method: ")
  console.log(req.method)
  console.log(" ")
  console.log("query: ")
  console.log(req.query)

  if (req.method !== "POST") {
    return res.status(405).json({ code: "E4005" })
  }

  try {
    return res.status(200).json({ 
      code: "0000", 
      data: { 
        stamp: Date.now() 
      } 
    })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ code: "E5000" })
  }
}
