<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { hasPreviousRouteInApp, goHome, useRouteAndPtRouter } from "../../routes/pt-router";
import PtButton from "../../components/pt-button.vue"
import cp from "./cp-helper"
import { useTheme } from '../../hooks/useTheme';
import images from '../../images';

const { theme } = useTheme()
const { router, route } = useRouteAndPtRouter()
const hasPrev = hasPreviousRouteInApp()
const inputValue = ref<string>("")
const inputEl = ref<HTMLInputElement | null>(null)

const canSubmit = computed(() => {
  let val = inputValue.value
  let v = val.trim()
  if(v.length < 10) return false
  const reg = /^http(s)?:\/\/[\w\.]*\w{1,32}\.\w{2,6}\S*$/g
  return reg.test(val)
})

const onInputConfirm = () => {
  console.log("取消聚焦....................")
  inputEl?.value?.blur()
  if(!canSubmit.value) return
  cp.finishInput(inputValue.value, router, route)
  
}

const onTapConfirm = () => {
  if(!canSubmit.value) return
  cp.finishInput(inputValue.value, router, route)
  inputEl?.value?.blur()
}

const onTapBack = () => {
  if(hasPrev.value) router.go(-1)
  else goHome(router)
}

// 让输入框在页面打开时聚焦
onMounted(() => {
  if(canSubmit.value) return
  inputEl.value?.focus()
})

</script>

<template>
  <div class="page">
    <div class="page-container">
      <h1>播客链接</h1>
      <input 
        v-model="inputValue" 
        placeholder="请黏贴单集链接" 
        type="url" 
        @keyup.enter="onInputConfirm" 
        maxlength="1000"
        ref="inputEl"
      />
      <p>提示: 目前支持 xiaoyuzhoufm.com、podcasts.apple.com/cn/ 或者后缀为 .mp3 的链接</p>
      <p class="check-detail">
        <a href="https://yenche.zhubai.love/posts/2172097942360440832" target="_blank">
          <div class="div-bg-img check-detail-question"></div>
          <span>查看详情</span>
        </a>
      </p>
    </div>
    <div class="page-btns-virtual"></div>
  </div>
  <div class="page-btns-container">
    <div class="page-btns">
      <pt-button 
        class="join-main-btn" 
        text="确定" 
        @click="onTapConfirm"
        :disabled="!canSubmit"
      />
      <pt-button :text="hasPrev ? '返回' : '回首页'" type="other" @click="onTapBack"></pt-button>
    </div>
  </div>
</template>

<style scoped lang="scss">

.page-btns-virtual {
  height: 50px;
}

.page-container {

  h1 {
    margin-block-start: 0;
    font-size: 38px;
    line-height: 50px;
    color: var(--text-color);
    letter-spacing: 2px;
    margin-bottom: 50px;
  }

  input {
    font-size: 32px;
    line-height: 46px;
    color: var(--desc-color);
    border: 0;
    outline: none;
    text-align: center;
  }

  input::-webkit-input-placeholder {
    color: var(--note-color);
  }

  p {
    margin-block-start: 30px;
    margin-block-end: 10px;
    font-size: 14px;
    color: var(--note-color);
    text-align: center;
    max-width: 320px;
    user-select: text;
  }

  .check-detail {
    margin-top: 0;
    
    a {
      // color: rgb(66, 133, 244);
      color: var(--tap-color);
      display: flex;
      align-items: center;

      .check-detail-question {
        width: 16px;
        height: 16px;
        opacity: .5;
        margin-right: 5px;
        background-image: v-bind("'url(' + (theme === 'light' ? images.IC_QUESTION : images.IC_QUESTION_DM) + ')'");
      }
    }
  }

}

.join-main-btn {
  margin-bottom: 20px;
}

</style>