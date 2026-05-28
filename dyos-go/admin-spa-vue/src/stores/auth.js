import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('dyos_token') || '',
    user: JSON.parse(localStorage.getItem('dyos_user') || '{}')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role || '',
    isAdmin: (state) => state.user?.role === 'admin',
    isAgent: (state) => state.user?.role === 'agent',
    isMerchant: (state) => state.user?.role === 'merchant',
    userName: (state) => state.user?.name || state.user?.username || '用户'
  },

  actions: {
    async login(username, password) {
      const { data } = await axios.post('/api/login', { username, password })
      if (data.code === 0 && data.data?.token) {
        this.token = data.data.token
        this.user = data.data.user || {}
        localStorage.setItem('dyos_token', this.token)
        localStorage.setItem('dyos_user', JSON.stringify(this.user))
        return this.user
      }
      throw new Error(data.message || '登录失败')
    },

    logout() {
      this.token = ''
      this.user = {}
      localStorage.removeItem('dyos_token')
      localStorage.removeItem('dyos_user')
    }
  }
})
