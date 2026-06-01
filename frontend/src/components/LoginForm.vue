<template>
  <form @submit.prevent="submit">
    <div>
      <label>Email</label>
      <input v-model="email" type="email" />
    </div>
    <div>
      <label>Senha</label>
      <input v-model="password" type="password" />
    </div>
    <button type="submit">Login</button>
    <p v-if="message">{{ message }}</p>
  </form>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return { email: '', password: '', message: '' }
  },
  methods: {
    async submit() {
      try {
        // Chamar endpoint /sanctum/csrf-cookie antes do login
        await axios.get('/sanctum/csrf-cookie')
        await axios.post('/login', { email: this.email, password: this.password })
        this.message = 'Autenticado com sucesso'
      } catch (err) {
        this.message = err.response?.data?.message || 'Erro no login'
      }
    }
  }
}
</script>
