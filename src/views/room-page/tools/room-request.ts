import rq from "../../../request"
import { RequestRes, RoRes } from "../../../type"
import api from "../../../request/api"

const url = api.ROOM_OPERATE

// 请求进入房间
export const request_enter = async(roomId: string, nickName: string): Promise<RequestRes<RoRes>> => {
  let param = { operateType: "ENTER", roomId, nickName }
  let res = await rq.request<RoRes>(url, param)
  return res
}

// 请求心跳
export const request_heartbeat = async(roomId: string, nickName: string): Promise<RequestRes<RoRes>> => {
  let param = { operateType: "HEARTBEAT", roomId, nickName }
  let res = await rq.request<RoRes>(url, param)
  return res
} 

// 请求离开
export const request_leave = async(roomId: string, nickName: string): Promise<RequestRes<RoRes>> => {
  let param = { operateType: "LEAVE", roomId, nickName }
  let res = await rq.request<RoRes>(url, param)
  return res
}