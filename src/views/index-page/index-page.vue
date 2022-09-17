<script setup lang="ts">
import PtButton from "../../components/pt-button.vue"
import { useRouter } from "../../routes/pt-router"
import images from "../../images"
import { onActivated } from "vue";
import share from "../../utils/share";
import { useTheme } from "../../hooks/useTheme";
import { useAddToHomeScreen } from "./tools/useAddToHomeScreen";

const OPEN_SOURCE_URL = "https://github.com/yenche123/podcast-together"
const { showInstallPwaBtn, onTapInstall } = useAddToHomeScreen()
let { theme } = useTheme()
const router = useRouter()

onActivated(() => {
  share.configShare()
})

const onTapCreateBtn = (e: Event) => {
  router.push({ name: "create" })
}

</script>

<template>

  <div class="page">
    <div class="page-container">
      <div class="div-bg-img index-icon-img"></div>
      <h1>一起听播客</h1>

      <a v-if="showInstallPwaBtn" class="index-opensource-url" :href="OPEN_SOURCE_URL" target="_blank">
        <img :src="theme === 'light' ? images.GITHUB : images.GITHUB_DM" class="index-ou-github"/>
      </a>
    </div>
  </div>

  <div class="page-btns-container">
    <div class="page-btns">
      <pt-button class="index-main-btn" text="创建房间" @click="onTapCreateBtn"></pt-button>

      <a v-if="!showInstallPwaBtn" :href="OPEN_SOURCE_URL" target="_blank">
        <div class="index-other-btn">
          <img :src="theme === 'light' ? images.GITHUB : images.GITHUB_DM" class="index-github"/>
          <span>开源地址</span>
        </div>
      </a>
      <div v-else class="index-other-btn" @click="onTapInstall">
        <img :src="theme === 'light' ? images.IC_DOWNLOAD : images.IC_DOWNLOAD_DM" class="index-btn-icon"/>
        <span>安装应用</span>
      </div>
      
      <p class="page-btns-p">
        本项目由开源 Serverless 平台 <a class="pbp-a" href="https://www.lafyun.com/" target="_blank">Laf</a> 全力驱动支持
      </p>
    </div>
  </div>

</template>

<style scoped lang="scss" >
.page {
  min-height: calc(100vh - 190px);

  .page-container {

    .index-icon {
      font-size: 50px;
      margin-bottom: 50px;
    }

    .index-icon-img {
      width: 60px;
      height: 60px;
      background-image: v-bind("'url(' + images.APP_LOGO + ')'");
      margin-bottom: 50px;
    }

    h1 {
      font-size: 38px;
      line-height: 50px;
      color: var(--text-color);
      letter-spacing: 2px;
    }

    .index-opensource-url {
      position: absolute;
      top: 14px;
      right: 4px;
      width: 40px;
      height: 40px;
      transition: opacity .15s;

      .index-ou-github {
        width: 100%;
        height: 100%;
        opacity: .78;
      }

      &:hover {
        opacity: .66;
      }
    }
  }
}

.page-btns-container {
  min-height: 170px;
  padding-bottom: 20px;

  .page-btns {

    .index-main-btn {
      margin-bottom: 20px;
    }

    .index-other-btn {
      height: 50px;
      width: 100%;
      border-radius: 50px;
      font-size: var(--btn-font);
      background-color: var(--other-btn-bg);
      color: var(--other-btn-text);
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-bottom: 20px;

      .index-github {
        width: 20px;
        height: 20px;
        margin-right: 10px;
      }

      .index-btn-icon {
        width: 22px;
        height: 22px;
        margin-right: 10px;
        opacity: .72;
      }
    }

    .index-other-btn:hover {
      background-color: var(--other-btn-hover);
    }

    .page-btns-p {
      font-size: 14px;
      color: var(--note-color);
      text-align: center;
      margin-block-end: 0;

      .pbp-a {
        color: var(--tap-color);
      }
    }
  }
}
</style>