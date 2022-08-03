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
