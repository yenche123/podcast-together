<script setup lang="ts">
import { onActivated, ref } from 'vue';
import Shikwasa from "shikwasa2"
import util from '../../utils/util';
import cui from '../../components/custom-ui';

const playerEl = ref<HTMLElement | null>(null)
const audio = {
  src: "https://cdn.sspai.com/audio/PC06.mp3",
  title: "测试中",
  cover: "/radio_3d.png",
  artist: "少数派",
}

const initPlayer = () => {
  let player = new Shikwasa({
    container: () => playerEl.value,
    audio,
    themeColor: "var(--text-color)",
    preload: "none",
  })

  player.on("audioupdate", (e: Event) => {
    console.log("player audioupdate.............")
    console.log(e)
    console.log(" ")
  })

  player.on("audioparse", (e: Event) => {
    console.log("player audioparse.............")
    console.log(e)
    console.log(" ")
  })

  // 去监听 播放器的各个事件回调
  player.on("abort", (e: Event) => {
    console.log("player abort.............")
    console.log(e)
    console.log(" ")
  })

  player.on("complete", (e: Event) => {
    console.log("player complete.............")
    console.log(e)
    console.log(" ")
  })

  player.on("durationchange", (e: any) => {
    console.log("player durationchange................")
    console.log("e:")
    console.log(e)
  })

  player.on("emptied", (e: Event) => {
    console.log("player emptied.............")
    console.log(e)
    console.log(" ")
  })

  player.on("ended", (e: Event) => {
    console.log("player ended.............")
    console.log(e)
    console.log(" ")
  })

  player.on("error", (e: Event) => {
    console.log("player error.............")
    console.log(e)
    console.log(" ")
  })

  player.on("seeking", (e: Event) => {
    console.log("seeking..........")
    console.log(e)
    console.log(" ")
  })

   player.on("seeked", (e: Event) => {
    console.log("seeked..........")
    console.log(e)
    console.log(" ")
  })

  player.on("loadeddata", (e: Event) => {
    console.log("player loadeddata.............")
    console.log(e)
    console.log(" ")
  })

  player.on("pause", (e: Event) => {

    console.log("player pause.............")
    console.log(e)
    console.log(" ")

  })

  player.on("play", (e: Event) => {

    console.log("player play.............")
    console.log(e)
    console.log(" ")

  })

  player.on("playing", (e: Event) => {

    console.log("player playing.............")
    console.log(e)
    console.log(" ")

  })

  player.on("waiting", (e: Event) => {
    console.log("player waiting.............")
    console.log(e)
    console.log(" ")
  })

  console.log("player 创建完成.............")
  console.log(player)
  console.log(" ")
  autoPlay(player)
}

const autoPlay = async (player: any) => {
  await util.waitMilli(1001)
  await cui.showModal({
    title: "即将进入房间",
    content: "房间内可能正在播放中，是否进入？",
    confirmText: "进入",
    cancelText: "离开",
  })
  console.log("执行 ")
  player.preloadForIOS()
}


onActivated(() => {
  initPlayer()
})

</script>

<template>

<div ref="playerEl" class="test-sss"></div>

</template>