import cloud from "@/cloud-sdk"
import * as cheerio from "cheerio"

type CheerioAPI = ReturnType<typeof cheerio.load>

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
const WX_AUDIO_URL = "https://res.wx.qq.com/voice/getvoice?mediaid="

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

  console.log("查看一下 html...........")
  console.log(html)
  console.log(" ")

  const $ = cheerio.load(html)

  let appName = ""
  let sourceType = ""

  let title = ""
  let audioUrl = ""
  let description = ""
  let imageUrl = ""
  let twitterImage = ""
  let linkUrl = ""
  let seriesName = ""
  let seriesUrl = ""

  // 是否为微信公众号
  const isMp = originLink.includes("mp.weixin.qq.com")

  $("head meta").each((i, el) => {
    let meta = $(el)
    let meta_property = meta.attr("property")
    let meta_name = meta.attr("name")
    let meta_content = meta.attr("content")

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
    else if(meta_property === "og:site_name" && !appName) {
      appName = meta_content ?? ""
    }
  })

  if(!audioUrl) {
    audioUrl = getAudioUrl(html, { isMp })
    if(!audioUrl) return { code: "E4004" }
  }

  // 如果 imageUrl 不存在 但是 twitterImage 存在图片
  if(!imageUrl && twitterImage) imageUrl = twitterImage
  if(!title) {
    let hd = $("head title")
    title = hd.text().trim() ?? ""
  }


  // 查找 seriesName / seriesUrl
  $("head script").each((i, el) => {
    let spt = $(el)
    const spt_name = spt.attr("name")
    if(spt_name === "schema:podcast-show") {
      const sptText = spt.text()
      let sptJson: any = {}
      try {
        sptJson = JSON.parse(sptText)
      }
      catch(err) {
        console.log("解析 schema:podcast-show 失败......")
      }

      // 单集链接
      let epUrl: string = sptJson?.url ?? ""
      if(epUrl) linkUrl = epUrl

      // 专栏部分
      let partOfSeries: Record<string, string> = sptJson?.partOfSeries ?? {}
      seriesName = partOfSeries.name ?? ""
      seriesUrl = partOfSeries.url ?? ""

      // 详情部分
      if(sptJson?.description) description = sptJson.description
    }
    else if(spt_name === "schema:podcast-episode") {
      // 适配 apple podcast
      const sptText = spt.text()
      let sptJson: any = {}
      try {
        sptJson = JSON.parse(sptText)
      }
      catch(err) {
        console.log("解析 schema:podcast-episode 失败......")
      }
      if(sptJson.name) title = sptJson.name
      if(sptJson.description) description = sptJson.description
      if(sptJson.isPartOf) seriesName = sptJson.isPartOf
    }
  })

  // 适配 pod.link
  const isPodLink = originLink.includes("pod.link")
  if(isPodLink) {
    let forPodLink = _handleForPodLink($, html)
    if(forPodLink.title) title = forPodLink.title
    if(forPodLink.description) description = forPodLink.description
    if(forPodLink.seriesName) seriesName = forPodLink.seriesName
    if(forPodLink.seriesUrl) seriesUrl = forPodLink.seriesUrl
    if(forPodLink.audioUrl) audioUrl = forPodLink.audioUrl
  }

  // 适配 youzhiyouxing.cn 的图片
  let isYZYX = originLink.includes("youzhiyouxing.cn")
  if(isYZYX) {
    const forYZYX = _handleForYouZhiYouXing($)
    if(!imageUrl && forYZYX.imageUrl) imageUrl = forYZYX.imageUrl
    if(!seriesName && forYZYX.seriesName) seriesName = forYZYX.seriesName
  }

  // 适配微信公众号
  if(isMp) {
    sourceType = "weixin_mp"
    imageUrl = ""    // 置为空，因为微信图片有防盗链
    const reg4Mp = /(?<=class\="profile_nickname"\>)\S+(?=\<\/strong\>)/g
    //@ts-ignore
    const matches4Mp = html.matchAll(reg4Mp)
    for(let match4Mp of matches4Mp) {
      seriesName = match4Mp[0]
    }
  }
  
  if(!linkUrl) linkUrl = originLink

  if(appName === "小宇宙") sourceType = "xiaoyuzhou"
  else if(appName === "一派·Podcast") {
    sourceType = "sspai"
    if(!seriesName) seriesName = "一派·Podcast"
    if(!seriesUrl) seriesUrl = "https://sspai.typlog.io/"
  }
  else if(isYZYX) sourceType = "youzhiyouxing"
  else if(linkUrl.includes("podcasts.apple.com")) sourceType = "apple_podcast"
  else if(appName && !seriesName) seriesName = appName

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
      seriesName,
      seriesUrl,
    }
  }

  return rData
}

// 处理 podlink 的情况
function _handleForPodLink(
  $: CheerioAPI,
  html: string,
) {

  let title = ""
  let description = ""
  let seriesName = ""
  let seriesUrl = ""
  let audioUrl = ""

  // 寻找 title / seriesName
  $(".aj.ff.gp .am.dq .am.ao").each((i, el) => {
    const theEl = $(el)
    const elText = theEl.text()
    if(elText) {
      if(i < 1) title = elText
      else seriesName = elText
    }
  })

  // 寻找 description
  $(".cx .ef.eg").each((i, el) => {
    const theEl = $(el)
    const elText = theEl.text()
    if(elText) description = elText.trim() 
  })

  // 根据 title 寻找 audioUrl
  if(title) {
    // 截断 html
    let newHtml = html
    let idx = newHtml.indexOf("window.__STATE__")
    if(idx > 0) {
      newHtml = newHtml.substring(idx)
      let idx2 = newHtml.indexOf(title)
      if(idx2 > 0) {
        newHtml = newHtml.substring(idx2)
        audioUrl = getAudioUrl(newHtml, { isMp: false })
      }
    }
  }

  return { title, description, seriesName, seriesUrl, audioUrl }
}

function _handleForYouZhiYouXing(
  $: CheerioAPI,
) {
  let imageUrl = ""
  let seriesName = ""
  $(".lazy-image-container img").each((i, el) => {
    const theEl = $(el)
    const src = theEl.attr("data-src")
    if(src) imageUrl = src
  })
  $("body .tw-text-14.tw-leading-none").each((i, el) => {
    const theEl = $(el)
    const elText = theEl.text()
    if(elText) seriesName = elText.trim()
  })
  return { imageUrl, seriesName }
}

interface GetAudioUrlParam2 {
  isMp: boolean
}

function getAudioUrl(html: string, opt: GetAudioUrlParam2): string {

  // 全局查找 mp3 或 m4a 的链接
  const reg0 = /http(s)?:\/\/[^\s\/\"\']{2,40}\/[^\s\"\']{2,240}\.(mp3|m4a)\?[^\s\/\"\']{3,240}/g
  //@ts-ignore
  let matches = html.matchAll(reg0)
  for(let match0 of matches) {
    return match0[0]
  }

  const reg = /http(s)?:\/\/[^\s\/\"\']{2,40}\/[^\s\"\']{2,240}\.(mp3|m4a)/g
  //@ts-ignore
  matches = html.matchAll(reg)
  for(let match1 of matches) {
    return match1[0]
  }

  // 适配微信公众号里的图文
  if(!opt.isMp) return ""

  const reg2 = /(?<="voice_id":")\w{10,50}(?=")/g
  //@ts-ignore
  matches = html.matchAll(reg2)
  for(let match2 of matches) {
    return WX_AUDIO_URL + match2[0]
  }

  const reg3 = /(?<='voice_id':')\w{10,50}(?=')/g
  //@ts-ignore
  matches = html.matchAll(reg3)
  for(let match3 of matches) {
    return WX_AUDIO_URL + match3[0]
  }

  return ""
}