
/**************** 网络请求 **************/
// 请求回调的公共入参
export interface RequestParam {
  "x-pt-version": string
  "x-pt-client": string
  "x-pt-stamp": number
  "x-pt-language": string
  "x-pt-local-id": string
  [otherParam: string]: any
}

// 请求回调的结果
export interface RequestRes<T = Record<string, any>> {
  code: string
  errMsg?: string
  showMsg?: string
  data?: T
}

/**************** 一些正常情况下的返回参数 *************/
export interface ContentData {
  infoType: "podcast"
  audioUrl: string
  sourceType?: string
  title?: string
  description?: string
  imageUrl?: string
  linkUrl?: string
}




/********************* 纯前端的类型 **********************/
export interface StorageUserData {
  nickName?: string
  nonce?: string
}
