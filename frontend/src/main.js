import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

// Configurações axios para autenticação via cookies (Sanctum)
axios.defaults.withCredentials = true
axios.defaults.baseURL = 'http://localhost:8000'

createApp(App).mount('#app')
