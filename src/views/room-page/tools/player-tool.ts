import { RoomStatus } from "../../../type/type-room-page";
import time from "../../../utils/time";

// 获取远端播放器当前播放到哪儿的 ms 
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

// 获取播放器的数组，此数组的值必须与 SpeedRate 定义的值相同
// 只不过一个是字符串一个是数字
function initSpeedOptions(): number[] {
  return [0.8, 1, 1.2, 1.5, 1.7]
}

export default {
  getRemoteCurrentTime,
  initSpeedOptions
}