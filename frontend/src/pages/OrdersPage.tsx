import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/api/orderApi'
import { useNavigate } from 'react-router-dom'
import { PackageSearch, ArrowRight } from 'lucide-react'

const statusStyles: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'status-pending' },
    confirmed: { label: 'Confirmed', className: 'status-confirmed' },
    shipped: { label: 'Shipped', className: 'status-shipped' },
    delivered: { label: 'Delivered', className: 'status-delivered' },
    cancelled: { label: 'Cancelled', className: 'status-cancelled' },
}

export default function OrdersPage() {
    const navigate = useNavigate()

    const { data: orders, isLoading, isError } = useQuery({
        queryKey: ['orders'],
        queryFn: getOrders,
    })

    if (isLoading) {
        return (
            <div className="orders-page">
                <div className="page-hero">
                    <p className="hero-eyebrow">Your Account</p>
                    <h1 className="hero-title">Orders</h1>
                </div>
                <div className="cart-skeletons">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="cart-skeleton-row" />
                    ))}
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="orders-page">
                <div className="page-hero">
                    <p className="hero-eyebrow">Your Account</p>
                    <h1 className="hero-title">Orders</h1>
                </div>
                <div className="empty-state">
                    <p>Failed to load orders.</p>
                </div>
            </div>
        )
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="orders-page">
                <div className="page-hero">
                    <p className="hero-eyebrow">Your Account</p>
                    <h1 className="hero-title">Orders</h1>
                </div>
                <div className="cart-empty">
                    <PackageSearch size={48} strokeWidth={1} className="cart-empty-icon" />
                    <p className="cart-empty-text">No orders yet</p>
                    <button className="btn-primary" onClick={() => navigate('/products')}>
                        Start Shopping
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="orders-page">
            <div className="page-hero">
                <p className="hero-eyebrow">Your Account</p>
                <h1 className="hero-title">Orders</h1>
                <p className="hero-subtitle">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
            </div>

            <div className="orders-list">
                {orders.map((order) => {
                    const s = statusStyles[order.status] ?? { label: order.status, className: 'status-pending' }
                    return (
                        <div
                            key={order.id}
                            className="order-row"
                            onClick={() => navigate(`/orders/${order.id}`)}
                        >
                            <div className="order-row-left">
                                <span className="order-number">Order #{order.id}</span>
                                <span className="order-meta">
                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                    &nbsp;·&nbsp;
                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>
                            <div className="order-row-right">
                                <span className="order-total">${order.total}</span>
                                <span className={`order-status ${s.className}`}>{s.label}</span>
                                <ArrowRight size={15} className="order-arrow" />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}