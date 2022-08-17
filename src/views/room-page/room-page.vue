<script setup lang="ts">
import 'shikwasa2/dist/shikwasa.min.css'
import PtButton from "../../components/pt-button.vue"
import { useRoomPage } from "./tools/useRoomPage"
import ListeningLoader from '../../components/listening-loader.vue'
import images from '../../images';
import { initBtns } from "./tools/handle-btns"
import { ref, toRef } from 'vue';

const { pageData, playerEl, toHome } = useRoomPage()
const state = toRef(pageData, "state")
const { btnText, btnText2, h1, pText, onTapBtn, onTapBtn2 } = initBtns(state, toHome)

const alwaysFalse = ref(false)

</script>

<template>
  <div class="page">

    <!-- 给浏览器爬 -->
    <div v-show="alwaysFalse">
      <img :src="images.APP_LOGO_COS" height="132" width="132" />
      <p>{{ pageData.content?.title ? pageData.content.title 
        : pageData.content?.seriesName ? '邀请你一起听《' + pageData.content?.seriesName + '》' 
        : '邀请你一起听播客！' }}</p>
    </div>


    <!-- 加载中 -->
    <div v-if="state <= 2" class="page-full">
      <ListeningLoader />
      <div class="pf-text">
        <span v-if="state === 1">正在进入房间..</span>
        <span v-else>正在连接播放器..</span>
      </div>
    </div>

    <!-- 正常显示 -->
    <div v-show="state === 3" class="page-container">

      <!-- 播放器 -->
      <div ref="playerEl" class="rp-player"></div>

      <div class="room-virtual-one"></div>

      <h2 v-if="pageData.participants?.length" >正在听的有</h2>
      <div v-if="pageData.participants?.length"
        class="room-participants"
      >
        <template v-for="(item, index) in pageData.participants" :key="item.guestId">
          <div class="room-participant">
            <div class="rp-nickName">
              <span>{{ item.nickName }}</span>
            </div>
            <div class="rp-enter-time">
              <span>{{ item.enterStr }}进入</span>
            </div>
          </div>
        </template>
      </div>

      <div class="room-virtual-two"></div>

    </div>

    <!-- 出现异常 -->
    <div v-show="state >= 11" class="page-full">
      <img :src="state === 17 ? images.IMG_DOOR : images.IMG_PLACEHOLDER" class="pf-no-data-img" />
      <div class="pf-no-data-box">
        <h1>{{ h1 }}</h1>
        <p v-if="pText">{{ pText }}</p>
      </div>
      <div class="pf-no-data-btns">
        <pt-button
          :type="btnText2 ? 'main' : 'other'"
          @click="onTapBtn"
          :text="btnText" 
        />
        <pt-button
          v-if="btnText2"
          type="other"
          class="pf-ndb-other"
          @click="onTapBtn2"
          :text="btnText2" 
        />
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">

.page-full {
  height: 100vh;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  justify-content: space-evenly;
  align-items: center;
  width: 92%;
  max-width: 400px;
  position: relative;

  .pf-text {
    font-size: var(--desc-font);
    color: var(--desc-color);
    line-height: 1.5;
  }

  .pfnd-btns {
    width: 100%;
    height: 116px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .pf-no-data-img {
    width: 90px;
    height: 90px;
  }

  .pf-no-data-box {
    width: 100%;
    height: 150px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    h1 {
      margin-block-start: auto;
      margin-block-end: auto;
      font-size: var(--big-word-style);
      color: var(--text-color);
      line-height: 1.2;
    }

    p {
      margin-block-start: 20px;
      margin-block-end: auto;
      font-size: var(--desc-color);
      color: var(--desc-color);
      line-height: 1.5;
      text-align: center;
      white-space: pre-wrap;
      user-select: text;
    }
  }

  .pf-no-data-btns {
    width: 100%;
    height: 130px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .pf-ndb-other {
      margin-top: 15px;
    }
  }

}

.page-container {
  padding-top: 50px;
  align-items: flex-start;
  text-align: left;
  max-width: 700px;
  
  .rp-player {
    width: 100%;
    position: relative;
    z-index: 500;
  }

  .room-virtual-one {
    width: 100%;
    height: 50px;
  }

  h2 {
    font-size: var(--title-font);
    color: var(--text-color);
    margin-block-start: 0;
    margin-block-end: 20px;
  }

  .room-participants {
    width: 100%;
    background-color: var(--card-color);
    box-sizing: border-box;
    padding: 20px 24px;
    border-radius: 20px;
    position: relative;

    .room-participant {
      display: flex;
      align-items: center;
      width: 100%;
      height: 80px;
      position: relative;
    }

    .rp-nickName {
      width: 66%;
      font-size: var(--desc-font);
      color: var(--desc-color);
      padding-right: 10px;
      user-select: text;
    }

    .rp-enter-time {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      text-align: right;
      font-size: var(--mini-font);
      color: var(--note-color);
    }

  }

  .room-virtual-two {
    width: 100%;
    height: 100px;
  }

  @media screen and (max-width: 640px) {
    .room-virtual-one {
      display: none;
    }

    .room-virtual-two {
      height: 200px;
    }
  }

}





</style>