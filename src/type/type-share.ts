
// 设置的分享方式
export type ShareWay = "all" | "inner" | "outside"

export interface WxConfig {
  appId: string
  timestamp: number
  nonceStr: string
  signature: string
}

export interface WxShare {
  frdTitle: string
  frdDesc?: string
  frdImgUrl?: string
  pyqTitle: string
  pyqImgUrl?: string
  link?: string
}

export interface ShareCfgData {
  title?: string
  desc?: string
  imageUrl?: string
  shareWay?: ShareWay
  wxShare?: WxShare
}