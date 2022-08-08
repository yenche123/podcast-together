
import { ref } from "vue"
import ptApi from "../../../utils/pt-api"
import util from "../../../utils/util"

interface LoadingParam {
  title?: string
}

const enable = ref(false)
const show = ref(false)
const TRANSITION_DURATION = 90
const title = ref("")

const initLoading = () => {
  return { title, enable, show, TRANSITION_DURATION }
}

const showLoading = async (opt?: LoadingParam): Promise<void> => {
  if(opt && opt.title) title.value = opt.title
  else title.value = ""

  if(show.value) return
  enable.value = true
  await util.waitMilli(16)
  show.value = true
}

const hideLoading = async (): Promise<void> => {
  if(!show.value) return
  show.value = false
  await util.waitMilli(TRANSITION_DURATION)
  enable.value = false
}


export {
  initLoading,
  showLoading,
  hideLoading,
}