export interface User {
    id: number
    name: string
    email: string
    isAdmin: boolean
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    name: string
    email: string
    password: string
}

export interface Product {
    id: number
    name: string
    category: string
    original_price: number
    new_price: number
    percentage_discount: number
    offer_expiration: string
    product_image: string
}