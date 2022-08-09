
import { reactive, ref } from "vue"
import util from "../../../utils/util"
import { toListenEnterKeyUp, cancelListenEnterKeyUp } from "./listen-keyup"

interface ModalSuccessRes {
  confirm: boolean
  cancel: boolean
  tapType: "confirm" | "cancel" | "mask"     // 目前不会有 mask 选项
}

interface ModalParam {
  title?: string
  content?: string
  showCancel?: boolean
  cancelText?: string
  confirmText?: string
  success?: (res: ModalSuccessRes) => void
}

type ModalResolver = (res: ModalSuccessRes) => void

let _success: ModalResolver | undefined
let _resolve: ModalResolver | undefined

const enable = ref(false)
const show = ref(false)
const TRANSITION_DURATION = 120 // 200

const modalData = reactive({
  title: "",
  content: "",
  showCancel: true,
  cancelText: "取消",
  confirmText: "确定",
})

const _openModal = async (): Promise<void> => {
  if(show.value) return
  enable.value = true
  await util.waitMilli(16)
  show.value = true
  toListenEnterKeyUp(onTapConfirm)
}

const _closeModal = async (): Promise<void> => {
  if(!show.value) return
  show.value = false

  cancelListenEnterKeyUp()

  await util.waitMilli(TRANSITION_DURATION)
  enable.value = false
}

const onTapConfirm = (): void => {
  _resolve && _resolve({ confirm: true, cancel: false, tapType: "confirm" })
  _resolve = undefined
  _success && _success({ confirm: true, cancel: false, tapType: "confirm" })
  _success = undefined
  _closeModal()
}

const onTapCancel = (): void => {
  _resolve && _resolve({ confirm: false, cancel: true, tapType: "cancel" })
  _resolve = undefined
  _success && _success({ confirm: false, cancel: true, tapType: "cancel" })
  _success = undefined
  _closeModal()
}

const initModal = () => {
  return { enable, show, TRANSITION_DURATION, modalData, onTapConfirm, onTapCancel }
}

const showModal = async (opt: ModalParam): Promise<ModalSuccessRes> => {
  if(opt.title) modalData.title = opt.title
  if(opt.content) modalData.content = opt.content
  if(typeof opt.showCancel === "boolean") modalData.showCancel = opt.showCancel
  if(opt.cancelText) modalData.cancelText = opt.cancelText
  if(opt.confirmText) modalData.confirmText = opt.confirmText
  if(opt.success) _success = opt.success

  await _openModal()

  const _wait = (a: ModalResolver): void => {
    _resolve = a
  }

  return new Promise(_wait)
}

export {
  initModal,
  showModal,
}