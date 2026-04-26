import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { createPaymentIntent } from '@/api/paymentApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) //Initializes Stripe's JS SDK with publishable key.

//Inner form; must be inside <Elements>
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

        const { error: stripeError } = await stripe.confirmPayment({ //Reads card data from Elements.
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/orders/${orderId}`,
            },
        })

        if (stripeError) {
            setError(stripeError.message ?? 'Payment failed')
            setProcessing(false)
        }
        //If successful, Stripe redirects to return_url automatically.
    }

    return (
        <Card>
            <CardContent className="p-6 flex flex-col gap-4">
                <PaymentElement />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!stripe || processing}
                >
                    {processing ? 'Processing...' : 'Pay Now'}
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => navigate(`/orders/${orderId}`)}
                    disabled={processing}
                >
                    Cancel
                </Button>
            </CardContent>
        </Card>
    )
}

//Outer page; fetches client_secret and initializes Stripe Elements.
export default function PaymentPage() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId) return
        createPaymentIntent(Number(orderId))
            .then((data) => setClientSecret(data.client_secret))
            .catch((err) => {
                setError(err.response?.data?.detail || 'Failed to initialize payment')
            })
            .finally(() => setLoading(false))
    }, [orderId])

    if (loading) {
        return <div className="h-40 bg-muted rounded-lg animate-pulse" />
    }

    if (error) {
        return (
            <div className="flex flex-col items-center gap-4 py-20">
                <p className="text-red-500">{error}</p>
                <Button variant="ghost" onClick={() => navigate(`/orders/${orderId}`)}>
                    Back to Order
                </Button>
            </div>
        )
    }

    if (!clientSecret) return null

    return (
        <div className="flex flex-col gap-6 max-w-lg">
            <h1 className="text-3xl font-bold">Complete Payment</h1>
            <p className="text-muted-foreground text-sm">
                Order #{orderId} · Secured by Stripe
            </p>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm orderId={Number(orderId)} />
            </Elements>
        </div>
    )
}