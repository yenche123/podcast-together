import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router"

import CreatePage from "../views/create-page/create-page.vue"
import ErrPage from "../views/err-page/err-page.vue"
import IndexPage from "../views/index-page/index-page.vue"
import JoinPage from "../views/join-page/join-page.vue"
import RoomPage from "../views/room-page/room-page.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: IndexPage,
    name: "index",
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
    }
  },
  {
    path: "/join/:roomId?",
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