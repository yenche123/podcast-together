<script setup lang="ts">
import { useTheme } from './hooks/useTheme'
import time from "./utils/time"
import { initPtRouter } from './routes/pt-router'

const { theme } = useTheme()
let a1 = time.getTime()

const { route } = initPtRouter()

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
  </div>
</template>

<style scoped>

.app-global {
  background-color: var(--bg-color);
}

</style>
