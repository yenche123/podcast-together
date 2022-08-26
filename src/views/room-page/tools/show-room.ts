import { ContentData, Participant } from "../../../type"
import { PageParticipant } from "../../../type/type-room-page"
import time from "../../../utils/time"
import util from "../../../utils/util"

export const showParticipants = (participants: Participant[], myGuestId: string) => {
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
      isMe: v.guestId === myGuestId,
    }
    const diff = now - v.enterStamp
    const sec = diff / 1000
    const min = sec / 60
    const hr = min / 60
    
    if(sec <= 60) obj.enterStr = `刚刚`
    else if(min >= 1 && min < 60) obj.enterStr = `` + Math.floor(min) + ` 分钟前`
    else if(hr < 2) obj.enterStr = `一小时前`
    else obj.enterStr = `两小时前`

    return obj
  })

  return list
}


/**
 * 是否要有“展示更多”的按钮
 * 策略: 潜在行数大于等于 5 行，肯定有该按钮，但在 3 行时就截断
 */
export const handleShowMoreBox = (content: ContentData): boolean => {
  const { title, description } = content
  if(!title || !description) return false

  // 获取可能的行数
  const rowNum = _getPotentialRow(description)
  if(rowNum < 5) return false
  return true
}


function _getPotentialRow(text: string): number {
  if(!text) return 0
  let list = text.split("\n")
  let rowNum = 0
  for(let i=0; i<list.length; i++) {
    rowNum++
    let rowText = list[i]

    if(rowText.length <= 18) continue
    let chineseNum = util.getChineseCharNum(rowText)
    let otherNum = rowText.length - chineseNum
    let scores = (chineseNum * 2) + otherNum
    rowNum += Math.floor(scores / 41)
  }
  return rowNum
}