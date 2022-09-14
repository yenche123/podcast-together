import { computed, Ref } from "vue"
import cui from "../../../components/custom-ui"
import { PageParticipant, PageState } from "../../../type/type-room-page"
import ptApi from "../../../utils/pt-api"
import { enterRoom } from "./useRoomPage"

export function initBtns(
  state: Ref<PageState>, 
  toHome: () => void, 
  toContact: () => void,
  toEditMyName: (newName: string) => void,
) {
  const btnText = computed(() => {
    const v = state.value
    if(v < 11) return ""
    if (v === 11 || v === 12 || v === 14 || v === 15) return "回首页"
    else if (v === 13 || v === 16 || v === 17 || v === 18) return "重新进入"
    return "重新尝试"
  })

  const btnText2 = computed(() => {
    const v = state.value
    if (v === 13 || v === 18 || v === 20) return "联系开发者"
    return ""
  })

  const h1 = computed(() => {
    const v = state.value
    if(v <= 10) return ""
    if(v === 11) return "链接已过期"
    if(v === 12) return "查无该房间"
    if(v === 13) return "网络不佳"
    if(v === 14) return "拒绝访问"
    if(v === 15) return "房间人数已满"
    if(v === 16) return "长时间未操作"
    if(v === 17) return "房门外"
    if(v === 18) return "连接异常"
    return "未知的错误"
  })

  const pText = computed(() => {
    const v = state.value

    const p1 = `请检查网络状态；\n如果重新尝试仍无改善，请联系开发者。`
    const p2 = `已超过 5 分钟闲置；\n你似乎游走到房门外啦！`
    const p3 = `你的连接似乎已断开`

    if(v <= 10) return ""
    if(v === 13 || v === 20) return p1
    if(v === 17) return p2
    if(v === 18) return p3
    return ""
  })

  // 点击异常情况下的按钮
  const onTapBtn = () => {
    const s = state.value
    if (s === 11 || s === 12 || s === 14 || s === 15) {
      toHome()
    }
    else {
      enterRoom()
    }
  }

  const onTapBtn2 = () => {
    toContact()
  }

  // 主动点击离开
  const onTapLeave = async () => {
    const res = await cui.showModal({
      title: "离开",
      content: "确定要离开吗？"
    })
    if(res.confirm) {
      toHome()
    }
  }

  // 点击分享
  const onTapShare = () => {
    const cha = ptApi.getCharacteristic()
    if(cha.isPC) {
      const url = location.href
      ptApi.copyToClipboard(url)
      cui.showModal({
        title: "已复制链接到剪贴板",
        content: "快去跟好友们分享吧！",
        showCancel: false
      })
      return
    }
    cui.showModal({
      title: "分享",
      content: "请使用 APP 自带的分享功能，通常存在于「...」更多按钮或者带箭头↗️的分享按钮中。",
      showCancel: false
    })
  }

  const onTapEditMyName = async (e: PageParticipant) => {
    if(!e.isMe) return
    const res = await cui.showTextEditor({
      title: "修改昵称",
      value: e.nickName,
      placeholder: "请输入昵称"
    })
    if(res.confirm && res.value) {
      if(res.value !== e.nickName) toEditMyName(res.value)
    }
  }

  return { 
    btnText, 
    btnText2, 
    h1, 
    pText, 
    onTapBtn, 
    onTapBtn2, 
    onTapLeave, 
    onTapShare, 
    onTapEditMyName,
  }
}