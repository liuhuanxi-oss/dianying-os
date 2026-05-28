import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  timeout: 15000
})

http.interceptors.request.use(config => {
  const token = localStorage.getItem('dyos_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  response => {
    const d = response.data
    if (d && d.code === 0) {
      return d.data !== undefined ? d.data : d
    }
    throw new Error((d && d.message) || '请求失败')
  },
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('dyos_token')
      localStorage.removeItem('dyos_user')
      window.location.hash = '#/login'
    }
    return Promise.reject(error)
  }
)

export default http
