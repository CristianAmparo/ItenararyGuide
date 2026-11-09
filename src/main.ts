import { createApp } from 'vue'
import '@fontsource-variable/inter'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { registerServiceWorker } from './pwa'

createApp(App).use(router).mount('#app')

registerServiceWorker()
