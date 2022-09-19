// 发起网络请求
import { RequestParam, RequestRes } from "../type"
import time from "../utils/time"
import ptUtil from "../utils/pt-util"

let local_id: string = ""

/**
 * 返回公共入参
 */
const _getCommonParam = (): RequestParam => {
  const version: string = PT_ENV.version
  const client: string = PT_ENV.client
  const stamp: number = time.getTime()
  const language = navigator.language
  if(!local_id) {
    let userData = ptUtil.getUserData()
    local_id = userData.nonce as string
  }
  return {
    "x-pt-version": version,
    "x-pt-client": client,
    "x-pt-stamp": stamp,
    "x-pt-language": language,
    "x-pt-local-id": local_id
  }
}

const request = async <T = Record<string, any>>(
  url: string, 
  body: Record<string, any> = {}, 
  method: string = "POST",
): Promise<RequestRes<T>> => {
  const newBody: RequestParam = { ..._getCommonParam(), ...body }
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newBody)
  })

  let res = await response.json() as RequestRes<T>
  return res
}


export default {
  request
}

