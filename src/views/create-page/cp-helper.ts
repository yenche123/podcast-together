import { PtRouter, VueRoute } from "../../routes/pt-router"
import ptApi from "../../utils/pt-api"
import time from "../../utils/time"


let lastIntoFinishInput: number = 0

const finishInput = (link: string, router: PtRouter, route: VueRoute): void => {
  const now = time.getTime()
  if(lastIntoFinishInput + 300 > now) return
  lastIntoFinishInput = now



}

export default {
  finishInput
}