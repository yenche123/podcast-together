<script setup lang="ts">

const props = defineProps({
  text: String,
  type: {
    type: String,
    default: "main",     // main: 主要的  other: 一般的 
  },
  disabled: {
    type: Boolean,
    default: false
  },
  zIndex: Number,
  width: String,
})

const emit = defineEmits(["click"])
const onTapBtn = (e: Event) => {
  emit("click", e)
}

</script>
<template>

  <button 
    class="btn-container"
    :class="{ 'btn-other': props.type == 'other' }"
    :disabled="props.disabled"
    :style="{ 
      'width': props.width ? props.width : '100%',
      'z-index': props.zIndex && props.zIndex > 0 ? props.zIndex : 'auto'
    }"
    @click="onTapBtn"
  >{{ props.text }}</button>

</template>
<style scoped>

.btn-container {
  height: 50px;
  line-height: 50px;
  border: 0;
  border-radius: 50px;
  background-color: var(--main-btn-bg);
  color: var(--main-btn-text);
  cursor: pointer;
  font-size: var(--btn-font);
  transition: .15s;
}

.btn-other {
  background-color: var(--other-btn-bg);
  color: var(--other-btn-text);
}

.btn-container:disabled {
  opacity: .6;
  cursor: default;
}

.btn-container:hover {
  background-color: var(--hover-btn-bg);
}

.btn-container:active {
  background-color: var(--hover-btn-bg);
}

.btn-other:hover {
  background-color: var(--other-btn-hover);
}

.btn-other:active {
  background-color: var(--other-btn-hover);
}

</style>