import api from '@/utils/axios'
import type { Cart, CartItemAdd } from '@/types'

export const getCart = async (): Promise<Cart> => {
    const response = await api.get('/api/cart/')
    return response.data
}

export const addItem = async (data: CartItemAdd): Promise<void> => {
    await api.post('/api/cart/items', data)
}

export const removeItem = async (itemId: number): Promise<void> => {
    await api.delete(`/api/cart/items/${itemId}`)
}

export const clearCart = async (): Promise<void> => {
    await api.delete('/api/cart/')
}