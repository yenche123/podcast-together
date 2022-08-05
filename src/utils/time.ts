import api from "../request/api"
import { RequestRes } from "../type"

let diff = 0

const _init = async (): Promise<void> => {
  const url = api.PT_SERVICE
  const param = { operate: "TIME" }
  const s1 = Date.now()

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(param)
  })

  const s2 = Date.now()
  let res = await response.json() as RequestRes
  let resData = res?.data
  if(res.code !== "0000" || !resData) return
  let stamp: number = resData.stamp
  if(!stamp) return
  const now: number = Math.round((s1 + s2) / 2)
  diff = stamp - now
}

_init()

// 经过标定的时间
const getTime = (): number => {
  return Date.now() + diff
}

// 返回未经过标定的时间
const getLocalTime = (): number => {
  return Date.now()
}


export default {
  getTime,
  getLocalTime
}