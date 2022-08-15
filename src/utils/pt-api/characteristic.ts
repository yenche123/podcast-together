// 判断各种特征

let isPC: boolean;
let isMobile: boolean;   // 此字段表示是否为移动装置，包含是否为手机或pad
let isWeChat: boolean;
let isIOS: boolean = false;
let isIPadOS: boolean = false;

interface GetChaRes {
  isPC: boolean
  isMobile: boolean
  isWeChat: boolean
  isIOS: boolean         // 是否为 iphone
  isIPadOS: boolean      // 是否为 iPad
}

const getCharacteristic = (): GetChaRes => {
  if(isPC !== undefined) {
    return { isPC, isMobile, isWeChat, isIOS, isIPadOS }
  }

  const { userAgent = "", userAgentData } = navigator
  const ua = userAgent.toLowerCase()

  console.log("userAgentData: ", userAgentData)
  console.log("navigator: ", navigator)
  console.log("ua: ", ua)

  const res = ua.match(/MicroMessenger/i)

  // 判断是否为微信环境
  if(typeof res === "string" && res == "micromessenger") {
    isWeChat = true
  }
  else {
    isWeChat = false
  }

  // 判断是否为移动装置
  if(userAgentData?.mobile) {
    isMobile = true
    isPC = false
  }
  else if(!!userAgent.match(/AppleWebKit.*Mobile.*/)) {
    isMobile = true
    isPC = false
  }
  else {
    isMobile = false
    isPC = true
  }

  if(ua.includes("iphone") || ua.includes("ios")) isIOS = true
  if(ua.includes("ipad")) isIPadOS = true

  return { isPC, isMobile, isWeChat, isIOS, isIPadOS }
}


export default {
  getCharacteristic
}
