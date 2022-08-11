<script setup lang="ts">
import 'shikwasa/dist/shikwasa.min.css'
import PtButton from "../../components/pt-button.vue"
import { useRouter } from "../../routes/pt-router"


</script>

<template>
  <div class="page">
    <div class="page-container">

      <!-- 播放器 -->
      <div ref="pContainer" class="rp-player"></div>

    </div>
  </div>
</template>

<style scoped lang="scss">

.rp-player {
  width: 100%;
  position: relative;
}




</style>