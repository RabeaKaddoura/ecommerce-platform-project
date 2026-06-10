import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrder } from '@/api/orderApi'
import { getProducts } from '@/api/productApi'
import { ArrowLeft, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react'

const statusStyles: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'status-pending' },
    confirmed: { label: 'Confirmed', className: 'status-confirmed' },
    shipped: { label: 'Shipped', className: 'status-shipped' },
    delivered: { label: 'Delivered', className: 'status-delivered' },
    cancelled: { label: 'Cancelled', className: 'status-cancelled' },
}

export default function OrderDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const redirectStatus = searchParams.get('redirect_status')

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrder(Number(id)),
    })

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const getProductName = (productId: number) =>
        products?.find((p) => p.id === productId)?.name ?? `Product #${productId}`

    if (isLoading) {
        return (
            <div className="orders-page">
                <div className="detail-img-skeleton" style={{ height: '200px', aspectRatio: 'unset' }} />
            </div>
        )
    }

    if (isError || !order) {
        return (
            <div className="orders-page">
                <div className="cart-empty">
                    <p className="cart-empty-text">Order not found.</p>
                    <button className="btn-primary" onClick={() => navigate('/orders')}>
                        Back to Orders
                    </button>
                </div>
            </div>
        )
    }

    const s = statusStyles[order.status] ?? { label: order.status, className: 'status-pending' }

    return (
        <div className="orders-page">
            <button className="detail-back" onClick={() => navigate(-1)}>
                <ArrowLeft size={15} />
                Back
            </button>

            {/* Header */}
            <div className="order-detail-header">
                <div>
                    <p className="hero-eyebrow">Your Account</p>
                    <h1 className="hero-title" style={{ marginBottom: '0.4rem' }}>Order #{order.id}</h1>
                    <p className="hero-subtitle">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </p>
                </div>
                <span className={`order-status order-status-lg ${s.className}`}>{s.label}</span>
            </div>

            {/* Status banners */}
            {order.status === 'pending' && redirectStatus === 'succeeded' && (
                <div className="order-banner order-banner-success">
                    <CheckCircle size={18} />
                    <div>
                        <p className="banner-title">Payment successful!</p>
                        <p className="banner-sub">Your order is being confirmed — refresh in a moment.</p>
                    </div>
                </div>
            )}

            {order.status === 'confirmed' && (
                <div className="order-banner order-banner-success">
                    <CheckCircle size={18} />
                    <div>
                        <p className="banner-title">Order confirmed!</p>
                        <p className="banner-sub">We're preparing your items.</p>
                    </div>
                </div>
            )}

            {order.status === 'cancelled' && (
                <div className="order-banner order-banner-error">
                    <XCircle size={18} />
                    <div>
                        <p className="banner-title">Payment failed.</p>
                        <p className="banner-sub">Your order was not processed.</p>
                    </div>
                    <button
                        className="btn-primary"
                        style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
                        onClick={() => navigate(`/payment/${order.id}`)}
                    >
                        <CreditCard size={14} />
                        Retry Payment
                    </button>
                </div>
            )}

            {order.status === 'pending' && redirectStatus !== 'succeeded' && (
                <div className="order-banner order-banner-warning">
                    <Clock size={18} />
                    <div>
                        <p className="banner-title">Awaiting payment</p>
                        <p className="banner-sub">Complete your payment to confirm this order.</p>
                    </div>
                    <button
                        className="btn-primary"
                        style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
                        onClick={() => navigate(`/payment/${order.id}`)}
                    >
                        <CreditCard size={14} />
                        Complete Payment
                    </button>
                </div>
            )}

            {/* Items + summary */}
            <div className="order-detail-layout">
                <div className="checkout-summary-panel">
                    <h2 className="summary-title">Items</h2>
                    <div className="checkout-items">
                        {order.items.map((item, index) => (
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
                                {index < order.items.length - 1 && (
                                    <div className="cart-divider" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="summary-divider" />

                    <div className="summary-row summary-total-row">
                        <span className="summary-total-label">Total</span>
                        <span className="summary-total-value">${order.total}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}