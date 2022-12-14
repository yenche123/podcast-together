
import { computed, reactive, ref } from "vue"
import util from "../../../utils/util"
import { toListenEnterKeyUp, cancelListenEnterKeyUp } from "../tools/listen-keyup"

interface TextEditorSuccessRes {
  confirm: boolean
  cancel: boolean
  value: string      // 注意，如果用户点击取消，该字段仍然会有值；该字段永远反应于用户输入的文字
}

interface TextEditorParam {
  title?: string
  placeholder?: string
  value?: string          // 用户已输入的文字
  minLength?: number
  maxLength?: number
  trim?: boolean         // 默认为 true
  success?: (res: TextEditorSuccessRes) => void
}

type TextEditorResolver = (res: TextEditorSuccessRes) => void

let _success: TextEditorResolver | undefined
let _resolve: TextEditorResolver | undefined

const enable = ref(false)
const show = ref(false)
const inputEl = ref<HTMLElement | null>(null)
const TRANSITION_DURATION = 120 // 200

const DEFAULT_MIN_LENGTH = 1
const DEFAULT_MAX_LENGTH = 20

const teData = reactive({
  title: "",
  placeholder: "",
  value: "",
  minLength: DEFAULT_MIN_LENGTH,
  maxLength: DEFAULT_MAX_LENGTH,
  trim: true,
})

const canSubmit = computed(() => {
  let v = teData.value
  if(teData.trim) v = v.trim()
  if(v.length >= teData.minLength && v.length <= teData.maxLength) return true
  return false
})

const _openTextEditor = async (): Promise<void> => {
  if(show.value) return
  enable.value = true
  await util.waitMilli(16)
  show.value = true
  toListenEnterKeyUp(onTapConfirm)
}

const _closeTextEditor = async (): Promise<void> => {
  if(!show.value) return
  show.value = false

  cancelListenEnterKeyUp()

  await util.waitMilli(TRANSITION_DURATION)
  enable.value = false
}

const onTapConfirm = (): void => {
  if(!canSubmit.value) return
  const v = teData.trim ? teData.value.trim() : teData.value
  _resolve && _resolve({ confirm: true, cancel: false, value: v })
  _resolve = undefined
  _success && _success({ confirm: true, cancel: false, value: v })
  _success = undefined
  _closeTextEditor()
}

const onTapCancel = (): void => {
  const v = teData.trim ? teData.value.trim() : teData.value
  _resolve && _resolve({ confirm: false, cancel: true, value: v })
  _resolve = undefined
  _success && _success({ confirm: false, cancel: true, value: v })
  _success = undefined
  _closeTextEditor()
}

const initTextEditor = () => {
  return { enable, show, teData, onTapConfirm, onTapCancel, inputEl, canSubmit }
}

const showTextEditor = async (opt: TextEditorParam): Promise<TextEditorSuccessRes> => {
  if(opt.title) teData.title = opt.title
  else teData.title = ""

  if(opt.placeholder) teData.placeholder = opt.placeholder
  else teData.placeholder = ""

  if(opt.value) teData.value = opt.value
  else teData.value = ""

  if(typeof opt.minLength === "number") teData.minLength = opt.minLength
  else teData.minLength = DEFAULT_MIN_LENGTH
  if(typeof opt.maxLength === "number") teData.maxLength = opt.maxLength
  else teData.maxLength = DEFAULT_MAX_LENGTH

  if(typeof opt.trim === "boolean") teData.trim = opt.trim
  else teData.trim = true

  if(opt.success) {
    _success = opt.success
  }
  else {
    _success = undefined
  }

  await _openTextEditor()

  const _toFocus = async() => {
    await util.waitMilli(200)
    inputEl?.value?.focus()
  }
  _toFocus()
  
  const _wait = (a: TextEditorResolver): void => {
    _resolve = a
  }

  return new Promise(_wait)
}

export {
  initTextEditor,
  showTextEditor,
}