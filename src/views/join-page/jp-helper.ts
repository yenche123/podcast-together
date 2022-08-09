
import { PtRouter, VueRoute } from "../../routes/pt-router"
import time from "../../utils/time"
import ptUtil from "../../utils/pt-util"

let lastCheckInputStamp: number = 0

const finishInput = (nickName: string, router: PtRouter, route: VueRoute): void => {
  const now = time.getTime()
  if(lastCheckInputStamp + 300 > now) return
  lastCheckInputStamp = now

  let userData = ptUtil.getUserData()
  userData.nickName = nickName
  ptUtil.setUserData(userData)

  // 两种情况:
  // 1. 有 roomId 去加入会议
  // 2. 去创建房间
  const q = route.query
  if(q.roomId) {
    // 去加入房间
    router.push({ name: "room", params: { roomId: q.roomId as string } })
  }
  else {
    // 去创建房间
    router.push({ name: "create" })
  }
}


export default {
  finishInput
}