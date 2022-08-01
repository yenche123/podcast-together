// 主题状态变动类
import { ref } from "vue"

export type ThemeType = "light" | "dark"      // 用于传给布局层的主题
export type UserTheme = ThemeType | "system"  // 用户选择（或尚未选择）的主题

const m = window.matchMedia('(prefers-color-scheme: dark)')

const isDarkWhenInit: boolean = m.matches
const theme = ref<ThemeType>(isDarkWhenInit ? "dark" : "light")

export const useTheme = () => {
  const setTheme = (newTheme: ThemeType) => {
    if(newTheme === theme.value) return
    theme.value = newTheme
  }

  return { theme, setTheme }
}