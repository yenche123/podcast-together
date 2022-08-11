import { ref, reactive, onActivated, onDeactivated } from "vue"
import { PageData } from "../../type/room-page"
import { RoRes } from "../../type"
import { RouteLocationNormalizedLoaded } from "vue-router"
import { useRouteAndPtRouter, PtRouter } from "../../routes/pt-router"
import ptUtil from "../../utils/pt-util"
import api from "../../request/api"
import rq from "../../request"
import Shikwasa from 'shikwasa'

// 播放器
let player: any;
const playerEl = ref<HTMLElement | null>(null)

// 路由
let router: PtRouter
let route: RouteLocationNormalizedLoaded

// web socket
let ws: WebSocket | null = null

// 绑定到页面的数据
const pageData: PageData = reactive({
  state: 1,
  roomId: "",
})

// 其他杂七杂八的数据
let nickName: string = ""
let guestId: string = ""
let intervalHb: number = 0
let srcDuration: number = 0  // 资源总时长，如果为 0 代表还没解析出来


export const useRoomPage = () => {
  const rr = useRouteAndPtRouter()
  router = rr.router
  route = rr.route
  

  init()

  return { pageData, playerEl, route, router }
}

// 初始化一些东西，比如 onActivated / onDeactivated 
function init() {
  onActivated(() => {
    enterRoom()
  })

  onDeactivated(() => {
    leaveRoom()
  })
}


// 进入房间
async function enterRoom() {
  let roomId: string = route.params.roomId as string
  console.log("进入房间，看一下当前的 roomId: ", roomId)
  pageData.roomId = roomId
  pageData.state = 1

  let userData = ptUtil.getUserData()
  nickName = userData.nickName as string
  
  let param = {
    operateType: "ENTER",
    roomId,
    nickName,
  }
  const url = api.ROOM_OPERATE
  let res = await rq.request<RoRes>(url, param)
  if(!res) {
    pageData.state = 13
    return
  }
  let { code, data } = res
  if(code === "0000") {
    pageData.state = 2
    afterEnter(data as RoRes)
  }
  else if(code === "E4004") {
    pageData.state = 12
  }
  else if(code === "E4006") {
    pageData.state = 11
  }
  else if(code === "E4003") {
    pageData.state = 14
  }
  else {
    pageData.state = 20
  }
}

// 成功进入房间后: 
//    赋值 / 创建播放器 / 开启 20s 轮询机制 / 建立 webSocket
function afterEnter(roRes: RoRes) {
  pageData.roRes = roRes
  guestId = roRes?.guestId as string

  createPlayer()
  heartbeat()
  connectWebSocket()
}

function createPlayer() {
  let roRes = pageData.roRes as RoRes
  let content = roRes.content

  const audio = {
    src: content.audioUrl,
    title: content.title,
    cover: content.imageUrl,
    album: content.imageUrl,
  }

  player = new Shikwasa({
    container: () => playerEl.value,
    audio,
    themeColor: "var(--text-color)"
  })

  // 去监听 播放器的各个事件回调

}


// 每 20s 的轮询开始
function heartbeat() {
  intervalHb = setInterval(() => {

  }, 20 * 1000)
}

// 使用 web-socket 去建立连接
function connectWebSocket() {
  const { VITE_WEBSOCKET_URL } = import.meta.env
  ws = new WebSocket(VITE_WEBSOCKET_URL)



}


// 离开房间
async function leaveRoom() {

  // 销毁心跳
  if(intervalHb) clearInterval(intervalHb)
  intervalHb = 0

  // 关闭 web-socket
  if(ws) {
    ws.close()
  }

  // 销毁播放器
  if(player) {
    player.destroy()
    player = null
  }

  // 去发送离开房间的请求
  let param = {
    operateType: "LEAVE",
    roomId: pageData.roomId,
    nickName,
  }
  const url = api.ROOM_OPERATE
  const res = await rq.request<RoRes>(url, param)
  console.log("看一下离开的结果......")
  console.log(res)
  console.log(" ")
}



