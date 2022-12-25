import { Ref, ref, toRef, watch } from "vue";
import type { PageData, PageParticipant } from "../../../type/type-room-page"
import cui from "../../../components/custom-ui"

export function useCccee(pageData: PageData) {
  const participants = toRef(pageData, "participants")
  const state = toRef(pageData, "state")

  let hasCccee = ref(false)
  watch([participants, state], ([newV1, newV2]) => {
    if(newV2 !== 3) return
    if(hasCccee.value) return
    if(newV1.length !== 2) return
    check(newV1, hasCccee)
  })
}

function check(
  participants: PageParticipant[],
  hasCccee: Ref<boolean>,
) {

  let hasCc = false
  let hasCee = false
  for(let i=0; i<participants.length; i++) {
    const v = participants[i]
    const name = v.nickName.toLowerCase()
    if(name.startsWith("yenche") || name.startsWith("yanzhe")) hasCc = true
    if(name.startsWith("cee")) hasCee = true
  }

  if(hasCc && hasCee) {
    hasCccee.value = true
    cui.showModal({
      title: "哇！",
      content: "cee 和 yenche 又来一起听播客了耶🥳",
      confirmText: "太好了",
      showCancel: false,
      priority: 100
    })
  }

}