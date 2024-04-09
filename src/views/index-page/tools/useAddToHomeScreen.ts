import { ref, onMounted } from "vue";
import time from "../../../utils/time";
import cui from "../../../components/custom-ui";

let deferredPrompt: Event | null
const showInstallPwaBtn = ref(false)

async function onTapInstall() {
  if(!deferredPrompt) {
    showInstallPwaBtn.value = false
    return
  }

  //@ts-ignore
  deferredPrompt.prompt()

  let installStamp = time.getTime()
  
  //@ts-ignore
  const userChoice = await deferredPrompt.userChoice
  if(userChoice?.outcome === "accepted") {
    console.log('User accepted the A2HS prompt')
    deferredPrompt = null
    showInstallPwaBtn.value = false
    return
  }

  console.log('User dismissed the A2HS prompt')
  console.log(userChoice)
  
  if(time.isWithinMillis(installStamp, 60)) {
    await cui.showModal({
      title: "安装失败",
      content: "你的浏览器似乎不支持安装 PWA 应用",
      showCancel: false,
    })
    deferredPrompt = null
    showInstallPwaBtn.value = false
  }
}

async function startToListening() {

  // console.log("start to listen beforeinstallprompt.............")
  // console.log(" ")

  window.addEventListener("beforeinstallprompt", (e: Event) => {
    console.log("beforeinstallprompt.........")
    console.log(e)
    console.log(" ")
    e.preventDefault()

    deferredPrompt = e
    showInstallPwaBtn.value = true
  })

  window.addEventListener("appinstalled", () => {
    console.log("PWA was installed !!!!!!!!")
    console.log(" ")

    deferredPrompt = null
    showInstallPwaBtn.value = false
  })
}


export function useAddToHomeScreen() {
  
  onMounted(() => {
    startToListening()
  })

  return { showInstallPwaBtn, onTapInstall }
}