// 记录各个 api 所对应的路径
const apiUrl = import.meta.env.VITE_API_URL + "/"

export default {
  ROOM_OPERATE: apiUrl + "room-operate",
  PARSE_TEXT: apiUrl + "parse-text",
  PT_SERVICE: apiUrl + "pt-service"
}