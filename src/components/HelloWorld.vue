<script setup lang="ts">

import { useTheme, ThemeType } from '../hooks/useTheme';
const { theme, setTheme } = useTheme()

const onTapBtn = () => {
  let newT: ThemeType = theme.value === "dark" ? "light" : "dark"
  setTheme(newT)
}

</script>

<template>
  <p>当前主题: {{ theme }}</p>
  <button @click="onTapBtn">切换</button>
</template>

<style scoped>
p {
  color: var(--text-color);
}
</style>