<script setup lang="ts">
import { useTheme } from '../../hooks/useTheme';
import images from '../../images';
import { useContactPage } from './tools/useContactPage';
let { theme } = useTheme()

let {
  onTapWeChat,
  onTapFeishu,
  onTapEmail,
  onTapClosePreview,
  imgData,
} = useContactPage()

const doNothing = (e: Event) => {
  e.stopPropagation()
}

</script>
<template>
<div class="page">
  <div class="page-container">

    <h1>联系我</h1>

    <!-- 微信群 -->
    <div class="contact-item" @click="onTapWeChat">
      <div class="ci-img ci-img_wechat"></div>
      <div class="ci-text">
        <span>微信群</span>
      </div>
    </div>

    <!-- Github Discussions -->
    <a class="contact-item" href="https://github.com/yenche123/podcast-together/discussions" target="_blank">
      <div class="ci-img ci-img_github"></div>
      <div class="ci-text">
        <span>Github 讨论区</span>
      </div>
    </a>
    
    <!-- Feishu -->
    <div class="contact-item" @click="onTapFeishu">
      <div class="ci-img ci-img_feishu"></div>
      <div class="ci-text">
        <span>我的飞书</span>
      </div>
    </div>

    <!-- Email -->
    <div class="contact-item" @click="onTapEmail">
      <div class="ci-img ci-img_email"></div>
      <div class="ci-text">
        <span>我的邮箱</span>
      </div>
    </div>
  </div>
  <div class="page-btns-virtual"></div>
</div>

<div class="preview-container" 
  :class="{ 'preview-container_show': imgData.show }"
  @click="onTapClosePreview"
>
  <div class="preview-box"
    @click="doNothing"
  >
    <div class="pb-img-box">
      <img :src="imgData.imgUrl" class="preview-img" />
    </div>
    <p v-if="imgData.tip" class="preview-p">{{ imgData.tip }}</p>
  </div>
</div>

</template>
<style scoped lang="scss">
.page {
  min-height: 100vh;

  .page-container {
    padding-top: 60px;
  }

  h1 {
    margin-block-start: 0;
    margin-block-end: 20px;
    text-align: center;
    color: var(--text-color);
    font-size: 32px;
  }

  .page-btns-virtual {
    height: 100px;
  }
}

.contact-item {
  width: 100%;
  box-sizing: border-box;
  height: 150px;
  padding: 10px 10%;
  margin-bottom: 15px;
  position: relative;
  background-color: var(--card-color);
  line-height: 1.5;
  border-radius: 20px;
  display: flex;
  align-items: center;
  transition: .15s;
  cursor: pointer;

  &:hover, &:active {
    background-color: var(--other-btn-hover);
  }

  .ci-img {
    width: 50px;
    height: 50px;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    margin-right: 10%;

    &.ci-img_wechat {
      background-image: v-bind("'url(' + images.WECHAT + ')'");
    }

    &.ci-img_github {
      background-size: 90% 90%;
      background-image: v-bind("'url(' + (theme === 'light' ? images.GITHUB : images.GITHUB_DM) + ')'");
    }

    &.ci-img_feishu {
      background-image: v-bind("'url(' + images.FEISHU + ')'");
    }

    &.ci-img_email {
      background-size: 90% 90%;
      background-image: v-bind("'url(' + images.OUTLOOK + ')'");
    }
  }

  .ci-text {
    font-size: var(--title-font);
    color: var(--desc-color);
    font-weight: 700;
  }

}

/** 默认关闭 */
.preview-container {
  width: 100vw;
  height: 100vh;
  z-index: 1500;
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  transition: all 0.3s;
  opacity: 0;
  visibility: hidden;
  background-color: rgba(0,0,0,.75);
}

.preview-container_show {
  opacity: 1;
  visibility: visible;
}

.preview-box {
  width: 70%;
  max-width: 250px;
  padding: 15px 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--bg-color);
  position: relative;

  .pb-img-box {
    width: 100%;
    padding-bottom: 100%;
    position: relative;

    .preview-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  .preview-p {
    text-align: center;
    margin-block-start: 15px;
    margin-block-end: 0;
    font-size: var(--desc-font);
    color: var(--note-color);
  }
}


</style>