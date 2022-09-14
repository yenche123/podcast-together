
import { ref } from "vue";

export function initManage() {
  const showManagePopup = ref(false)
  const onTapManageBtn = () => {
    showManagePopup.value = true
  }
  const onTapManageMask = () => {
    showManagePopup.value = false
  }

  return { showManagePopup, onTapManageBtn, onTapManageMask }
}