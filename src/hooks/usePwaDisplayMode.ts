import { onMounted, ref } from "vue"

type DisplayMode = "browser" | "standalone"

export const usePwaDisplayMode = () => {
  const displayMode = ref<DisplayMode>("browser")
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  //@ts-ignore
  if(navigator?.standalone || isStandalone) {
    displayMode.value = "standalone"
  }

  onMounted(() => {
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
      if (evt.matches) {
        displayMode.value = "standalone"
      }
      else {
        displayMode.value = "browser"
      }
      
      console.log('DISPLAY_MODE_CHANGED:::: ', displayMode.value)
      console.log(" ")
    })
  })

  return { displayMode }
}