import cloud from '@/cloud-sdk'

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
  console.log("auth: ")
  console.log(auth)
  console.log("query: ")
  console.log(query)

  if (method !== "POST") {
    return { code: "E4005" }
  }

  return { code: "0000", data: { stamp: Date.now() } }
}
