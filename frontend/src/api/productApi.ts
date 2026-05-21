import api from '@/utils/axios'
import type { Product } from '@/types'

export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get('/api/products/')
    return response.data
}

export const getProduct = async (id: number): Promise<Product> => {
    const response = await api.get(`/api/products/${id}`)
    return response.data
}

//builds FormData from product fields and optional image file
//FormData is required because backend accepts multipart/form-data for file uploads
function buildFormData(data: Omit<Product, 'id'>, imageFile?: File): FormData {
    const form = new FormData()
    form.append('name', data.name)
    form.append('category', data.category)
    form.append('original_price', String(data.original_price))
    form.append('new_price', String(data.new_price))
    form.append('percentage_discount', String(data.percentage_discount))
    form.append('offer_expiration', data.offer_expiration)
    if (imageFile) {
        form.append('image', imageFile)
    }
    return form
}

export const createProduct = async (data: Omit<Product, 'id'>, imageFile?: File): Promise<Product> => {
    const form = buildFormData(data, imageFile)
    const response = await api.post('/api/products/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}

export const updateProduct = async (id: number, data: Omit<Product, 'id'>, imageFile?: File): Promise<Product> => {
    const form = buildFormData(data, imageFile)
    const response = await api.put(`/api/products/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}

export const deleteProduct = async (id: number): Promise<void> => {
    await api.delete(`/api/products/${id}`)
}