/**
 * @file 房间处理主逻辑
 * @author yenche123 <tsuiyenche@outlook.com>
 * @copyright TSUI YEN-CHE 2022
 */
import { ref, reactive, onActivated, onDeactivated, nextTick } from "vue"
import { PageData, PageState, WsMsgRes, RoomStatus, PlayStatus, RevokeType } from "../../../type/type-room-page"
import { ContentData, RequestRes, RoRes } from "../../../type"
import { RouteLocationNormalizedLoaded } from "vue-router"
import { useRouteAndPtRouter, PtRouter, goHome } from "../../../routes/pt-router"
import ptUtil from "../../../utils/pt-util"
import util from "../../../utils/util"
import time from "../../../utils/time"
import playerTool from "./player-tool"
import { showParticipants } from "./show-participants"
import cui from "../../../components/custom-ui"
import images from "../../../images"
import ptApi from "../../../utils/pt-api"
import { initPlayer } from "./init-player"
import { initWebSocket, sendToWebSocket } from "./init-websocket"
import { shareData } from "./init-share"
import { request_enter, request_heartbeat, request_leave } from "./room-request"

// 一些常量
const COLLECT_TIMEOUT = 300    // 收集最新状态的最小间隔
const MAX_HB_NUM = 960    // 心跳最多轮询次数；如果每 15s 一次，相当于 4hr

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
let latestStatus: RoomStatus    // 最新的播放器状态
let isShowingAutoPlayPolicy: boolean = false  // 当前是否已在展示 autoplay policy 的弹窗
let heartbeatNum = 0            // 心跳的次数
let receiveWsNum = 0            // 收到 web-socket 的次数
let pausedSec = 0               // 已经暂停的秒数

// 时间戳
let lastOperateLocalStamp = 0        // 上一个本地设置远端服务器的时间戳
let lastNewStatusFromWsStamp = 0    // 上一次收到 web-socket NEW_STATUS 的时间戳
let lastHeartbeatStamp = 0          // 上一次心跳的时间戳
let lastReConnectWs = 0

// 是否为远端调整播放器状态，如果是，则在监听 player 各回调时不往下执行
let isRemoteSetSeek = false
let isRemoteSetPlaying = false
let isRemoteSetPaused = false
let isRemoteSetSpeedRate = false

// 播放器准备好的回调
type SimpleFunc = (param1: boolean) => void
let playerAlready: SimpleFunc


const toHome = () => {
  goHome(router)
}

const toContact = () => {
  router.push({ name: "contact" })
}

export const useRoomPage = () => {
  const rr = useRouteAndPtRouter()
  router = rr.router
  route = rr.route
  
  init()

  return { pageData, playerEl, route, router, toHome, toContact }
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
  pausedSec = 0

  let userData = ptUtil.getUserData()
  nickName = userData.nickName as string
  localId = userData.nonce as string
  
  let res = await request_enter(roomId, nickName)
  enterResToErrState(res)
  if(!res) return
  let { code, data } = res
  if(code === "0000") {
    pageData.state = 2
    await nextTick()
    afterEnter(data as RoRes)
  }
}

function enterResToErrState(res?: RequestRes) {
  if(!res) {
    pageData.state = 13
    return
  }
  let { code } = res
  if(code === "0000") {
    return
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
  guestId = roRes?.guestId ?? ""
  pageData.content = roRes.content
  pageData.participants = showParticipants(roRes.participants, guestId)
  

  createPlayer()
  heartbeat()
  connectWebSocket()
  shareData(roRes.content, roRes.playStatus, nickName)
}

// 创建播放器
function createPlayer() {
  let content = pageData.content as ContentData

  waitPlayer = new Promise((a: SimpleFunc) => {
    playerAlready = a
  })

  const audio = {
    src: content.audioUrl,
    title: content.title,
    cover: content.imageUrl || images.APP_LOGO,
    artist: content.seriesName,
  }

  const durationchange = (duration?: number) => {
    if(duration) srcDuration = duration
    showPage()
  }
  const canplay = (e: Event) => {}
  const loadeddata = (e: Event) => {}

  const pause = (e: Event) => {
    playStatus = "PAUSED"
    if(isRemoteSetPaused) {
      isRemoteSetPaused = false
      return
    }
    collectLatestStatus()
  }
  const playing = (e: Event) => {
    pausedSec = 0
    playStatus = "PLAYING"
    if(isRemoteSetPlaying) {
      isRemoteSetPlaying = false
      return
    }
    collectLatestStatus()
  }
  const ratechange = (e: Event) => {
    if(isRemoteSetSpeedRate) {
      isRemoteSetSpeedRate = false
      return
    }
    collectLatestStatus()
  }
  const seeked = (e: Event) => {
    if(isRemoteSetSeek) {
      isRemoteSetSeek = false
      return
    }
    collectLatestStatus()
  }
  let callbacks = {
    durationchange,
    canplay,
    loadeddata,
    pause,
    playing,
    ratechange,
    seeked
  }
  player = initPlayer(playerEl, audio, callbacks)
  checkPlayerReady()
}

// 开始检测 player 是否已经 ready
async function checkPlayerReady() {
  const cha = ptApi.getCharacteristic()
  if(!cha.isIOS && !cha.isIPadOS) return
  await util.waitMilli(1500)
  if(srcDuration) return

  let res1 = await cui.showModal({
    title: "即将进入房间",
    content: "当前房间内可能正在播放中，是否进入？",
    cancelText: "离开",
    confirmText: "进入",
  })
  if(res1.cancel) {
    toHome()
    return
  }
  player.preloadForIOS()
}

function showPage(): void {
  if(pageData.state <= 2) {
    pageData.state = 3
    playerAlready(true)
  }
}

// 收集最新状态，再用 ws 上报
function collectLatestStatus() {
  lastOperateLocalStamp = time.getLocalTime()
  if(timeoutCollect) clearTimeout(timeoutCollect)

  const _collect = () => {
    if(!player) return
    const currentTime = player.currentTime ?? 0
    let contentStamp = currentTime * 1000
    contentStamp = util.numToFix(contentStamp, 0)
    const param = {
      operateType: "SET_PLAYER",
      roomId: pageData.roomId,
      "x-pt-local-id": localId,
      "x-pt-stamp": time.getTime(),
      playStatus,
      speedRate: String(player.playbackRate),
      contentStamp,
    }
    sendToWebSocket(ws, param)
    checkOperated()
  }

  timeoutCollect = setTimeout(() => {
    _collect()
  }, COLLECT_TIMEOUT)
}

// 检查操作播放器 远端是否有收到
async function checkOperated() {
  await util.waitMilli(2500)
  const now = time.getLocalTime()
  const diff = now - lastNewStatusFromWsStamp
  console.log("检查操作播放器远端是否接收 时间差 (理想状态小于 2500):")
  console.log(diff)
  console.log(" ")
  if(diff < 3000) return

  // 去重新连接 web-socket
  connectWebSocket()
}

// 每若干秒的心跳
function heartbeat() {
  const _env = util.getEnv()
  heartbeatNum = 0
  lastHeartbeatStamp = 0

  const _closeRoom = (val: PageState, sendLeave: boolean = false) => {
    pageData.state = val
    leaveRoom(sendLeave)
  }

  const _newRoomStatus = (roRes: RoRes) => {
    pageData.content = roRes.content
    pageData.participants = showParticipants(roRes.participants, guestId)

    const now = time.getLocalTime()
    const diff1 = now - lastOperateLocalStamp
    const diff2 = now - lastNewStatusFromWsStamp
    if(diff1 < 900) {
      console.log("刚刚 900ms 内本地有操作播放器")
      console.log("故不采纳心跳的 info")
      console.log(" ")
      return
    }
    if(diff2 < 900) {
      console.log("刚刚 900ms 内 web-socket 发来了最新状态")
      console.log("故不采纳心跳的 info")
      console.log(" ")
      return
    }

    latestStatus = {
      roomId: roRes.roomId,
      playStatus: roRes.playStatus,
      speedRate: roRes.speedRate,
      operator: roRes.operator,
      contentStamp: roRes.contentStamp,
      operateStamp: roRes.operateStamp
    }
    receiveNewStatus("http")
  }

  const _webSocketHb = () => {
    const send = {
      operateType: "HEARTBEAT",
      roomId: pageData.roomId,
      "x-pt-local-id": localId,
      "x-pt-stamp": time.getTime()
    }
    sendToWebSocket(ws, send)
  }

  intervalHb = setInterval(async () => {

    // 心跳数有没有超过最大值
    heartbeatNum++
    if(heartbeatNum > MAX_HB_NUM) {
      _closeRoom(16, true)
      return
    }

    // 检查上一次心跳的时间，如果超过 35s
    // 就代表被浏览器限制定时了，执行 resume
    const now = time.getLocalTime()
    if(lastHeartbeatStamp > 0 && lastHeartbeatStamp + 35000 < now) {
      resume()
      return
    }
    lastHeartbeatStamp = now

    // 检查是否已暂停 5 分钟
    if(playStatus === "PAUSED") {
      pausedSec += _env.HEARTBEAT_PERIOD
      if(pausedSec >= (5 * 60)) {
        _closeRoom(17, true)
        return
      }
    }
    else pausedSec = 0

    console.log(time.getLocalTimeStr() + " 去发送心跳 --------->")
    const res = await request_heartbeat(pageData.roomId, nickName)
    console.log("-------> 发送心跳返回")
    console.log(res)
    console.log(" ")
    if(!res) return
    const { code, data } = res
    if(code === "0000") {
      _newRoomStatus(data as RoRes)
      _webSocketHb()
    }
    else if(code === "E4004") _closeRoom(12, false)
    else if(code === "E4006") _closeRoom(11, false)
    else if(code === "E4003") _closeRoom(14, false)

  }, _env.HEARTBEAT_PERIOD * 1000)
}

// 用户息屏后、再打开，可能在这之间的定时器被浏览器限制了
// 没有了最新状态，所以进行恢复
async function resume() {
  console.log("执行 resume......................")
  console.log(" ")
  pausedSec = 0

  // 销毁心跳
  if(intervalHb) clearInterval(intervalHb)
  intervalHb = 0

  cui.showLoading({ title: "请稍等.." })

  // 关闭 web-socket
  if(ws) {
    try {
      ws.close()
    }
    catch(err) {}
    await util.waitMilli(500)
  }
  let res = await request_enter(pageData.roomId, nickName)
  console.log("重新进入房间的结果..........")
  console.log(res)
  console.log(" ")
  cui.hideLoading()
  enterResToErrState(res)
  if(!res || res.code !== "0000") {
    leaveRoom()
    return
  }
  let roRes = res.data as RoRes
  guestId = roRes.guestId ?? ""
  pageData.content = roRes.content
  pageData.participants = showParticipants(roRes.participants, guestId)
  heartbeat()
  connectWebSocket()
}

// 使用 web-socket 去建立连接
function connectWebSocket() {
  receiveWsNum = 0

  const onmessage = (msgRes: WsMsgRes) => {
    receiveWsNum++
    const { responseType: rT, roomStatus } = msgRes

    // 刚连接
    if(rT === "CONNECTED") {
      firstSend()
    }
    else if(rT === "NEW_STATUS" && roomStatus) {
      console.log("web-socket 收到新的的状态.......")
      console.log(msgRes)
      console.log(" ")
      lastNewStatusFromWsStamp = time.getLocalTime()
      latestStatus = roomStatus
      receiveNewStatus()
    }
    else if(rT === "HEARTBEAT") {
      console.log("收到 ws 的HEARTBEAT.......")
      console.log(" ")
    }
  }

  const onclose = (closeEvent: CloseEvent) => {
    const { code } = closeEvent
    const now = time.getLocalTime()

    // 监听关闭的状态码，1006 为非预期的情况
    // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
    if(code === 1006) {
      // 做一个防抖节流
      if(lastReConnectWs + 5000 > now) return
      lastHeartbeatStamp = now
      connectWebSocket()
    }
  }

  const callbacks = {
    onmessage,
    onclose
  }
  ws = initWebSocket(callbacks)
  checkWebSocket()
}

// 等待 5s 查看 web-socket 是否连接
async function checkWebSocket() {
  await util.waitMilli(5000)
  console.log("当前 web-socket 收到的消息数量: ", receiveWsNum)
  console.log(` `)
  if(receiveWsNum < 2) {
    pageData.state = 18
    leaveRoom()
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
  sendToWebSocket(ws, send)
}

async function receiveNewStatus(fromType: RevokeType = "ws") {
  if(latestStatus.roomId !== pageData.roomId) return

  await waitPlayer
  let { contentStamp, operator } = latestStatus

  // 判断时间
  let reSeekSec = playerTool.getReSeek(latestStatus, srcDuration, player.currentTime, fromType)
  if(reSeekSec >= 0) {
    isRemoteSetSeek = true
    player.seek(reSeekSec)
    checkSeek()
  }

  // 判断倍速
  let rSpeedRate = latestStatus.speedRate
  let speedRate = String(player.playbackRate)

  console.log("远端倍速: ", rSpeedRate)
  console.log("当前倍速: ", speedRate)
  console.log(" ")

  if(rSpeedRate !== speedRate) {
    console.log("播放器倍速不一致，请求调整......")
    isRemoteSetSpeedRate = true
    let speedRateNum = Number(rSpeedRate)
    player.playbackRate = speedRateNum
  }

  // 判断播放状态
  let rPlayStatus = latestStatus.playStatus
  let diff2 = (srcDuration * 1000) - contentStamp
  if(rPlayStatus !== playStatus) {
    // 如果剩下 1s 就结束了 还要播放，进行阻挡
    if(rPlayStatus === "PLAYING" && diff2 < 1000) return
    if(rPlayStatus === "PLAYING" && !isShowingAutoPlayPolicy) {
      console.log("远端请求播放......")
      isRemoteSetPlaying = true
      try {
        player.play()
      }
      catch(err) {
        console.log("播放失败.....")
        console.log(err)
      }
      checkIsPlaying()
    }
    else if(rPlayStatus === "PAUSED") {
      console.log("远端请求暂停......")
      isRemoteSetPaused = true
      player.pause()
    }
  }
}

// 由于 iOS 初始化时设置时间点 会不起作用
// 所以重新做检查
async function checkSeek() {
  await util.waitMilli(600)
  let reSeekSec = playerTool.getReSeek(latestStatus, srcDuration, player.currentTime, "check")
  if(reSeekSec >= 0) {
    isRemoteSetSeek = true
    player.seek(reSeekSec)
  }
}

async function checkIsPlaying() {
  await util.waitMilli(1500)
  const rPlayStatus = latestStatus.playStatus
  if(rPlayStatus === "PLAYING" && playStatus === "PAUSED") {
    handleAutoPlayPolicy()
  }
}

async function handleAutoPlayPolicy() {
  if(isShowingAutoPlayPolicy) return

  isShowingAutoPlayPolicy = true
  let res1 = await cui.showModal({
    title: "当前房间正在播放",
    content: "🔇还是🔊？",
    cancelText: "静音",
    confirmText: "开声音"
  })
  isShowingAutoPlayPolicy = false

  // 如果是静音
  if(res1.cancel) {
    player.muted = true
  }

  // 调整进度条
  let reSeekSec = playerTool.getReSeek(latestStatus, srcDuration, player.currentTime, "check")
  if(reSeekSec >= 0) {
    isRemoteSetSeek = true
    player.seek(reSeekSec)
  }

  // 开始播放
  if(latestStatus.playStatus === "PLAYING") {
    isRemoteSetPlaying = true
    player.play()
  }
}


// 离开房间
async function leaveRoom(sendLeave: boolean = true) {
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

  if(!sendLeave) return
  // 去发送离开房间的请求
  await request_leave(pageData.roomId, nickName)
}