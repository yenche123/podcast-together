

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
const strToObj = (str: string): any => {
  let res = {}
  try {
    res = JSON.parse(str)
  }
  catch(err) {}
  return res
}

// 快速把入参 val 包裹在 Promise 里返回
const getPromise = <T = any>(val: T): Promise<T> => {
  return new Promise(a => a(val)) 
}

export default {
  waitMilli,
  copyObj,
  copyData,
  strToObj,
  getPromise,
}

