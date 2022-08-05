<script setup lang="ts">
import { computed, ref } from 'vue';
import { hasPreviousRouteInApp, goHome, useRouteAndPtRouter } from "../../routes/pt-router";
import PtButton from "../../components/pt-button.vue"
import jh from "./jp-helper"

const { router, route } = useRouteAndPtRouter()
const hasPrev = hasPreviousRouteInApp()
console.log("join-page setup............")
console.log("hasPrev: ", hasPrev)

const inputValue = ref<string>("")
const canSubmit = computed(() => {
  let val = inputValue.value
  let v = val.trim()
  if(v.length > 0) return true
  return false
})

const onInputConfirm = () => {
  if(!canSubmit.value) return
  jh.finishInput(inputValue.value, router, route)
}

const onTapConfirm = () => {
  if(!canSubmit.value) return
  jh.finishInput(inputValue.value, router, route)
}

const onTapBack = () => {
  if(hasPrev) router.go(-1)
  else {
    goHome(router)
  }
}

</script>

<template>
  <div class="page">
    <div class="page-container">
      <h1>你的昵称</h1>
      <input 
        v-model="inputValue" 
        placeholder="请输入你的昵称" 
        type="text" 
        @keyup.enter="onInputConfirm" 
        maxlength="20"
      />
    </div>
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

<style lang="scss">

.page-container {

  h1 {
    font-size: 38px;
    line-height: 50px;
    color: var(--text-color);
    letter-spacing: 2px;
    margin-bottom: 50px;
  }

  input {
    font-size: 38px;
    line-height: 50px;
    color: var(--desc-color);
    border: 0;
    outline: none;
    text-align: center;
  }

  input::-webkit-input-placeholder {
    color: var(--note-color);
  }

}

.join-main-btn {
  margin-bottom: 20px;
}




</style>