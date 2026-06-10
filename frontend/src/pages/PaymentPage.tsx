import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { createPaymentIntent } from '@/api/paymentApi'
import { ArrowLeft, Lock } from 'lucide-react'

function CheckoutForm({ orderId }: { orderId: number }) {
    const stripe = useStripe()
    const elements = useElements()
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [processing, setProcessing] = useState(false)

    const handleSubmit = async () => {
        if (!stripe || !elements) return
        setProcessing(true)
        setError('')
        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/orders/${orderId}`,
            },
        })
        if (stripeError) {
            setError(stripeError.message ?? 'Payment failed')
            setProcessing(false)
        }
    }

    return (
        <div className="payment-form-panel">
            <h2 className="summary-title">Payment Details</h2>
            <div className="payment-element-wrap">
                <PaymentElement />
            </div>

            {error && (
                <p className="checkout-error">{error}</p>
            )}

            <button
                className="btn-primary btn-full"
                onClick={handleSubmit}
                disabled={!stripe || processing}
            >
                <Lock size={14} />
                {processing ? 'Processing…' : 'Pay Now'}
            </button>

            <button
                className="btn-ghost btn-full"
                onClick={() => navigate(`/orders/${orderId}`)}
                disabled={processing}
            >
                <ArrowLeft size={14} />
                Cancel
            </button>
        </div>
    )
}

export default function PaymentPage() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    const stripePromise = useMemo(() => {
        const key = window.__CONFIG__?.STRIPE_PUBLISHABLE_KEY ?? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
        if (!key) return null
        return loadStripe(key)
    }, [])

    useEffect(() => {
        if (!orderId) return
        createPaymentIntent(Number(orderId))
            .then((data) => setClientSecret(data.client_secret))
            .catch((err) => setError(err.response?.data?.detail || 'Failed to initialize payment'))
            .finally(() => setLoading(false))
    }, [orderId])

    if (loading) {
        return (
            <div className="orders-page">
                <div className="page-hero">
                    <p className="hero-eyebrow">Final Step</p>
                    <h1 className="hero-title">Payment</h1>
                </div>
                <div className="cart-skeletons">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="cart-skeleton-row" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="orders-page">
                <div className="page-hero">
                    <p className="hero-eyebrow">Final Step</p>
                    <h1 className="hero-title">Payment</h1>
                </div>
                <div className="cart-empty">
                    <p className="checkout-error" style={{ textAlign: 'center' }}>{error}</p>
                    <button className="btn-primary" onClick={() => navigate(`/orders/${orderId}`)}>
                        Back to Order
                    </button>
                </div>
            </div>
        )
    }

    if (!clientSecret) return null

    return (
        <div className="orders-page">
            <button className="detail-back" onClick={() => navigate(`/orders/${orderId}`)}>
                <ArrowLeft size={15} />
                Back to Order
            </button>

            <div className="page-hero">
                <p className="hero-eyebrow">Final Step</p>
                <h1 className="hero-title">Payment</h1>
                <p className="hero-subtitle">Order #{orderId} · Secured by Stripe</p>
            </div>

            <div className="payment-layout">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm orderId={Number(orderId)} />
                </Elements>

                <div className="payment-trust-panel">
                    <h2 className="summary-title">Secure Checkout</h2>
                    <p className="checkout-notice">
                        Your payment is encrypted and processed securely by Stripe.
                        We never store your card details.
                    </p>
                    <div className="trust-badges">
                        <div className="trust-badge">
                            <Lock size={13} />
                            SSL Encrypted
                        </div>
                        <div className="trust-badge">
                            Powered by Stripe
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}