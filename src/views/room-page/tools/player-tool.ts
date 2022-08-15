import { RoomStatus, RevokeType } from "../../../type/type-room-page";
import time from "../../../utils/time";
import util from "../../../utils/util";

// 监听到 player.on 的时间戳
let throttleData = {
  "canplay": 0,
  "play": 0,
  "pause": 0,
  "speed": 0,
  "seek": 0
}

type ThrottleType = keyof typeof throttleData

// 60ms 内仅触发一次
function checkThrottle(t: ThrottleType): boolean {
  let now = time.getLocalTime()
  let stamp = throttleData[t]
  if(now - stamp < 60) return false
  throttleData[t] = now
  return true
}

/**
 * 获取远端播放器当前播放到哪儿的 ms 
 * @param newStatus 最新状态
 * @param srcDuration 单集总时长，单位s
 */
function getRemoteCurrentTime(newStatus: RoomStatus, srcDuration: number): number {
  let { playStatus, contentStamp, operateStamp, speedRate } = newStatus
  if(playStatus === "PAUSED") return contentStamp

  const rate = Number(speedRate)
  const srcMs = srcDuration * 1000
  const now = time.getTime()
  let remoteMs = ((now - operateStamp) * rate) + contentStamp
  if(remoteMs >= srcMs) return srcMs
  return remoteMs
}

// 获取当前播放器 需要重新设置的秒数，如果不需要重新设置则返回 -1
function getReSeek(
  latestStatus: RoomStatus, 
  srcDuration: number, 
  currentTime: number,
  revokeType: RevokeType,
): number {
  let rPlayStatus = latestStatus.playStatus
  let threshold = rPlayStatus === "PAUSED" ? 600 : revokeType === "http" ? 2200 : 1100

  const remoteMs = getRemoteCurrentTime(latestStatus, srcDuration)
  const localMs = currentTime * 1000
  const diff = Math.abs(remoteMs - localMs)
  if(diff < threshold) return -1

  let currentSec = (remoteMs / 1000) + 0.1
  currentSec = util.numToFix(currentSec, 3)
  if(currentSec > srcDuration) currentSec = srcDuration

  return currentSec
}

// 获取播放器的数组，此数组的值必须与 SpeedRate 定义的值相同
// 只不过一个是字符串一个是数字
function initSpeedOptions(): number[] {
  return [0.8, 1, 1.2, 1.5, 1.7]
}

export default {
  checkThrottle,
  initSpeedOptions,
  getReSeek
}