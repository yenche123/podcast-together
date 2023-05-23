import { Cloud } from "laf-client-sdk"
import { AxiosStatic } from "axios"
import { WebSocket } from "ws"

export type EmitFunctionType = (event: string, param: any) => void
export type GetTokenFunctionType = (payload: any, secret?: string) => string
export type ParseTokenFunctionType = (token: string, secret?: string) => any | null

interface CloudSdk extends Cloud {
  fetch: AxiosStatic
  emit: EmitFunctionType
  shared: Map<string, any>
  getToken: GetTokenFunctionType
  parseToken: ParseTokenFunctionType
  sockets: Set<WebSocket>
  appid: string
  env: {
    DB_URI?: string
    SERVER_SECRET_SALT?: string
    APP_ID?: string
    OSS_ACCESS_KEY?: string
    OSS_ACCESS_SECRET?: string
    OSS_REGION?: string
    OSS_INTERNAL_ENDPOINT?: string
    OSS_EXTERNAL_ENDPOINT?: string
    NPM_INSTALL_FLAGS?: string
    RUNTIME_IMAGE?: string
  }
}

const cloud = new Cloud({})

export default cloud as CloudSdk