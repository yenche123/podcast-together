<script setup lang="ts">
import { initModal } from "./modal"
import { initLoading } from "./loading"
import { initTextEditor } from "./text-editor";

const {
  enable: modalEnable,
  show: modalShow,
  modalData,
  onTapConfirm: onTapModalConfirm,
  onTapCancel: onTapModalCancel,
  TRANSITION_DURATION: modalTranMs,
} = initModal()

const {
  title: loadingTitle,
  enable: loadingEnable,
  show: loadingShow,
  TRANSITION_DURATION: loadingTranMs,
} = initLoading()

const {
  enable: teEnable,
  show: teShow,
  teData,
  onTapConfirm: onTapTeConfirm,
  onTapCancel: onTapTeCancel,
  inputEl: textEditorInputEl,
  canSubmit: canTextEditorSubmit,
} = initTextEditor()

</script>
<template>

  <!-- 弹窗 -->
  <div 
    v-if="modalEnable" 
    class="cui-modal-container" 
    :class="{ 'cui-modal-container_show': modalShow }"
  >
    <div class="cui-modal-bg"></div>
    <div class="cui-modal-box">
      <h1 v-if="modalData.title">{{ modalData.title }}</h1>
      <p v-if="modalData.content">{{ modalData.content }}</p>
      <div class="cui-modal-btns">
        <div 
          v-if="modalData.showCancel" 
          class="cui-modal-btn"
          @click="onTapModalCancel"
        >{{ modalData.cancelText }}</div>
        <div 
          class="cui-modal-btn cui-modal-confirm"
          @click="onTapModalConfirm"
        >{{ modalData.confirmText }}</div>
      </div>
    </div>
  </div>

  <!-- 文字输入框 -->
  <div 
    v-if="teEnable" 
    class="cui-modal-container" 
    :class="{ 'cui-modal-container_show': teShow }"
  >
    <div class="cui-modal-bg"></div>
    <div class="cui-modal-box">
      <h1 v-if="teData.title">{{ teData.title }}</h1>
      <input class="cui-text-editor-input" 
        v-model="teData.value" 
        ref="textEditorInputEl" 
        :placeholder="teData.placeholder ? teData.placeholder: '请输入文字'"
        :maxlength="teData.maxLength"
      />
      <div class="cui-modal-btns">
        <div 
          class="cui-modal-btn"
          @click="onTapTeCancel"
        >取消</div>
        <div 
          class="cui-modal-btn cui-modal-confirm"
          :class="{ 'cui-btn_disabled': !canTextEditorSubmit }"
          @click="onTapTeConfirm"
        >确定</div>
      </div>
    </div>
  </div>

  <!-- 加载 loading 框 -->
  <div
    v-if="loadingEnable"
    class="cui-loading-container"
    :class="{ 'cui-loading-container_show': loadingShow }"
  >
    <div class="cui-loading-box">
      <div class="cui-loading-pulsar"></div>
      <span v-if="loadingTitle" class="cui-loading-title">{{ loadingTitle }}</span>
    </div>
  </div>

</template>

<style scoped lang="scss">

/** 弹窗 */
.cui-modal-container {
  width: 100%;
  height: 100vh;
  position: fixed;
  z-index: 5100;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: v-bind("modalTranMs + 'ms'");
  opacity: 0;

  &.cui-modal-container_show {
    opacity: 1;
  }

  .cui-modal-bg {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .8);
    z-index: 5105;
  }

  .cui-modal-box {
    width: 92%;
    max-width: var(--standard-max-px);
    background-color: var(--bg-color);
    box-sizing: border-box;
    padding: 28px 6% 18px;
    border-radius: 25px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 5110;
    position: relative;

    h1 {
      font-size: var(--title-font);
      font-weight: 700;
      color: var(--text-color);
      line-height: 1.5;
      margin-bottom: 10px;
      margin-block-start: 0;
      margin-block-end: 20px;
    }

    p {
      font-size: var(--desc-font);
      color: var(--text-color);
      line-height: 1.5;
      margin-block-start: 0;
      margin-block-end: 20px;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      user-select: text;
    }

    .cui-modal-btns {
      width: 100%;
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      position: relative;

      .cui-modal-btn {
        padding: 10px 16px;
        border-radius: 20px;
        font-size: var(--btn-font);
        color: var(--other-btn-text);
        background-color: var(--other-btn-bg);
        transition: .15s;
        max-width: 45%;
        min-width: 30%;
        text-align: center;
        margin-bottom: 10px;
        cursor: pointer;

        &:hover, &:active {
          background-color: var(--other-btn-hover);
        }
      }

      .cui-modal-confirm {
        color: var(--main-btn-text);
        background-color: var(--main-btn-bg);

        &:hover, &:active {
          background-color: var(--hover-btn-bg);
        }
      }
    }
  }

}

/** text-editor */
.cui-text-editor-input {
  font-size: var(--desc-font);
  color: var(--text-color);
  line-height: 1.5;
  margin-block-start: 0;
  margin-block-end: 20px;
  width: 100%;
  text-align: center;
  border: 0;
  outline: none;

  &::-webkit-input-placeholder {
    color: var(--note-color);
  }
}

.cui-btn_disabled {
  opacity: .6;
  cursor: default;
}


/** 加载框 */
.cui-loading-container {
  width: 100%;
  height: 100vh;
  position: fixed;
  z-index: 5200;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: v-bind("loadingTranMs + 'ms'");
  opacity: 0;

  &.cui-loading-container_show {
    opacity: 1;
  }

  .cui-loading-box {
    z-index: 5210;
    width: 45vw;
    height: 45vw;
    max-width: 160px;
    max-height: 160px;
    min-width: 120px;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    background-color: #2e2e2e;
    color: #eee;
    position: relative;

    /** 来自 https://uiball.com/loaders/ */
    .cui-loading-pulsar {
      --uib-size: 40px;
      --uib-speed: 1.5s;
      position: relative;
      height: var(--uib-size);
      width: var(--uib-size);
    }

    .cui-loading-pulsar::before,
    .cui-loading-pulsar::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      border-radius: 50%;
      background-color: #eee;
      animation: pulse var(--uib-speed) ease-in-out infinite;
      transform: scale(0);
    }

    .cui-loading-pulsar::after {
      animation-delay: calc(var(--uib-speed) / -2);
    }

    @keyframes pulse {
      0%,
      100% {
        transform: scale(0);
        opacity: 1;
      }
      50% {
        transform: scale(1);
        opacity: 0.25;
      }
    }

    .cui-loading-title {
      font-size: var(--mini-font);
      margin-top: 17px;
      max-width: 80%;
      text-overflow: ellipsis;
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      display: inline-block;
    }

  }


}





</style>