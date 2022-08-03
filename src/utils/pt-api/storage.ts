// 这是简单的数据存储
// 另外可以使用 IndexedDB 存储大量数据 （几GB）
// IndexedDB 有一些封装好的库 比如 localForage https://localforage.docschina.org/
// 使得操作 IndexedDB 就像操作 localStorage 一样简单

import util from "../util"

let hasListenStorageChange = false
let storageMap = new Map()   // { key1: { data: 元数据, stamp: 时间戳 } }


// 去监听其他标签页 
const _listenStorageChange = () => {
  hasListenStorageChange = true

  // 只有在不同标签页或窗口才监听得到
  window.addEventListener("storage", e => {
    console.log("监听到 storage 变化.......")
    const { key, newValue } = e

    // key 不存在，代表调用了 localStorage.clear()
    if(!key) {
      storageMap = new Map()
      return
    }

    if(!storageMap.has(key)) return
    if(!newValue) return
    let newObj = util.strToObj(newValue)
    if(!newObj.data || !newObj.stamp) return
    storageMap.set(key, newObj)
  })
}

// localStorage.setItem 出错时......
// 参考: https://blog.csdn.net/weixin_30632267/article/details/113366007
const _handleSetItemErr = (err: any) => {
  if(!err || !err.code) return
  let { code, name } = err
  if(code === 22) {
    // localStorage 超出存储空间.........
  }
  else if(code === 1014 && name === "NS_ERROR_DOM_QUOTA_REACHED") {
    // firefox 超出存储空间
  }
}

/**
 * 获取缓存
 * @param {String} key localStorage的键
 * @returns {Any}
 */
const getStorageSync = (key: string): any => {
  if(!key) {
    console.warn(`getStorageSync 没有 key.......`)
    return
  }

  if(!hasListenStorageChange) _listenStorageChange()

  if(storageMap.has(key)) {
    let s1 = storageMap.get(key)
    return util.copyData(s1.data)
  }

  let s = null
  try {
    s = localStorage.getItem(key)
  }
  catch(err) {}
  
  
  if(s && typeof s === "string") {
    let obj = JSON.parse(s)
    storageMap.set(key, obj)
    return util.copyData(obj.data)
  }
  storageMap.set(key, { data: s, stamp: Date.now() })
  return s
}

interface SetStorageRes {
  isOk: boolean
  err?: any
}

/**
 * 设置缓存
 */
const setStorageSync = (key: string, data: any): SetStorageRes => {
  if(!key) {
    console.warn(`setStorageSync 没有 key.......`)
    return { isOk: false }
  }
  if(data === undefined) {
    console.warn(`setStorageSync 没有 data 不允许设置为 undefined.......`)
    return { isOk: false }
  }
  
  let s = { data, stamp: Date.now() }
  storageMap.set(key, s)
  try {
    localStorage.setItem(key, JSON.stringify(s))
  }
  catch(err) {
    _handleSetItemErr(err)
    return { isOk: false, err }
  }
  return { isOk: true }
}

const removeStorageSync = (key: string): void => {
  
}

export default {
  getStorageSync,
  setStorageSync,
  removeStorageSync,
}