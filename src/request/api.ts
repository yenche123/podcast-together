// 记录各个 api 所对应的路径

import util from "../utils/util"

const _env = util.getEnv()
const apiUrl = _env.API_URL + "/"

export default {
  ROOM_OPERATE: apiUrl + "room-operate",
  PARSE_TEXT: apiUrl + "parse-text",
  PT_SERVICE: apiUrl + "pt-service"
}