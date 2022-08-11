<script setup lang="ts">
import PtButton from "../../components/pt-button.vue"
import { useRouter } from "../../routes/pt-router"

const router = useRouter()

const onTapCreateBtn = (e: Event) => {
  router.push({ name: "join" })
}

console.log("index-page setup.............")

</script>

<template>

  <div class="page">
    <div class="page-container">
      <div class="index-icon">📻</div>
      <h1>一起听播客</h1>
    </div>
  </div>

  <div class="page-btns-container">
    <div class="page-btns">
      <pt-button class="index-main-btn" text="创建房间" @click="onTapCreateBtn"></pt-button>

      <a href="https://github.com/yenche123/podcast-together" target="_blank">
        <div class="index-other-btn">
          <img src="../../assets/github.svg" class="index-github"/>
          <span>开源地址</span>
        </div>
      </a>
      
    </div>
  </div>

</template>

<style scoped lang="scss" >
.page {

  .page-container {

    .index-icon {
      font-size: 50px;
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

      .index-github {
        width: 20px;
        height: 20px;
        margin-right: 10px;
      }
    }

    .index-other-btn:hover {
      background-color: var(--other-btn-hover);
    }
  }
}
</style>