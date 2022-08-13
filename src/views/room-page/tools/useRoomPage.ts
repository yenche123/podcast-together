import { ref, reactive, onActivated, onDeactivated, nextTick } from "vue"
import { PageData, PageState, WsMsgRes, RoomStatus, PlayStatus } from "../../../type/type-room-page"
import { ContentData, RoRes } from "../../../type"
import { RouteLocationNormalizedLoaded } from "vue-router"
import { useRouteAndPtRouter, PtRouter, goHome } from "../../../routes/pt-router"
import ptUtil from "../../../utils/pt-util"
import api from "../../../request/api"
import rq from "../../../request"
import Shikwasa from "shikwasa2"
import util from "../../../utils/util"
import time from "../../../utils/time"
import playerTool from "./player-tool"
import { showParticipants } from "./show-participants"

// 一些常量
const COLLECT_TIMEOUT = 300    // 收集最新状态的最小间隔

// 播放器
let player: any;
const playerEl = ref<HTMLElement | null>(null)
let playStatus: PlayStatus = "PAUSED"    // 播放状态

// 路由
let router: PtRouter
let route: RouteLocationNormalizedLoaded

// web socket
let ws: WebSocket | null = null

// 绑定到页面的数据
const pageData: PageData = reactive({
  state: 1,
  roomId: "",
  participants: []
})

// 其他杂七杂八的数据
let nickName: string = ""
let localId: string = ""
let guestId: string = ""
let intervalHb: number = 0      // 维持心跳的 interval 的返回值
let timeoutCollect: number = 0  // 上报最新播放状态的 timeout 的返回值
let srcDuration: number = 0     // 资源总时长（秒），如果为 0 代表还没解析出来
let waitPlayer: Promise<boolean>
let isIniting: boolean = true   // 从 enterRoom 到第一次 receiveNewStatusFromWs 的过程

// 是否为远端调整播放器状态，如果是，则在监听 player 各回调时不往下执行
let isRemoteSetSeek = false
let isRemoteSetPlaying = false
let isRemoteSetPaused = false
let isRemoteSetSpeedRate = false

const toHome = () => {
  goHome(router)
}

export const useRoomPage = () => {
  const rr = useRouteAndPtRouter()
  router = rr.router
  route = rr.route
  
  init()

  return { pageData, playerEl, route, router, toHome }
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
export async function enterRoom() {
  let roomId: string = route.params.roomId as string
  pageData.roomId = roomId
  pageData.state = 1
  isIniting = true

  let userData = ptUtil.getUserData()
  nickName = userData.nickName as string
  localId = userData.nonce as string
  
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
    await nextTick()
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
  else if(code === "R0001") {
    pageData.state = 15
  }
  else {
    pageData.state = 20
  }
}

// 成功进入房间后: 
//    赋值 / 创建播放器 / 开启 20s 轮询机制 / 建立 webSocket
function afterEnter(roRes: RoRes) {
  pageData.content = roRes.content
  pageData.participants = showParticipants(roRes.participants)
  guestId = roRes?.guestId as string

  createPlayer()
  heartbeat()
  connectWebSocket()
}

// 创建播放器
function createPlayer() {
  let content = pageData.content as ContentData

  type SimpleFunc = (param1: boolean) => void
  let playerAlready: SimpleFunc
  waitPlayer = new Promise((a: SimpleFunc) => {
    playerAlready = a
  })

  const audio = {
    src: content.audioUrl,
    title: content.title,
    cover: content.imageUrl,
    album: content.imageUrl,
    artist: content.seriesName,
  }

  player = new Shikwasa({
    container: () => playerEl.value,
    audio,
    themeColor: "var(--text-color)",
    speedOptions: playerTool.initSpeedOptions(),
  })

  // 去监听 播放器的各个事件回调
  player.on("abort", (e: Event) => {
    console.log("player abort.............")
    console.log(e)
    console.log(" ")
  })

  player.on("canplay", (e: Event) => {
    console.log("player canplay.............")
    console.log(e)
    console.log(" ")
  })

  player.on("complete", (e: Event) => {
    console.log("player complete.............")
    console.log(e)
    console.log(" ")
  })

  player.on("durationchange", (e: any) => {
    let myAudio = e?.path?.[0]
    let duration = myAudio?.duration
    console.log("player durationchange................")
    console.log("看一下时长: ", duration)
    console.log(" ")
    if(duration) {
      srcDuration = duration
    }
  })

  player.on("emptied", (e: Event) => {
    console.log("player emptied.............")
    console.log(e)
    console.log(" ")
  })

  player.on("ended", (e: Event) => {
    console.log("player ended.............")
    console.log(e)
    console.log(" ")
  })

  player.on("error", (e: Event) => {
    console.log("player error.............")
    console.log(e)
    console.log(" ")
  })

  player.on("canplay", (e: Event) => {
    console.log("player canplay.............")
    console.log(e)
    console.log(" ")
  })

  player.on("loadeddata", (e: Event) => {
    console.log("player loadeddata.............")
    console.log(e)
    console.log(" ")
    if(pageData.state <= 2) {
      pageData.state = 3
    }
    console.log("回调 playerAlready..........")
    playerAlready(true)
  })

  player.on("pause", (e: Event) => {
    playStatus = "PAUSED"
    if(isRemoteSetPaused) {
      isRemoteSetPaused = false
      return
    }

    console.log("player pause.............")
    console.log(e)
    console.log(" ")
    collectLatestStauts()
  })

  player.on("playing", (e: Event) => {
    playStatus = "PLAYING"
    if(isRemoteSetPlaying) {
      isRemoteSetPlaying = false
      return
    }

    console.log("player playing.............")
    console.log(e)
    console.log(" ")
    collectLatestStauts()
  })

  player.on("ratechange", (e: Event) => {
    if(isRemoteSetSpeedRate) {
      isRemoteSetSpeedRate = false
      return
    }
    console.log("player ratechange.............")
    console.log(e)
    console.log(" ")
    collectLatestStauts()
  })

  player.on("seeked", (e: Event) => {
    if(isRemoteSetSeek) {
      isRemoteSetSeek = false
      return
    }
    console.log("player seeked.............")
    console.log(e)
    console.log(" ")
    collectLatestStauts()
  })

  player.on("timeupdate", (e: Event) => {
    // console.log("player timeupdate.............")
    // console.log(e)
    // console.log(" ")
  })

  player.on("waiting", (e: Event) => {
    console.log("player waiting.............")
    console.log(e)
    console.log(" ")
  })
}

// 收集最新状态，再用 ws 上报
function collectLatestStauts() {
  if(timeoutCollect) clearTimeout(timeoutCollect)

  const _collect = () => {
    if(!player) return
    const currentTime = player.currentTime ?? 0
    const contentStamp = currentTime * 1000
    const param = {
      operateType: "SET_PLAYER",
      roomId: pageData.roomId,
      "x-pt-local-id": localId,
      "x-pt-stamp": time.getTime(),
      playStatus,
      speedRate: String(player.playbackRate),
      contentStamp,
    }

    console.log("看一下使用 ws 的上报数据: ")
    console.log(param)
    console.log(" ")
    const msg = JSON.stringify(param)
    ws?.send(msg)
  }

  timeoutCollect = setTimeout(() => {
    _collect()
  }, COLLECT_TIMEOUT)
}


// 每若干秒的心跳
function heartbeat() {
  const _env = util.getEnv()
  console.log("_env: ")
  console.log(_env)
  console.log(" ")

  const _closeRoom = (val: PageState) => {
    pageData.state = val
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
  }

  const _newRoomStatus = (roRes: RoRes) => {
    pageData.content = roRes.content
    pageData.participants = showParticipants(roRes.participants)
  }

  intervalHb = setInterval(async () => {
    const param = {
      operateType: "HEARTBEAT",
      roomId: pageData.roomId,
      nickName,
    }
    const url = api.ROOM_OPERATE
    const res = await rq.request<RoRes>(url, param)
    console.log("看一下心跳结果.....")
    console.log(res)
    console.log(" ")
    if(!res) return
    const { code, data } = res
    if(code === "0000") {
      _newRoomStatus(data as RoRes)
    }
    else if(code === "E4004") {
      _closeRoom(12)
    }
    else if(code === "E4006") {
      _closeRoom(11)
    }
    else if(code === "E4003") {
      _closeRoom(14)
    }

  }, _env.HEARTBEAT_PERIOD * 1000)
}

// 使用 web-socket 去建立连接
function connectWebSocket() {
  const { VITE_WEBSOCKET_URL } = import.meta.env
  ws = new WebSocket(VITE_WEBSOCKET_URL)

  ws.onopen = (socket: Event) => {
    console.log("ws opened.........")
    console.log(socket)
    console.log(" ")
  }

  ws.onmessage = (res) => {
    const message = res.data
    const msgRes = util.strToObj<WsMsgRes>(message)
    console.log("web-socket 收到新的的消息.......")
    console.log(msgRes)
    console.log(" ")

    if(!msgRes) return
    const { responseType: rT, roomStatus } = msgRes

    // 刚连接
    if(rT === "CONNECTED") {
      firstSend()
    }
    else if(rT === "NEW_STATUS" && roomStatus) {
      receiveNewStatusFromWs(roomStatus)
    }
  }
}

// "首次发送" 给 websocket
function firstSend() {
  const send = {
    operateType: "FIRST_SEND",
    roomId: pageData.roomId,
    "x-pt-local-id": localId,
    "x-pt-stamp": time.getTime()
  }

  console.log("发送 首次发送啦！！！")
  console.log(send)
  console.log(" ")

  const msg = JSON.stringify(send)
  ws?.send(msg)
}

async function receiveNewStatusFromWs(newStatus: RoomStatus) {
  if(newStatus.roomId !== pageData.roomId) return
  if(isIniting) {
    isIniting = false
  }
  else if(newStatus.operator === guestId) {
    return
  }

  console.log("等待 player 初始化成功..........")
  await waitPlayer
  console.log("player 已初始化完成..........")
  
  let { contentStamp } = newStatus

  // 判断时间
  let rCurrentTimeMs = playerTool.getRemoteCurrentTime(newStatus, srcDuration)
  let currentTimeMs = player.currentTime * 1000
  let diff1 = Math.abs(rCurrentTimeMs - currentTimeMs)

  console.log("远程播放器时间 (ms): ", rCurrentTimeMs)
  console.log("当前播放器时间 (ms): ", currentTimeMs)
  console.log(" ")

  if(diff1 > 1100) {
    isRemoteSetSeek = true
    let newCurrentTime = Math.round(rCurrentTimeMs / 1000)
    player.seek(newCurrentTime)
  }

  // 判断倍速
  let rSpeedRate = newStatus.speedRate
  let speedRate = String(player.playbackRate)
  console.log("远程播放器的倍速: ", rSpeedRate)
  console.log("当前播放器的倍速: ", speedRate)
  if(rSpeedRate !== speedRate) {
    console.log("播放器倍速不一致，请求调整......")
    isRemoteSetSpeedRate = true
    let speedRateNum = Number(rSpeedRate)
    console.log(speedRateNum)
    player.playbackRate = speedRateNum
  }

  // 判断播放状态
  let rPlayStatus = newStatus.playStatus
  let diff2 = (srcDuration * 1000) - contentStamp
  if(rPlayStatus !== playStatus) {
    // 如果剩下 1s 就结束了 还要播放，进行阻挡
    if(rPlayStatus === "PLAYING" && diff2 < 1000) return
    if(rPlayStatus === "PLAYING") {
      console.log("远端请求播放......")
      isRemoteSetPlaying = true
      player.play()
    }
    else {
      console.log("远端请求暂停......")
      isRemoteSetPaused = true
      player.pause()
    }
  }
  
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
