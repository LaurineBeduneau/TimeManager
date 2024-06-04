import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'vue-cal/dist/vuecal.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from '@/App.vue'
import { jwtDecode } from 'jwt-decode'
import { useUserStore } from '@/stores/user'
import { useClockStore } from '@/stores/clock'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)

/**
 * Check if JWT token is expired
 */
function checkToken(): boolean {
  try {
    const decodedToken = jwtDecode(localStorage.getItem('token') || '')
    if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
      return false
    }
    return true
  } catch (error) {
    return false
  }
}

/**
 * Start the app
 */
async function startApp() {
  const isTokenValid = checkToken()
  const userStore = useUserStore()
  const clockStore = useClockStore()

  userStore.fetching = isTokenValid

  if (isTokenValid) {
    await userStore.fetchUser()
    await clockStore.getClock()
  }

  app.mount('#app')
}

startApp()
