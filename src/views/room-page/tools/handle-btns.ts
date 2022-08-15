import { computed, Ref } from "vue"
import { PageState } from "../../../type/type-room-page"
import { enterRoom } from "./useRoomPage"

export function initBtns(state: Ref<PageState>, toHome: () => void) {
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
    console.log("去联系开发者........")
  }

  return { btnText, btnText2, h1, pText, onTapBtn, onTapBtn2 }
}