/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface PtEnv {
  version: string
  client: string
}

declare const PT_ENV: PtEnv