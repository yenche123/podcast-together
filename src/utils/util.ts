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
  const DEV = import.meta.env.DEV
  const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL
  const API_URL = import.meta.env.VITE_API_URL
  const HEARTBEAT_PERIOD = import.meta.env.VITE_HEARTBEAT_PERIOD ?? "15"
  const THIRD_PARTY_SETTING_URL = import.meta.env.VITE_THIRD_PARTY_SETTING_URL
  const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL
  const CONTACT_FEISHU = import.meta.env.VITE_CONTACT_FEISHU
  const PLAUSIBLE_SRC = import.meta.env.VITE_PLAUSIBLE_SRC
  const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN

  return {
    DEV,
    WEBSOCKET_URL,
    API_URL,
    HEARTBEAT_PERIOD: Number(HEARTBEAT_PERIOD),
    THIRD_PARTY_SETTING_URL,
    CONTACT_EMAIL,
    CONTACT_FEISHU,
    PLAUSIBLE_SRC,
    PLAUSIBLE_DOMAIN,
  }
}

const numToFix = (num: number, fix: number): number => {
  const str = num.toFixed(fix)
  return Number(str)
}

/**
 * 返回小于 2 位时，前面补0
 */
const format0 = (val: string | number): string => {
  if(typeof val === "number") {
    if(val < 10) return "0" + val
    return "" + val  
  }
  if(val.length < 2) return "0" + val
  return val
}

/**
 * 获取文本的中文字符数
 */
const getChineseCharNum = (val: string): number => {
  if(!val) return 0
  let num = 0
  for(let i=0; i<val.length; i++) {
    if(val.charCodeAt(i) >= 10000) num++
  }
  return num
}

//获取小写字符串的数量
const getLowerCaseNum = (text: string): number => {
  if(!text || text.length < 1) return 0
  let list = text.split("")
  let num = 0
  list.forEach(v => {
    if(v >= "a" && v <= "z") num++
  })
  return num
}

// 给定一段文本，返回一个文本里有的链接所组成的数组
// 没有规定必须是 http(s) 的协议
const getUrls = (text: string): string[] => {
  const MIN_LENGTH = 6
  if(!text || text.length < MIN_LENGTH) return []
  const REG = /[\w\.\/:-]*\w{1,32}\.\w{2,6}\S*/g

  let results: string[] = []
  const matches = text.matchAll(REG)
  for(const match of matches) {
    const url = match[0]
    if(url.length < MIN_LENGTH) continue

    // 开始加强检测 url
    if(url.indexOf("http") === 0) {
      results.push(url)
      continue
    }

    // 避免字符串里 全是: 数字 . - 的情况
    const REG_2 = /^[\d\.-]{2,}$/
    if(REG_2.test(url)) continue
    const enNum = getLowerCaseNum(url)
    if(enNum < 3) continue
    const chNum = getChineseCharNum(url)
    if(chNum > 2 && !url.includes("/")) continue

    results.push(url)
  }

  return results
} 

export default {
  waitMilli,
  copyObj,
  copyData,
  strToObj,
  getPromise,
  getEnv,
  numToFix,
  format0,
  getChineseCharNum,
  getLowerCaseNum,
  getUrls,
}

