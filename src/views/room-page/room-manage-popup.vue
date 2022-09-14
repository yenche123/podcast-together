<script setup lang="ts">
import PtSwitch from '../../components/pt-switch.vue';
import PtButton from '../../components/pt-button.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  everyoneCanOperatePlayer: {
    type: String,
    default: "",
  }
})
const emit = defineEmits(["tapmask", "everyoneCanOperatePlayerChange"])
const onTapMask = () => {
  emit("tapmask", { msg: "点了蒙层" })
}
const onEveryoneCanOperatePlayerChange = (opt: { checked: boolean }) => {
  emit("everyoneCanOperatePlayerChange", opt)
}

const doNothing = (e: Event) => {
  e.stopPropagation()
}

</script>

<template>
  <div class="rmp-container" 
    :class="{ 'rmp-container_show': props.show }"
    @click="onTapMask"
  >
    <div class="rmp-box" @click="doNothing">
      <div class="rmp-first-bar">
        <div class="rmpf-title">管理</div>
      </div>
      <div class="rmp-bar">
        <div class="rmpb-hd">
          <span>允许所有人操作播放器</span>
        </div>
        <div class="rmpb-footer">
          <pt-switch :checked="props.everyoneCanOperatePlayer !== 'N'" 
            @change="onEveryoneCanOperatePlayerChange"
          ></pt-switch>
        </div>
      </div>
      <div class="rmp-btn">
        <pt-button text="关闭" type="other" @click="onTapMask"></pt-button>
      </div>
    </div>
  </div>
</template>

<style scoped>

.rmp-container {
  width: 100vw;
  height: 100vh;
  z-index: 2200;
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  transition: opacity 0.2s;
  opacity: 0;
  visibility: hidden;
  background-color: rgba(0,0,0,.75);
}

.rmp-container_show {
  opacity: 1;
  visibility: visible;
}

.rmp-box {
  width: 72%;
  max-width: 700px;
  padding: 20px 30px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  position: relative;
}

.rmp-first-bar {
  display: flex;
  flex: 1;
  position: relative;
  padding-top: 4px;
  padding-bottom: 10px;
}

.rmpf-title {
  font-size: var(--head-font);
  font-weight: 700;
  line-height: 50px;
  color: var(--text-color);
}

.rmp-bar {
  display: flex;
  flex: 1;
  position: relative;
  padding-bottom: 10px;
  justify-content: space-between;
}

.rmpb-hd {
  font-size: var(--title-font);
  color: var(--text-color);
  width: 70%;
  line-height: 32px;
  margin-right: 10px;
  padding-top: 4px;
}

.rmpb-footer {
  display: flex;
  height: 40px;
  align-items: center;
}

.rmp-btn {
  width: 40%;
  min-width: 140px;
  padding: 30px 0 6px;
  margin: auto;
}

</style>