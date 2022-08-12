import cloud from "@/cloud-sdk"
import * as cheerio from "cheerio"

interface ContentData {
  infoType: "podcast"
  audioUrl: string
  sourceType?: string
  title?: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  seriesName?: string   // 播客专栏名称，比如 "商业就是这样"
  seriesUrl?: string    // 播客专栏链接
}

interface ResType {
  code: string
  data?: ContentData
}

const MAX_FETCH_MILLI = 4000

exports.main = async function (ctx: FunctionContext): Promise<ResType> {
  // body, query 为请求参数, auth 是授权对象

  const s1 = Date.now()

  let err = checkEntry(ctx)
  if(err) return err

  const link = ctx.body.link
  let isCdnLink = judgeIsCdnLink(link)
  if(isCdnLink) {
    return {
      code: "0000",
      data: {
        infoType: "podcast",
        audioUrl: link
      }
    }
  }
  let html = await fetchLink(link)
  if(!html) return { code: "E4004" }
  let res = parseHtml(html, link)

  const s2 = Date.now()
  console.log(`总共执行耗时: ${s2 - s1} ms`)

  return res
}

/**
 * 判断是否为 .mp3 或 .m4a 结尾的链接
 */
function judgeIsCdnLink(link: string): boolean {
  const reg = /^http(s)?:\/\/[^\s\/]{2,40}\/\S{2,240}\.(mp3|m4a)[\?=\w]*$/g
  //@ts-ignore
  let matches = link.matchAll(reg)
  for(let match of matches) {
    let mTxt = match[0]
    console.log("匹配到 cdn 链接::")
    console.log(mTxt)
    console.log(" ")
    return true
  }
  return false
}

/**
 * 检测入参和请求方式 
 */
function checkEntry(ctx: FunctionContext): ResType | null {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body = {}, query, method, headers } = ctx
  if(method !== "POST") {
    return { code: "E4005" }
  }

  console.log("看一下入参的 body:::")
  console.log(body)
  console.log(" ")

  const { link } = body
  const client_id = body["x-pt-local-id"]
  if(!link || !client_id) {
    return { code: "E4000" }
  }
  if(link.indexOf("http") !== 0) {
    return { code: "E4000" }
  }

  return null
}


async function fetchLink(link: string): Promise<string | void> {

  const _fetch = async (a: (res: string) => void): Promise<void> => {
    let hasReturn = false

    // 避免超时未响应
    setTimeout(() => {
      if(hasReturn) return
      hasReturn = true
      console.log("fetch url 超时未响应..............")
      a("")
    }, MAX_FETCH_MILLI)

    let res = await cloud.fetch({
      url: link,
      method: "get"
    })
  
    if(hasReturn) {
      return
    }
  
    const html: string = res?.data
    if(!html || typeof html !== "string") {
      a("")
      return
    }
    const lowerHtml = html.toLowerCase()
    let hasHead = lowerHtml.includes(`head`)
    let hasMeta = lowerHtml.includes(`meta`)
    if(!hasHead || !hasMeta) {
      a("")
      return
    }
    hasReturn = true
    a(html)
  }

  return new Promise(_fetch)
}


function parseHtml(html: string, originLink: string): ResType {
  const $ = cheerio.load(html)

  let appName = ""
  let sourceType = ""

  let title = ""
  let audioUrl = ""
  let description = ""
  let imageUrl = ""
  let twitterImage = ""
  let linkUrl = ""

  $("head meta").each((i, el) => {
    let meta = $(el)
    let meta_property = meta.attr("property")
    let meta_name = meta.attr("name")
    let meta_content = meta.attr("content")

    // console.log("meta_property: ", meta_property)
    // console.log("meta_name: ", meta_name)
    // console.log("meta_content: ", meta_content)
    // console.log(" ")

    if(meta_property === "og:title") {
      title = meta_content ?? ""
    }
    else if(meta_property === "og:description" || meta_property === "description") {
      description = meta_content ?? ""
    }
    else if(meta_property === "og:image") {
      imageUrl = meta_content ?? ""
    }
    else if(meta_property === "og:audio") {
      audioUrl = meta_content ?? ""
    }
    else if(meta_name === "application-name") {
      appName = meta_content ?? ""
    }
    else if(meta_property === "twitter:image") {
      twitterImage = meta_content ?? ""
    }
    else if(meta_property === "og:url") {
      linkUrl = meta_content ?? ""
    }
  })

  if(!audioUrl) {
    // 开始全局查找 mp3 或 m4a 的链接
    const reg = /http(s)?:\/\/[^\s\/]{2,40}\/\S{2,240}\.(mp3|m4a)/g
    //@ts-ignore
    let matches = html.matchAll(reg)
    for(let match of matches) {
      audioUrl = match[0]
      break
    }
    if(!audioUrl) return { code: "E4004" }
  }

  // 如果 imageUrl 不存在 但是 twitterImage 存在图片
  if(!imageUrl && twitterImage) imageUrl = twitterImage
  if(!title) {
    let hd = $("head title")
    title = hd.text().trim() ?? ""
  }
  
  if(!linkUrl) linkUrl = originLink
  if(appName === "小宇宙") sourceType = "xiaoyuzhou"

  let rData: ResType = {
    code: "0000",
    data: {
      infoType: "podcast",
      title,
      audioUrl,
      description,
      imageUrl,
      linkUrl,
      sourceType,
    }
  }

  return rData
}
