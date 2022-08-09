import api from "../../request/api"
import { PtRouter, VueRoute } from "../../routes/pt-router"
import ptApi from "../../utils/pt-api"
import time from "../../utils/time"
import { ContentData } from "../../type"
import req from "../../request"
import cui from "../../components/custom-ui"

let lastIntoFinishInput: number = 0

const _showErr = () => {
  cui.hideLoading()
  cui.showModal({ 
    title: "解析失败", 
    content: "请稍后重新尝试或更换链接", 
    showCancel: false 
  })
}

const _createRoom = (roomData: ContentData, router: PtRouter, route: VueRoute) => {
  console.log("准备去创建房间...........")
  console.log(roomData)
  console.log(" ")
}

const finishInput = async (link: string, router: PtRouter, route: VueRoute): Promise<void> => {
  const now = time.getTime()
  if(lastIntoFinishInput + 500 > now) return
  lastIntoFinishInput = now

  const url = api.PARSE_TEXT
  cui.showLoading({ title: "解析中.." })
  const res = await req.request<ContentData>(url, { link })
  cui.hideLoading()

  console.log("在 finishInput 看一下 res:")
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