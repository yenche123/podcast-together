// 仅用于 room-page 的类型
import { RoRes } from "./index"

/**
 * 1: 正在进入房间...
 * 2: 获取播放器状态...
 * 3: 正常
 * 
 * 11: 链接已过期: 回首页
 * 12: 查无该房间: 回首页
 * 13: 网络不佳（请检查网络状态）: 刷新 或 联系开发者
 * 14: 拒绝访问
 * 
 * 20: 未知的异常 （请检查网络状态）: 刷新 或 联系开发者
 */
export type PageState = 1 | 2 | 3 | 11 | 12 | 13 | 14 | 20

export interface PageData {
  state: PageState
  roomId: string
  roRes?: RoRes
}


