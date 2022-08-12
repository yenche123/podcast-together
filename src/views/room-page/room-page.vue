<script setup lang="ts">
import 'shikwasa2/dist/shikwasa.min.css'
import PtButton from "../../components/pt-button.vue"
import { useRoomPage, enterRoom } from "./tools/useRoomPage"
import ListeningLoader from '../../components/listening-loader.vue'
import { toRef } from 'vue';

const { pageData, router, playerEl } = useRoomPage()
const state = toRef(pageData, "state")

// 点击异常情况下的按钮
const onTapBtn = () => {
  const s = state.value
  // 网络不佳，去刷新
  if(s === 13) {
    enterRoom()
  }
  else if(s === 11 || s === 12 || s === 14) {
    router.replace({ name: "index" })
  }
  else {
    console.log("去联系开发者.............")
  }

}

</script>

<template>
  <div class="page">

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
      <img src="../../assets/face_with_raised_eyebrow_3d.png" class="pf-no-data-img" />
      <div class="pf-no-data-box">

        <h1 v-if="state === 11">链接已过期</h1>
        <h1 v-else-if="state === 12">查无该房间</h1>
        <h1 v-else-if="state === 13">网络不佳</h1>
        <h1 v-else-if="state === 14">拒绝访问</h1>
        <h1 v-else>未知的错误</h1>

      </div>
      <div class="pf-no-data-btns">
        <pt-button type="other" 
          @click="onTapBtn"
          :text="state === 11 || state === 12 || state === 14 ? '回首页' : state === 13 ? '刷新' : '联系开发者'" 
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
  align-items: center;
  width: 92%;
  max-width: var(--standard-max-px);
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
    height: 100px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    h1 {
      font-size: var(--title-font);
      color: var(--text-color);
      line-height: 1.5;
    }
  }

  .pf-no-data-btns {
    width: 100%;
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
      width: 60%;
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