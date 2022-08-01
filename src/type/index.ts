
// 请求回调的公共入参
export interface RequestParam {
  "x-pt-version": string
  "x-pt-client": string
  "x-pt-stamp": number
  "x-pt-language": string
  "x-pt-local-id": string
  [otherParam: string]: any
}

// 请求回调的结果
export interface RequestRes {
  code: string
  errMsg?: string
  showMsg?: string
  data?: Record<string, any>
}

