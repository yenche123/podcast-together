/**
 * @file 前端开始执行文件
 * @author yenche123 <tsuiyenche@outlook.com>
 * @copyright TSUI YEN-CHE 2022
 */

import { createApp } from 'vue'
import './styles/style.css'
import './styles/theme.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import { router } from './routes'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
