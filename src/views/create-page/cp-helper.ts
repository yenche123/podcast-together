import { PtRouter, VueRoute } from "../../routes/pt-router"
import time from "../../utils/time"
import { ContentData, RoRes } from "../../type"
import cui from "../../components/custom-ui"
import { request_create, request_parse } from "./cp-request"
import util from "../../utils/util"

let lastIntoFinishInput: number = 0

const _showErr = () => {
  cui.hideLoading()
  cui.showModal({ 
    title: "解析失败", 
    content: "请稍后重新尝试或更换链接", 
    showCancel: false 
  })
}

const _showQueryErr = async (router: PtRouter) => {
  await cui.showModal({
    title: "创建房间失败",
    content: "不妨手动黏贴单集链接以创建房间",
    showCancel: false,
  })
  router.replace({ name: "create" })
}

const _createRoom = async (
  roomData: ContentData, 
  router: PtRouter, 
  route: VueRoute,
  fromQuery: boolean = false,
): Promise<void> => {
  const res = await request_create(roomData)
  cui.hideLoading()

  if(res?.code !== "0000") {
    if(fromQuery) _showQueryErr(router)
    else _showErr()
    return
  }

  const roRes = res.data as RoRes
  const roomId = roRes.roomId
  if(!roomId) {
    if(fromQuery) _showQueryErr(router)
    else _showErr()
    return
  }

  router.replace({ name: "room", params: { roomId } })
}

const finishInput = async (link: string, router: PtRouter, route: VueRoute): Promise<void> => {
  const now = time.getTime()
  if(lastIntoFinishInput + 500 > now) return
  lastIntoFinishInput = now

  cui.showLoading({ title: "解析中.." })
  const res = await request_parse(link)
  if(res?.code !== "0000") {
    _showErr()
    return
  }

  let contentData = res.data as ContentData
  _createRoom(contentData, router, route)
}

const getTargetLink = (route: VueRoute): string => {
  let list: string[] = []

  let link = ""
  const keys = ["link", "text", "title"]
  for(let k of keys) {
    // 已完成解码
    let target = route.query[k]
    if(typeof target !== "string") continue

    list = util.getUrls(target)
    if(list.length > 0) {
      link = list[0]
      break
    }
  }

  return link
}

const useLinkFromQuery = async (router: PtRouter, route: VueRoute) => {
  const link = getTargetLink(route)
  if(!link) {
    _showQueryErr(router)
    return
  }
  const res = await request_parse(link)
  if(res?.code !== "0000") {
    _showQueryErr(router)
    return
  }

  let contentData = res.data as ContentData
  _createRoom(contentData, router, route, true)
}

export default {
  finishInput,
  useLinkFromQuery,
}