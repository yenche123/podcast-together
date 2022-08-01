<script setup lang="ts">

const props = defineProps({
  text: String,
  disabled: {
    type: Boolean,
    default: false
  },
  zIndex: Number,
  width: String,
})

const emit = defineEmits(["click"])
const onTapBtn = () => {
  
}

</script>
<template>

  <button 
    class="btn-container"
    :disabled="props.disabled"
    :style="{ width: props.width ? props.width : '100%'}"
    @click="onTapBtn"
  >{{ props.text }}</button>

</template>
<style scoped>

.btn-container {
  height: 20px;
  line-height: 20px;
  border: 0;
  border-radius: 20px;
  background-color: var(--main-btn-bg);
  color: var(--main-btn-text);
}

.btn-container:disabled {
  background-color: var(--hover-btn-bg);
}

.btn-container:hover {
  background-color: var(--hover-btn-bg);
}

.btn-container:active {
  background-color: var(--hover-btn-bg);
}


</style>