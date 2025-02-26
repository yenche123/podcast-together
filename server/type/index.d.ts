
import { IncomingHttpHeaders } from "http"
import { Response } from "express"
import { WebSocket } from "ws"

interface File {
  /** Name of the form field associated with this file. */
  fieldname: string
  /** Name of the file on the uploader's computer. */
  originalname: string
  /**
   * Value of the `Content-Transfer-Encoding` header for this file.
   * @deprecated since July 2015
   * @see RFC 7578, Section 4.7
   */
  encoding: string
  /** Value of the `Content-Type` header for this file. */
  mimetype: string
  /** Size of the file in bytes. */
  size: number
  /** `DiskStorage` only: Directory to which this file has been uploaded. */
  destination: string
  /** `DiskStorage` only: Name of this file within `destination`. */
  filename: string
  /** `DiskStorage` only: Full path to the uploaded file. */
  path: string
}

declare global {
  interface FunctionContext {
    socket: WebSocket,
    files?: File[]
    headers?: IncomingHttpHeaders
    query?: any,
    body?: any,
    params?: any,
    auth?: any,
    requestId?: string,
    method?: string,
    response?: Response,
    __function_name?: string
  }
}

