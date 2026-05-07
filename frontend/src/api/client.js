import axios from 'axios'

const BASE_URL = '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  verifyEmail: (token) => api.get(`/auth/verify?token=${token}`),
}

export const visaApi = {
  check: (passport_code, destination_code) =>
    api.post('/visa/check', { passport_code, destination_code }),
  checkGuest: (passport_code, destination_code) =>
    api.post('/visa/check/guest', { passport_code, destination_code }),
}

export const chatbotApi = {
  sendMessage: (message, session_id = null) =>
    api.post('/chatbot/message', { message, session_id }),
}

export const historyApi = {
  getAll: () => api.get('/history/'),
  getOne: (id) => api.get(`/history/${id}`),
  delete: (id) => api.delete(`/history/${id}`),
}

export const mapApi = {
  getColors: (passport_code) => api.get(`/map/colors/${passport_code}`),
}

export default api
