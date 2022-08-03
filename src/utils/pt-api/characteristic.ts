// 判断各种特征

let isPC: boolean;
let isMobile: boolean;   // 此字段表示是否为移动装置，包含是否为手机或pad
let isWeChat: boolean;

interface GetChaRes {
  isPC: boolean
  isMobile: boolean
  isWeChat: boolean
}

const getCharacteristic = (): GetChaRes => {
  if(isPC !== undefined) {
    return { isPC, isMobile, isWeChat }
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

  return { isPC, isMobile, isWeChat }
}


export default {
  getCharacteristic
}
