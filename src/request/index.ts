// 发起网络请求
import { RequestParam, RequestRes } from "../type"
import time from "../utils/time"
import ptUtil from "../utils/pt-util"

let local_id: string = ""
const _env = import.meta.env

/**
 * 返回公共入参
 */
const _getCommonParam = (): RequestParam => {
  const version: string = PT_ENV.version
  const client: string = "web"
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

const request = async (
  url: string, 
  body: Record<string, any> = {}, 
  method: string = "POST"
): Promise<RequestRes | void> => {
  const newBody: RequestParam = { ..._getCommonParam(), ...body }
  
}


export default {
  request
}

