import { EnvType } from "../type"

// 等待 ms 再执行
const waitMilli = (ms: number = 1) => {
  let _wait = (a: (a1: true) => void) => {
    setTimeout(() => {
      a(true)
    }, ms)
  }
  return new Promise(_wait)
}

// 复制 object
const copyObj = (obj: object) => {
  try {
    let newObj = JSON.parse(JSON.stringify(obj))
    return newObj
  }
  catch(err) {}
  return {}
}

// 复制 位置类型的 data
const copyData = (data: any) => {
  if(typeof data === "object") return copyObj(data)
  return data
}

// 将字符串 转为 object
const strToObj = <T = any>(str: string): T => {
  let res = {}
  try {
    res = JSON.parse(str)
  }
  catch(err) {}
  return res as T
}

// 快速把入参 val 包裹在 Promise 里返回
const getPromise = <T = any>(val: T): Promise<T> => {
  return new Promise(a => a(val)) 
}

const getEnv = (): EnvType => {
  const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL
  const API_URL = import.meta.env.VITE_API_URL
  const HEARTBEAT_PERIOD = import.meta.env.VITE_HEARTBEAT_PERIOD ?? "15"
  return {
    WEBSOCKET_URL,
    API_URL,
    HEARTBEAT_PERIOD: Number(HEARTBEAT_PERIOD),
  }
}

const numToFix = (num: number, fix: number): number => {
  const str = num.toFixed(fix)
  return Number(str)
}

export default {
  waitMilli,
  copyObj,
  copyData,
  strToObj,
  getPromise,
  getEnv,
  numToFix,
}

