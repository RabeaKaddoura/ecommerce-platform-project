import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProduct } from '@/api/productApi'
import { addItem } from '@/api/cartApi'
import { getImageUrl } from '@/utils/config'
import { ArrowLeft, ShoppingCart, Check, Minus, Plus, Calendar, Tag } from 'lucide-react'
import { useState } from 'react'

export default function ProductDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [quantity, setQuantity] = useState(1)
    const [added, setAdded] = useState(false)

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(Number(id)),
    })

    const { mutate: addToCart, isPending } = useMutation({
        mutationFn: () => {
            if (!product) throw new Error('Product not found')
            return addItem({
                product_id: product.id,
                quantity,
                price: Number(product.new_price),
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            setAdded(true)
            setTimeout(() => {
                setAdded(false)
                setQuantity(1)
            }, 2000)
        },
    })

    if (isLoading) {
        return (
            <div className="detail-page">
                <div className="detail-grid">
                    <div className="detail-img-skeleton" />
                    <div className="detail-info-skeleton">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="skeleton-line" style={{ width: `${[75, 30, 50, 40][i]}%` }} />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (isError || !product) {
        return (
            <div className="detail-page">
                <div className="cart-empty">
                    <p className="cart-empty-text">Product not found.</p>
                    <button className="btn-primary" onClick={() => navigate('/products')}>
                        Back to Products
                    </button>
                </div>
            </div>
        )
    }

    const imageUrl = getImageUrl(product.product_image)
    const newPrice = Number(product.new_price)
    const originalPrice = Number(product.original_price)
    const discount = Number(product.percentage_discount)

    return (
        <div className="detail-page">
            {/* Back */}
            <button className="detail-back" onClick={() => navigate(-1)}>
                <ArrowLeft size={15} />
                Back
            </button>

            <div className="detail-grid">
                {/* Image */}
                <div className="detail-img-wrap">
                    {product.product_image ? (
                        <img src={imageUrl} alt={product.name} className="detail-img" />
                    ) : (
                        <div className="detail-img-placeholder">No image</div>
                    )}
                    {discount > 0 && (
                        <span className="discount-badge">−{discount}%</span>
                    )}
                </div>

                {/* Info */}
                <div className="detail-info">
                    <span className="card-category">{product.category}</span>
                    <h1 className="detail-title">{product.name}</h1>

                    {/* Pricing */}
                    <div className="detail-pricing">
                        <span className="detail-price-new">${newPrice.toFixed(2)}</span>
                        {originalPrice > newPrice && (
                            <span className="detail-price-original">${originalPrice.toFixed(2)}</span>
                        )}
                    </div>

                    {/* Meta */}
                    <div className="detail-meta">
                        <div className="detail-meta-row">
                            <Calendar size={14} />
                            <span>Offer expires {product.offer_expiration}</span>
                        </div>
                        <div className="detail-meta-row">
                            <Tag size={14} />
                            <span>{product.category}</span>
                        </div>
                    </div>

                    <div className="summary-divider" />

                    {/* Quantity selector */}
                    <div className="detail-qty-section">
                        <span className="detail-qty-label">Quantity</span>
                        <div className="qty-control">
                            <button
                                className="qty-btn"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1 || isPending || added}
                                aria-label="Decrease quantity"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="qty-value">{quantity}</span>
                            <button
                                className="qty-btn"
                                onClick={() => setQuantity(q => q + 1)}
                                disabled={isPending || added}
                                aria-label="Increase quantity"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Line total */}
                    {quantity > 1 && (
                        <p className="detail-line-total">
                            Total: <strong>${(newPrice * quantity).toFixed(2)}</strong>
                        </p>
                    )}

                    {/* Add to cart */}
                    <button
                        className={`btn-primary btn-add-cart ${added ? 'btn-added' : ''}`}
                        onClick={() => addToCart()}
                        disabled={isPending || added}
                    >
                        {added ? (
                            <>
                                <Check size={16} />
                                Added to Cart
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={16} />
                                {isPending ? 'Adding…' : 'Add to Cart'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}