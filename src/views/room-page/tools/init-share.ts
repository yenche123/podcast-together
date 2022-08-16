import images from "../../../images"
import { ContentData } from "../../../type"
import { ShareCfgData } from "../../../type/type-share"
import share from "../../../utils/share"

export const shareData = (c: ContentData, playStatus: string, nickName: string) => {
  let frdTitle = c.seriesName ? `${nickName} 邀请你一起听《${c.seriesName}》` : `${nickName} 邀请你一起听播客`
  let pyqTitle = c.title ? `${nickName} 邀请你一起听 ${c.title}` : `${nickName} 邀请你一起听播客`
  let desc = c.title ? c.title : "一起听播客"

  let opt: ShareCfgData = {
    title: pyqTitle,
    desc,
    imageUrl: images.APP_LOGO_COS,
    shareWay: "outside",
    wxShare: {
      frdTitle,
      frdDesc: desc,
      pyqTitle,
      link: location.href,
    }
  }
  console.log("去配置详情页的分享..........")
  console.log(opt)
  console.log(" ")
  share.configShare(opt)
}