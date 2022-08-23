import rq from "../../request"
import { RequestRes, RoRes, ContentData } from "../../type"
import api from "../../request/api"
import ptUtil from "../../utils/pt-util"

export const request_parse = async (link: string): Promise<RequestRes<ContentData>> => {
  const url = api.PARSE_TEXT
  const res = await rq.request<ContentData>(url, { link })
  return res
}

export const request_create = async (roomData: ContentData): Promise<RequestRes<RoRes>> => {
  const url = api.ROOM_OPERATE
  let userData = ptUtil.getUserData()
  const param = {
    operateType: "CREATE",
    roomData,
    nickName: userData.nickName,
  }
  const res = await rq.request<RoRes>(url, param)
  return res
}