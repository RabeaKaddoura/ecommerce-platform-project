import api from '@/utils/axios'
import type { PaymentIntent } from '@/types'

export const createPaymentIntent = async (order_id: number): Promise<PaymentIntent> => {
    const response = await api.post('/api/payments/create-intent', { order_id })
    return response.data
}