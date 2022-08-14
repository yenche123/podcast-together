<script setup lang="ts">
import CustomUi from "./components/custom-ui/custom-ui.vue"
import { useTheme } from './hooks/useTheme'
import time from "./utils/time"
import { initPtRouter } from './routes/pt-router'
import VConsole from 'vconsole';

const vConsole = new VConsole();

const { theme } = useTheme()
let a1 = time.getTime()
const { route } = initPtRouter()

// 打印当前版本号
console.log(`###### 欢迎使用 Podcast-Together ######`)
console.log(`当前版本号: ${PT_ENV.version}`)
console.log(` `)


</script>

<template>
  <div 
    class="classic-theme app-global"
    :class="{ 'dark-theme': theme === 'dark' }"
  >

    <router-view v-if="route.meta.keepAlive" v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>

    <router-view v-else></router-view>

    <custom-ui />
  </div>
</template>

<style scoped>

.app-global {
  background-color: var(--bg-color);
}

</style>
