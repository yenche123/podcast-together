import { onUnmounted } from "vue"
import { 
  useRouter as useVueRouter, 
  useRoute as useVueRoute,
  isNavigationFailure, 
  NavigationHookAfter, 
  Router as VueRouter, 
  RouteLocationRaw,
  NavigationFailure,
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
} from "vue-router"
import time from "../utils/time"

interface RouteChangeState {
  operation?: "push" | "replace" | "go"
  delta?: number
  stamp?: number
}

interface RouteAndRouter {
  route: RouteLocationNormalizedLoaded
  router: VueRouter
}

export interface RouteAndPtRouter {
  route: RouteLocationNormalizedLoaded
  router: PtRouter
}

interface ToAndFrom {
  to?: RouteLocationNormalized
  from?: RouteLocationNormalized
}

export type VueRoute = RouteLocationNormalizedLoaded

// 当前路由是否有前路由
let hasPreRoute: boolean = false

// 等待原生事件 存储 to 和 from
let toAndFrom: ToAndFrom = {}

// 原生 popstate 的 state
let stateFromPopState: PopStateEvent["state"] = null

// 有效间隔
// 超出有效间隔的事件，皆视为由浏览器所触发
// 如果在切换路由过程中含有远程获取云端数据，请主动调大间隔
const DEFAULT_DURATION = 60
let availableDuration = 60

// 上一次主动记录堆栈的事件戳
let routeChangeTmpData: RouteChangeState = {}

// 路由堆栈记录
// 仅会记录 刷新/从外部网页跳转回来/从外部网页跳转进来 之后的堆栈
let stack: RouteLocationRaw[] = []

class PtRouter {

  private router: VueRouter

  constructor() {
    this.router = useVueRouter()
  }

  /** 主动记录堆栈 */
  async replace(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined> {
    routeChangeTmpData = { operation: "replace", delta: 0, stamp: time.getTime() }
    let res = await this.router.replace(to)
    return res
  }

  /** 主动记录堆栈 */
  async push(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined> {
    routeChangeTmpData = { operation: "push", delta: 1, stamp: time.getTime() }
    let res = await this.router.push(to)
    return res
  }

  public go(delta: number) {
    routeChangeTmpData = { operation: "go", delta, stamp: time.getTime() }
    this.router.go(delta)
  }

  public forward() {
    routeChangeTmpData = { operation: "go", delta: 1, stamp: time.getTime() }
    this.router.forward()
  }

  public back() {
    routeChangeTmpData = { operation: "go", delta: -1, stamp: time.getTime() }
    this.router.back()
  }

  // 获取路由堆栈
  public getStack() {
    let list = stack.map(v => {
      let v2: RouteLocationRaw
      if(typeof v === "string") v2 = v
      else v2 = JSON.parse(JSON.stringify(v))
      return v2
    })
    return list
  }

}

const _popStacks = (num: number) => {
  for(let i=0; i<num; i++) {
    if(stack.length < 1) break
    stack.pop()
  }
}

// 判断前端代码触发跳转成功与否，并操作堆栈
// 如果是浏览器导航栏的操作，则存储 to 和 from，再触发 _judgeBrowserJump
const _judgeInitiativeJump = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  let { operation, delta = 0, stamp = 0 } = routeChangeTmpData
  const now = time.getTime()
  const diff = now - stamp
  if(diff < availableDuration) {
    if(delta === 1) stack.push(to)
    else if(delta === 0) {
      stack.splice(stack.length - 1, 1, to)
    }
    else if(delta < 0) {
      _popStacks(-delta)
    }

    // 判断是否有前一页
    if(to.name && from.name && stack.length > 1) {
      hasPreRoute = true
    }

    routeChangeTmpData.stamp = 0
    availableDuration = DEFAULT_DURATION

    console.log("从手动触发，看一下当前 stack:")
    console.log(stack)
    console.log(" ")
  }
  else {
    // 保存状态以等待 window.addEventListener("popstate") 触发
    toAndFrom = { to, from }
    _judgeBrowserJump()
  }
}

const _judgeBrowserJump = (): void => {
  let { to, from } = toAndFrom
  if(!to || !from || !stateFromPopState) return



  console.log("从浏览器触发，看一下当前 stack:")
  console.log(stack)
  console.log(" ")
}


const initPtRouter = (): RouteAndRouter => {
  const vueRouter = useVueRouter()
  const vueRoute = useVueRoute()

  let cancelAfterEach = vueRouter.afterEach((to, from, failure) => {
    console.log("########  监听到路由发生变化  ########")
    if(isNavigationFailure(failure)) return

    console.log("to: ", to)
    console.log("from: ", from)
    console.log("vueRoute: ", vueRoute)
    console.log(" ")
    
    // 判断是不是第一个路由
    if(stack.length === 0 && !from.name) {
      stack.push(to)
      return
    }

    _judgeInitiativeJump(to, from)
  })

  window.addEventListener("popstate", (e) => {
    console.log("popstate........")
    console.log(e)
    console.log(" ")
    stateFromPopState = e.state
  })

  onUnmounted(() => {
    cancelAfterEach()
  })

  return { route: vueRoute, router: vueRouter }
}

// 借由 router.afterEach 来判断的
// 如果 from.name 不存在，就代表没有更多以前的 route
const hasPreviousRouteInApp = (): boolean => {
  return hasPreRoute
}

const goHome = (router: PtRouter) => {
  router.replace({ name: "index"})
}

const useRouter = (): PtRouter => {
  return new PtRouter()
}


const useRouteAndPtRouter = (): RouteAndPtRouter => {
  const router = new PtRouter()
  const vueRoute = useVueRoute()
  return { router, route: vueRoute }
}

export {
  PtRouter,
  initPtRouter,
  hasPreviousRouteInApp,
  goHome,
  useRouter,
  useRouteAndPtRouter,
}
