import api from '@/utils/axios'
import type { Order } from '@/types'

export const createOrder = async (): Promise<Order> => {
    const response = await api.post('/api/orders/')
    return response.data
}

export const getOrders = async (): Promise<Order[]> => {
    const response = await api.get('/api/orders/')
    return response.data
}

export const getOrder = async (id: number): Promise<Order> => {
    const response = await api.get(`/api/orders/${id}`)
    return response.data
}