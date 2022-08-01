// 发起网络请求
import { RequestParam, RequestRes } from "../type"
import time from "../utils/time"

const _env = import.meta.env

/**
 * 返回公共入参
 */
const _getCommonParam = () => {
  const version: string = _env.VITE_PT_VERSION
  const client: string = "web"
  const stamp: number = time.getTime()

}

const request = (url: string, body: Record<string, any> = {}, method: string = "POST") => {

}


export default {
  request
}

