<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  checked: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  }
})
const switchVal = ref(props.checked)
watch(() => props.checked, (newV, oldV) => {
  switchVal.value = newV
})

const emit = defineEmits(["change"])
const onTapToggle = () => {
  if(props.disabled) return
  switchVal.value = !switchVal.value
  emit("change", { checked: switchVal.value, msg: "toggle changes" })
}

</script>
<template>

  <div class="switch-container" @click="onTapToggle">
    <div class="switch-box" :class="{ 'switch-box_disabled': props.disabled }">
      <div class="switch-bg" :class="{ 'switch-bg_show': switchVal }"></div>
      <div class="switch-ball" :class="{ 'switch-ball_on': switchVal }"></div>
    </div>
  </div>

</template>
<style scoped>

.switch-container {
  width: 56px;
  height: 28px;
  position: relative;
  cursor: pointer;
}

.switch-box {
  border: 2px solid var(--text-color);
  width: 52px;
  height: 24px;
  border-radius: 14px;
  position: relative;
  overflow: hidden;
}

.switch-box_disabled {
  opacity: .5;
}

.switch-bg {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  opacity: 0;
  border-radius: 10px;
  overflow: hidden;
  background-color: var(--theme-a);
  transition: .2s;
}

.switch-bg_show {
  width: 48px;
  opacity: 1;
}

.switch-ball {
  margin-top: 2px;
  margin-left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
  background-color: var(--text-color);
  transition: .2s;
}

.switch-ball_on {
  transform: translateX(28px);
}


</style>