import api from '@/utils/axios'
import type { LoginRequest, RegisterRequest, User } from '@/types'

export const login = async (data: LoginRequest): Promise<string> => {
    const response = await api.post('/api/auth/login', data)
    return response.data.access_token
}

export const register = async (data: RegisterRequest): Promise<User> => {
    const response = await api.post('/api/auth/register', data)
    return response.data
}

export const getMe = async (): Promise<User> => {
    const response = await api.get('/api/auth/me')
    return response.data
}