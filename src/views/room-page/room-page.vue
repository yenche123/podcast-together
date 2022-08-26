<script setup lang="ts">
import 'shikwasa2/dist/shikwasa.min.css'
import PtButton from "../../components/pt-button.vue"
import { useRoomPage } from "./tools/useRoomPage"
import ListeningLoader from '../../components/listening-loader.vue'
import images from '../../images';
import { initBtns } from "./tools/handle-btns"
import { computed, ref, toRef } from 'vue';
import { useTheme } from '../../hooks/useTheme';
import ptApi from '../../utils/pt-api';

const { isIOS, isIPadOS } = ptApi.getCharacteristic()
console.log("room-page.................")
console.log("isIOS: ", isIOS)
console.log("isIPadOS： ", isIPadOS)
console.log(" ")
const { theme } = useTheme()
const { pageData, playerEl, toHome, toContact, toEditMyName } = useRoomPage()
const state = toRef(pageData, "state")
const { 
  btnText, 
  btnText2, 
  h1, 
  pText, 
  onTapBtn, 
  onTapBtn2,
  onTapLeave,
  onTapShare,
  onTapEditMyName,
} = initBtns(state, toHome, toContact, toEditMyName)

const alwaysFalse = ref(false)
const hasLink = computed(() => {
  const linkUrl = pageData.content?.linkUrl
  if(linkUrl) return true
  return false
})

const onTapShowMore = () => {
  if(hasLink.value) {
    window.open(pageData.content?.linkUrl as string, "_blank")
    return
  }
  if(pageData.showMoreBox) pageData.showMoreBox = false
}

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
            <div class="rp-nickName" 
              :class="{ 'rp-nickName_pointer': item.isMe }" 
              @click="onTapEditMyName(item)"
            >
              <span>{{ item.nickName }}</span>
              <div v-if="item.isMe" class="div-bg-img rp-nickName-icon"></div>
            </div>
            <div class="rp-enter-time">
              <span>{{ item.enterStr }}进入</span>
            </div>
          </div>
        </template>
      </div>
      <div class="room-btns">
        <div class="room-btn" @click="onTapLeave">
          <div class="div-bg-img room-btn-icon room-btn-icon_leave"></div>
          <span>离开</span>
        </div>
        <div class="room-btn room-btn-main" @click="onTapShare">
          <div class="div-bg-img room-btn-icon room-btn-icon_share"></div>
          <span>分享</span>
        </div>
      </div>

      <div v-if="pageData.content?.title && pageData.content?.description"
        class="room-title-desc"
      >
        <div class="room-podcast-title">
          <span>{{ pageData.content.title }}</span>
        </div>
        <div class="room-desc-box">
          <div v-if="pageData.showMoreBox" 
            class="room-description room-desc-limited"
            :class="{ 'room-desc-limited_ios': isIOS || isIPadOS }"
          >
            <span>{{ pageData.content.description }}</span>
          </div>
          <div v-else class="room-description" :class="{ 'room-desc_pointer': hasLink }" @click="onTapShowMore">
            <span>{{ pageData.content.description }}</span>
          </div>

          <!-- 展开更多 -->
          <div v-if="pageData.showMoreBox" 
            class="room-show-more"
            @click="onTapShowMore"
          >
            <span class="room-show-more-text">{{ hasLink ? '查看原文' : '展开更多' }}</span>
            <div class="div-bg-img room-show-more-icon" :class="{ 'rsmi-rotated': hasLink }" ></div>
            <div class="room-show-more-bg"></div>
          </div>
        </div>
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

.page {
  min-height: 100vh;
}

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
      flex: 1;
      display: flex;
      align-items: center;
      height: 80px;
      position: relative;
    }

    .rp-nickName {
      display: flex;
      max-width: 60%;
      font-size: var(--desc-font);
      line-height: 22px;
      color: var(--desc-color);
      padding-right: 10px;
      user-select: text;

      .rp-nickName-icon {
        width: 22px;
        height: 22px;
        margin-left: 6px;
        opacity: .56;
        background-image: v-bind("'url(' + (theme === 'light' ? images.IC_EDIT : images.IC_EDIT_DM) + ')'");
      }
    }

    .rp-nickName_pointer {
      cursor: pointer;
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
    height: 130px;
  }

  @media screen and (max-width: 640px) {
    .room-virtual-one {
      display: none;
    }

    .room-virtual-two {
      height: 180px;
    }
  }

  .room-btns {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    justify-content: space-evenly;
    position: relative;
    margin-top: 50px;
    cursor: pointer;

    .room-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 25px;
      height: 50px;
      width: 30%;
      min-width: 120px;
      transition: .15s;
      background-color: var(--other-btn-bg);
      color: var(--other-btn-text);
      font-size: var(--btn-font);

      .room-btn-icon {
        width: 20px;
        height: 20px;
        margin-right: 16px;
        opacity: v-bind("theme === 'light' ? .56 : .98");

        &.room-btn-icon_leave {
          background-image: v-bind("'url(' + (theme === 'light' ? images.IC_CLOSE : images.IC_CLOSE_DM) + ')'");
        }

        &.room-btn-icon_share {
          opacity: v-bind("theme === 'light' ? .98 : .66");
          background-image: v-bind("'url(' + (theme === 'light' ? images.IC_SHARE : images.IC_SHARE_DM) + ')'");
        }
      }

      &:hover {
        background-color: var(--other-btn-hover);
      }

      &.room-btn-main {
        background-color: var(--main-btn-bg);
        color: var(--main-btn-text);

        &:hover {
          background-color: var(--hover-btn-bg);
        }
      }
    }

  }

  .room-title-desc {
    margin-top: 50px;

    .room-podcast-title {
      width: 100%;
      font-size: var(--title-font);
      color: var(--text-color);
      line-height: 1.5;
      font-weight: 700;
      margin-bottom: 10px;
      user-select: text;
    }

    .room-desc-box {
      width: 100%;
      background-color: var(--card-color);
      box-sizing: border-box;
      padding: 20px 24px;
      border-radius: 20px;
      position: relative;

      .room-description {
        position: relative;
        width: 100%;
        font-size: var(--desc-font);
        color: var(--desc-color);
        line-height: 1.75;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        overflow: hidden;
        z-index: 10;
        user-select: text;
      }

      .room-desc-limited {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        /** 18px * 1.75行倍距 * 3行 */
        max-height: 95;
      }

      .room-desc-limited_ios {
        display: inline-block;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .room-desc_pointer {
        cursor: pointer;
      }

      .room-show-more {
        z-index: 15;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        text-align: center;
        width: 100%;
        padding: 30px 0 5px;
        /** 18px * 1.75 然后再减掉 5 */
        margin-top: -27px;
        cursor: pointer;

        .room-show-more-text {
          font-size: var(--btn-font);
          color: var(--text-color);
          font-weight: 700;
          line-height: 1.5;
          z-index: 17;
        }

        .room-show-more-icon {
          width: 20px;
          height: 20px;
          margin-left: 4px;
          opacity: .8;
          z-index: 17;
          background-image: v-bind("'url(' + (theme === 'light' ? images.IC_EXPAND : images.IC_EXPAND_DM) + ')'");
        }

        .rsmi-rotated {
          transform: rotate(-90deg);
        }

        .room-show-more-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 16;
          background: var(--more-btn-bg);
        }
      }

    }

  }

}

</style>

<!-- 全局 -->
<style>
.shk-cover {
  background-position: center;
}
</style>