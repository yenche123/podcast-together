import { 
  RouteRecordRaw, 
  RouteLocationRaw,
  createRouter, 
  createWebHistory,
  RouteLocationNormalized,
} from "vue-router"

import CreatePage from "../views/create-page/create-page.vue"
import ErrPage from "../views/err-page/err-page.vue"
import IndexPage from "../views/index-page/index-page.vue"
import JoinPage from "../views/join-page/join-page.vue"
import RoomPage from "../views/room-page/room-page.vue"
import TestSafari from "../views/test-safari/test-safari.vue"
import ptUtil from "../utils/pt-util"


// 扩展 vue-router 下的 RouteMeta 接口
declare module 'vue-router' {
  interface RouteMeta {
    // 可选的属性
    keeyAlive?: boolean
  }
}

// 给 room(房间) 和 create(创建房间) 页面进行导航守卫
const _checkNickName = (to: RouteLocationNormalized): RouteLocationRaw | true => {
  if(to.name === "join") return true
  let userData = ptUtil.getUserData()
  if(!userData.nickName) {
    let { roomId } = to.params
    if(roomId) return { name: "join", query: { roomId } }
    return { name: "join" }
  }
  return true
}

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: IndexPage,
    name: "index",
    alias: ["/home"],
    meta: {
      keepAlive: true,
    }
  },
  {
    path: "/test",
    component: TestSafari,
    name: "test",
    meta: {
      keepAlive: true,
    }
  },
  {
    path: "/create",
    component: CreatePage,
    name: "create",
    meta: {
      keepAlive: true,
    },
    beforeEnter: [_checkNickName]
  },
  {
    path: "/join",
    component: JoinPage,
    name: "join",
    meta: {
      keepAlive: true,
    },
  },
  {
    path: "/room/:roomId",
    component: RoomPage,
    name: "room",
    meta: {
      keepAlive: true,
    },
    beforeEnter: [_checkNickName]
  },
  {
    path: "/error",
    component: ErrPage,
    name: "error",
    meta: {
      keepAlive: true,
    },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export { router }