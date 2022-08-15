import { Participant } from "../../../type"
import { PageParticipant } from "../../../type/type-room-page"
import time from "../../../utils/time"

export const showParticipants = (participants: Participant[]) => {
  let list: PageParticipant[] = []
  if(participants.length < 1) return list

  participants = participants.sort((a, b) => {
    return a.enterStamp - b.enterStamp
  })

  const now = time.getTime()
  list = participants.map(v => {
    let obj: PageParticipant = {
      guestId: v.guestId,
      nickName: v.nickName,
      enterStr: "",
    }
    const diff = now - v.enterStamp
    const sec = diff / 1000
    const min = sec / 60
    const hr = min / 60
    
    if(sec <= 60) obj.enterStr = `刚刚`
    else if(min >= 1 && min < 60) obj.enterStr = `` + Math.floor(min) + `分钟前`
    else if(hr < 2) obj.enterStr = `一小时前`
    else obj.enterStr = `两小时前`

    return obj
  })

  return list
}