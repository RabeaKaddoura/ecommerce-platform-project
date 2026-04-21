//Auth types

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


//Product types

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


//Cart types

export interface CartItem {
    id: number
    product_id: number
    quantity: number
    price: number
}

export interface Cart {
    id: number
    user_id: number
    items: CartItem[]
}

export interface CartItemAdd {
    product_id: number
    quantity: number
    price: number
}