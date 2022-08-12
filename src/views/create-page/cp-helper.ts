import api from "../../request/api"
import { PtRouter, VueRoute } from "../../routes/pt-router"
import ptApi from "../../utils/pt-api"
import time from "../../utils/time"
import { ContentData, RoRes } from "../../type"
import req from "../../request"
import cui from "../../components/custom-ui"
import ptUtil from "../../utils/pt-util"

let lastIntoFinishInput: number = 0

const _showErr = () => {
  cui.hideLoading()
  cui.showModal({ 
    title: "解析失败", 
    content: "请稍后重新尝试或更换链接", 
    showCancel: false 
  })
}

const _createRoom = async (roomData: ContentData, router: PtRouter, route: VueRoute): Promise<void> => {
  console.log("准备去创建房间...........")
  console.log(roomData)
  console.log(" ")

  let userData = ptUtil.getUserData()
  const param = {
    operateType: "CREATE",
    roomData,
    nickName: userData.nickName,
  }
  const url = api.ROOM_OPERATE
  const res = await req.request<RoRes>(url, param)
  cui.hideLoading()
  console.log("看一下创建房间的结果......")
  console.log(res)
  console.log(" ")

  if(res?.code !== "0000") {
    _showErr()
    return
  }

  const roRes = res.data as RoRes
  const roomId = roRes.roomId
  if(!roomId) {
    _showErr()
    return
  }

  router.replace({ name: "room", params: { roomId } })
}

const finishInput = async (link: string, router: PtRouter, route: VueRoute): Promise<void> => {
  const now = time.getTime()
  if(lastIntoFinishInput + 500 > now) return
  lastIntoFinishInput = now

  const url = api.PARSE_TEXT
  cui.showLoading({ title: "解析中.." })
  const res = await req.request<ContentData>(url, { link })

  console.log("在 finishInput 看一下请求结果 res:")
  console.log(res)
  console.log(" ")
  if(res?.code !== "0000") {
    _showErr()
    return
  }

  let contentData = res.data as ContentData
  _createRoom(contentData, router, route)
}

export default {
  finishInput
}