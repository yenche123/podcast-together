import images from "../../../images"
import { ContentData } from "../../../type"
import { ShareCfgData } from "../../../type/type-share"
import share from "../../../utils/share"

export const shareData = (c: ContentData, playStatus: string, nickName: string) => {
  let isPlaying = playStatus === "PLAYING" ? true : false
  let title = c.title ? c.title : "一起听播客"
  let frdTitle = title
  let pyqTitle = c.title ? `${nickName} 邀请你一起听 ${c.title}` : `${nickName} 邀请你一起听播客`
  if(isPlaying && title === c.title) title = "正在听 " + title

  let desc = c.seriesName ? `${nickName} 邀请你一起听《${c.seriesName}》` : `${nickName} 邀请你一起听播客`
  let imageUrl = c.imageUrl ? c.imageUrl : images.FAVI_ICON
  let frdImgUrl = c.imageUrl ? c.imageUrl : images.APP_LOGO_COS

  let opt: ShareCfgData = {
    title,
    desc,
    imageUrl,
    wxShare: {
      frdTitle,
      frdDesc: desc,
      frdImgUrl,
      pyqTitle,
      pyqImgUrl: frdImgUrl,
      link: location.href,
    }
  }
  console.log("去配置详情页的分享..........")
  console.log(opt)
  console.log(" ")
  share.configShare(opt)
}