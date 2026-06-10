import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, removeItem, clearCart } from '@/api/cartApi'
import { getProducts } from '@/api/productApi'
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '@/utils/config'

export default function CartPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: cart, isLoading: cartLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
        retry: false,
    })

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const { mutate: remove } = useMutation({
        mutationFn: (itemId: number) => removeItem(itemId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    })

    const { mutate: clear, isPending: clearing } = useMutation({
        mutationFn: clearCart,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    })

    const getProductName = (productId: number) =>
        products?.find((p) => p.id === productId)?.name ?? `Product #${productId}`

    const getProductImage = (productId: number) => {
        const image = products?.find((p) => p.id === productId)?.product_image
        return image ? getImageUrl(image) : null
    }

    const total = cart?.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity, 0
    ) ?? 0

    if (cartLoading) {
        return (
            <div className="cart-page">
                <div className="page-hero">
                    <p className="hero-eyebrow">Your Selection</p>
                    <h1 className="hero-title">Shopping Cart</h1>
                </div>
                <div className="cart-skeletons">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="cart-skeleton-row" />
                    ))}
                </div>
            </div>
        )
    }

    const isEmpty = !cart || cart.items.length === 0

    if (isEmpty) {
        return (
            <div className="cart-page">
                <div className="page-hero">
                    <p className="hero-eyebrow">Your Selection</p>
                    <h1 className="hero-title">Shopping Cart</h1>
                </div>
                <div className="cart-empty">
                    <ShoppingCart size={48} strokeWidth={1} className="cart-empty-icon" />
                    <p className="cart-empty-text">Your cart is empty</p>
                    <button className="btn-primary" onClick={() => navigate('/products')}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-page">
            {/* Hero */}
            <div className="page-hero">
                <p className="hero-eyebrow">Your Selection</p>
                <h1 className="hero-title">Shopping Cart</h1>
                <p className="hero-subtitle">{cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}</p>
            </div>

            <div className="cart-layout">
                {/* Items list */}
                <div className="cart-items">
                    <div className="cart-items-header">
                        <button
                            className="clear-btn"
                            onClick={() => clear()}
                            disabled={clearing}
                        >
                            {clearing ? 'Clearing…' : 'Clear all'}
                        </button>
                    </div>

                    {cart.items.map((item, index) => (
                        <div key={item.id}>
                            <div className="cart-row">
                                {/* Image */}
                                <div className="cart-img-wrap">
                                    {getProductImage(item.product_id) ? (
                                        <img
                                            src={getProductImage(item.product_id)!}
                                            alt={getProductName(item.product_id)}
                                            className="cart-img"
                                        />
                                    ) : (
                                        <div className="cart-img-placeholder" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="cart-row-info">
                                    <p className="cart-item-name">{getProductName(item.product_id)}</p>
                                    <p className="cart-item-meta">
                                        Qty {item.quantity} &times; ${Number(item.price).toFixed(2)}
                                    </p>
                                </div>

                                {/* Price + remove */}
                                <div className="cart-row-actions">
                                    <span className="cart-item-total">
                                        ${(Number(item.price) * item.quantity).toFixed(2)}
                                    </span>
                                    <button
                                        className="remove-btn"
                                        onClick={() => remove(item.id)}
                                        aria-label="Remove item"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                            {index < cart.items.length - 1 && (
                                <div className="cart-divider" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Order summary panel */}
                <div className="cart-summary">
                    <h2 className="summary-title">Order Summary</h2>

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

                    <button
                        className="btn-primary btn-full"
                        onClick={() => navigate('/checkout')}
                    >
                        Proceed to Checkout
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}