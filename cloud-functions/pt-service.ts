
//@ts-ignore
import cloud from '@/cloud-sdk'

//@ts-ignore
exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query, method, headers } = ctx

  console.log("headers: ")
  console.log(headers)
  console.log(" ")
  console.log("body: ")
  console.log(body)
  console.log(" ")
  console.log("method: ")
  console.log(method)
  console.log(" ")

  if (method !== "POST") {
    return { code: "E4005" }
  }

  return { code: "0000", data: { stamp: Date.now() } }
}
