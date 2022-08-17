import { reactive } from "vue"
import cui from "../../../components/custom-ui"
import images from "../../../images"
import ptApi from "../../../utils/pt-api"
import util from "../../../utils/util"

const _env = util.getEnv()
const imgData = reactive({
  imgUrl: "",
  show: false,
  tip: "",
})

const onTapWeChat = () => {
  const cha = ptApi.getCharacteristic()
  if(cha.isWeChat) {
    window.open("https://work.weixin.qq.com/gm/7da1a2b2a7ed6b6458a2535d95ac685b", "wecom")
    return
  }

  imgData.imgUrl = images.WECOM_GROUP_QR
  imgData.tip = `请使用微信扫码`
  imgData.show = true
}

const onTapFeishu = () => {
  const feishuLink = _env.CONTACT_FEISHU
  if(!feishuLink) {
    console.log("尚未配置 feishu link..........")
    return
  }
  const cha = ptApi.getCharacteristic()
  if(cha.isFeishu) {
    window.open(feishuLink, "feishu")
    return
  }

  imgData.imgUrl = images.FEISHU_QR
  imgData.tip = `请使用飞书扫码`
  imgData.show = true
}

const onTapEmail = () => {
  const email = _env.CONTACT_EMAIL
  if(!email) {
    console.log("尚未配置 email..........")
    return
  }
  ptApi.copyToClipboard(email)
  cui.showModal({ title: "已复制到剪贴板", content: "等待你的来信！", showCancel: false })
}

const onTapClosePreview = () => {
  console.log("onTapClosePreview...........")
  imgData.show = false
}

export function useContactPage() {
  return { onTapEmail, onTapFeishu, onTapWeChat, onTapClosePreview, imgData }
}