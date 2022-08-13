// 仅用于 room-page 的类型
import { ContentData } from "./index"

/**
 * 1: 正在进入房间...
 * 2: 获取播放器状态...
 * 3: 正常
 * 
 * 11: 链接已过期: 回首页
 * 12: 查无该房间: 回首页
 * 13: 网络不佳（请检查网络状态）: 刷新 或 联系开发者
 * 14: 拒绝访问
 * 15：房间人数已满
 * 
 * 20: 未知的异常 （请检查网络状态）: 刷新 或 联系开发者
 */
export type PageState = 1 | 2 | 3 | 11 | 12 | 13 | 14 | 15 | 20

export interface PageParticipant {
  guestId: string
  nickName: string
  enterStr: string      // xx 分钟前进入
}

export interface PageData {
  state: PageState
  roomId: string
  content?: ContentData,
  participants?: PageParticipant[]
}

type SpeedRate = "0.8" | "1" | "1.2" | "1.5" | "1.7"

export type PlayStatus = "PLAYING" | "PAUSED"

export interface RoomStatus {
  roomId: string
  playStatus: PlayStatus
  speedRate: SpeedRate
  operator: string
  contentStamp: number
  operateStamp: number
}

export interface WsMsgRes {
  responseType: "CONNECTED" | "NEW_STATUS"
  roomStatus?: RoomStatus
}


