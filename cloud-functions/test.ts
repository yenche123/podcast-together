
const str: string = `https://chtbl.com/track/FBG437/aphid.fireside.fm/d/1437767933/4931937e-0184-4c61-a658-6b03c254754d/9f38f6eb-433a-442e-ab77-a39a4bef5b61.mp3就这样.m4a`

function judgeIsCdnLink(link: string) {
  const reg = /^http(s)?:\/\/[^\s\/]{2,30}\/\S{2,240}\.(mp3|m4a)/g
  let matches = link.match(reg)
  let txt = matches?.[0] ?? ""
  console.log("matches: ")
  console.log(matches)
  console.log("txt: ")
  console.log(txt)
  console.log("结束...........")
}

judgeIsCdnLink(str)

