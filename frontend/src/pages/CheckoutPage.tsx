import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '@/api/orderApi'
import { getCart } from '@/api/cartApi'
import { getProducts } from '@/api/productApi'
import { ShoppingBag, ArrowLeft } from 'lucide-react'

export default function CheckoutPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: cart, isLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
        retry: false,
    })

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const getProductName = (productId: number) =>
        products?.find((p) => p.id === productId)?.name ?? `Product #${productId}`

    const total = cart?.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity, 0
    ) ?? 0

    const { mutate: placeOrder, isPending, isError, error } = useMutation({
        mutationFn: createOrder,
        onSuccess: (order) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            navigate(`/orders/${order.id}`)
        },
    })

    if (isLoading) {
        return (
            <div className="checkout-page">
                <div className="page-hero">
                    <p className="hero-eyebrow">Final Step</p>
                    <h1 className="hero-title">Checkout</h1>
                </div>
                <div className="cart-skeletons">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="cart-skeleton-row" />
                    ))}
                </div>
            </div>
        )
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="checkout-page">
                <div className="page-hero">
                    <p className="hero-eyebrow">Final Step</p>
                    <h1 className="hero-title">Checkout</h1>
                </div>
                <div className="cart-empty">
                    <p className="cart-empty-text">Your cart is empty</p>
                    <button className="btn-primary" onClick={() => navigate('/products')}>
                        Browse Products
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="checkout-page">
            {/* Hero */}
            <div className="page-hero">
                <p className="hero-eyebrow">Final Step</p>
                <h1 className="hero-title">Checkout</h1>
                <p className="hero-subtitle">Review your order before placing</p>
            </div>

            <div className="checkout-layout">
                {/* Order summary */}
                <div className="checkout-summary-panel">
                    <h2 className="summary-title">Order Summary</h2>

                    <div className="checkout-items">
                        {cart.items.map((item, index) => (
                            <div key={item.id}>
                                <div className="checkout-row">
                                    <div className="checkout-row-info">
                                        <p className="cart-item-name">{getProductName(item.product_id)}</p>
                                        <p className="cart-item-meta">
                                            Qty {item.quantity} &times; ${Number(item.price).toFixed(2)}
                                        </p>
                                    </div>
                                    <span className="cart-item-total">
                                        ${(Number(item.price) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                                {index < cart.items.length - 1 && (
                                    <div className="cart-divider" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="summary-divider" />

                    <div className="summary-row">
                        <span className="summary-label">Subtotal</span>
                        <span className="summary-value">${total.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Shipping</span>
                        <span className="summary-value summary-free">Free</span>
                    </div>

                    <div className="summary-divider" />

                    <div className="summary-row summary-total-row">
                        <span className="summary-total-label">Total</span>
                        <span className="summary-total-value">${total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Place order panel */}
                <div className="checkout-action-panel">
                    <h2 className="summary-title">Place Your Order</h2>
                    <p className="checkout-notice">
                        By placing your order you agree to our terms of service.
                        You will be redirected to payment after confirmation.
                    </p>

                    {isError && (
                        <p className="checkout-error">
                            {(error as any)?.response?.data?.detail || 'Failed to place order. Please try again.'}
                        </p>
                    )}

                    <button
                        className="btn-primary btn-full"
                        onClick={() => placeOrder()}
                        disabled={isPending}
                    >
                        <ShoppingBag size={16} />
                        {isPending ? 'Placing Order…' : `Place Order · $${total.toFixed(2)}`}
                    </button>

                    <button
                        className="btn-ghost btn-full"
                        onClick={() => navigate('/cart')}
                    >
                        <ArrowLeft size={15} />
                        Back to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}