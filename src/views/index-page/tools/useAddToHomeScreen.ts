import { ref, onMounted } from "vue";

let deferredPrompt: Event | null
const showInstallPwaBtn = ref(false)

async function onTapInstall() {
  if(!deferredPrompt) {
    showInstallPwaBtn.value = false
    return
  }

  //@ts-ignore
  deferredPrompt.prompt()

  //@ts-ignore
  const userChoice = await deferredPrompt.userChoice
  if(userChoice?.outcome === "accepted") {
    console.log('User accepted the A2HS prompt');
    deferredPrompt = null
    showInstallPwaBtn.value = false
  }
  else {
    console.log('User dismissed the A2HS prompt');
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