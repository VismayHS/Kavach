import axios from 'axios'
import config from '../config'

const api = axios.create({
    baseURL: config.apiUrl,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete api.defaults.headers.common['Authorization']
    }
}

// ── User Profile ──
export const getProfile = () => api.get('/user/profile')
export const updateProfile = (data) => api.put('/user/profile', data)

// ── Guardians ──
export const getGuardians = () => api.get('/user/guardians')
export const addGuardian = (data) => api.post('/user/guardians', data)
export const updateGuardian = (id, data) => api.put(`/user/guardians/${id}`, data)
export const deleteGuardian = (id) => api.delete(`/user/guardians/${id}`)

// ── Alerts ──
export const simulateAlert = (data) => api.post('/alert/simulate', data)
export const getAlertHistory = () => api.get('/alert/history')

// ── System ──
export const getHealth = () => api.get('/health')

export default api
