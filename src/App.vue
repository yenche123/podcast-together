<script setup lang="ts">
import { useTheme } from './hooks/useTheme';
import { useRoute } from 'vue-router';
import time from "./utils/time"
import { onMounted } from 'vue';

const { theme } = useTheme()
let a1 = time.getTime()

const route = useRoute()

</script>

<template>
  <div 
    class="classic-theme app-global"
    :class="{ 'dark-theme': theme === 'dark' }"
  >
    <keep-alive>
      <router-view v-if="route.meta.keepAlive" ></router-view>
    </keep-alive>
    <router-view v-if="!route.meta.keepAlive"></router-view>
  </div>
</template>

<style scoped>

.app-global {
  background-color: var(--bg-color);
}

</style>
