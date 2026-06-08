import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { getImageUrl } from '@/utils/config'

interface Props {
    product: Product
}

export default function ProductCard({ product }: Props) {
    const imageUrl = getImageUrl(product.product_image)
    const discount = Number(product.percentage_discount)
    const newPrice = Number(product.new_price)
    const originalPrice = Number(product.original_price)

    return (
        <Link to={`/products/${product.id}`} className="product-card">
            {/* Image */}
            <div className="card-image-wrap">
                {product.product_image ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="card-image"
                    />
                ) : (
                    <div className="card-image-placeholder">No image</div>
                )}
                {discount > 0 && (
                    <span className="discount-badge">−{discount}%</span>
                )}
            </div>

            {/* Info */}
            <div className="card-body">
                <span className="card-category">{product.category}</span>
                <h3 className="card-name">{product.name}</h3>
                <div className="card-pricing">
                    <span className="price-new">${newPrice.toFixed(2)}</span>
                    {originalPrice > newPrice && (
                        <span className="price-original">${originalPrice.toFixed(2)}</span>
                    )}
                </div>
                <p className="card-expiry">Offer ends {product.offer_expiration}</p>
            </div>
        </Link>
    )
}