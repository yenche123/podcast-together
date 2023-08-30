
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
export interface Participant {
  nickName: string
  guestId: string
  heartbeatStamp: number
  enterStamp: number
}

export interface ContentData {
  infoType: "podcast"
  audioUrl: string
  sourceType?: string
  title?: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  seriesName?: string   // 播客专栏名称，比如 "商业就是这样"
  seriesUrl?: string    // 播客专栏链接
}

export interface RoRes {
  roomId: string
  content: ContentData
  playStatus: "PLAYING" | "PAUSED"
  speedRate: "1"
  operator: string
  contentStamp: number
  operateStamp: number
  participants: Participant[]
  guestId?: string
  iamOwner?: "Y" | "N"
  everyoneCanOperatePlayer?: "Y" | "N"
}


/********************* 纯前端的类型 **********************/
export interface StorageUserData {
  nickName?: string
  nonce?: string
}

export interface EnvType {
  DEV: boolean
  WEBSOCKET_URL: string
  API_URL: string
  HEARTBEAT_PERIOD: number
  THIRD_PARTY_SETTING_URL?: string
  CONTACT_EMAIL?: string
  CONTACT_FEISHU?: string
  PLAUSIBLE_DOMAIN?: string
  PLAUSIBLE_SRC?: string
}