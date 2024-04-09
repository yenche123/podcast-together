import api from "../request/api"
import { RequestRes } from "../type"
import util from "./util"

let diff = 0

const _init = async (): Promise<void> => {
  const url = api.PT_SERVICE
  const param = { 
    "operate": "TIME",
    "x-pt-version": PT_ENV.version,
    "x-pt-client": PT_ENV.client,
  }
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

// 返回当前时间的字符串
const getLocalTimeStr = (): string => {
  let t = getTime()
  const d = new Date(t)
  const mon = util.format0(d.getMonth()+1)
  const date = util.format0(d.getDate())
  const hr = util.format0(d.getHours())
  const min = util.format0(d.getMinutes())
  const sec = util.format0(d.getSeconds())
  return `${mon}-${date} ${hr}:${min}:${sec}`
}

const isWithinMillis = (stamp: number, ms: number) => {
  const now = getTime()
  const diff = now - stamp
  if(diff < ms) return true
  return false
}


export default {
  getTime,
  getLocalTime,
  getLocalTimeStr,
  isWithinMillis,
}