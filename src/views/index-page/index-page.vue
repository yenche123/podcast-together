<script setup lang="ts">
import PtButton from "../../components/pt-button.vue"
import { useRouter } from "../../routes/pt-router"
import images from "../../images"
import { onActivated } from "vue";
import share from "../../utils/share";
import { useTheme } from "../../hooks/useTheme";

let { theme } = useTheme()

const router = useRouter()

onActivated(() => {
  console.log("打开首页，去设置分享...........")
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
    </div>
  </div>

  <div class="page-btns-container">
    <div class="page-btns">
      <pt-button class="index-main-btn" text="创建房间" @click="onTapCreateBtn"></pt-button>

      <a href="https://github.com/yenche123/podcast-together" target="_blank">
        <div class="index-other-btn">
          <img :src="theme === 'light' ? images.GITHUB : images.GITHUB_DM" class="index-github"/>
          <span>开源地址</span>
        </div>
      </a>
      
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