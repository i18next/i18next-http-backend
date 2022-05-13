import { createApp } from 'vue'
import init from './i18n'
import App from './Suspenser.vue'

const app = createApp(App)
init(app)
app.mount('#app')
