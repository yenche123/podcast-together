


interface WxConfig {
  appId: string
  timestamp: number
  nonceStr: string
  signature: string
}

interface WxShare {
  frdTitle: string
  frdDesc?: string
  frdImgUrl?: string
  pyqTitle: string
  pyqImgUrl?: string
  link?: string
}

interface ShareCfgData {
  title?: string
  desc?: string
  imageUrl?: string
  wxShare?: WxShare
}