import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrder } from '@/api/orderApi'
import { getProducts } from '@/api/productApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'

const statusColor: Record<string, 'default' | 'secondary' | 'destructive'> = { //Used to change order status UI color based fetched order status.
    pending: 'secondary',
    confirmed: 'default',
    shipped: 'default',
    delivered: 'default',
    cancelled: 'destructive',
}

export default function OrderDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const redirectStatus = searchParams.get('redirect_status') //Stripe appends this after redirecting back from payment

    const { data: order, isLoading, isError } = useQuery({ //A state manager for getOrder request. Runs automatically when component renders to fetch specific orders.
        queryKey: ['order', id], //Caching
        queryFn: () => getOrder(Number(id)),
    })

    const { data: products } = useQuery({ //Fetch all products to resolve product names from IDs in order items
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const getProductName = (productId: number) => { //Looks up product name by ID, falls back to "Product #ID" if not found
        return products?.find((p) => p.id === productId)?.name ?? `Product #${productId}`
    }

    if (isLoading) {
        return <div className="h-40 bg-muted rounded-lg animate-pulse" />
    }

    if (isError || !order) {
        return (
            <div className="flex flex-col items-center gap-4 py-20">
                <p className="text-muted-foreground">Order not found.</p>
                <Button variant="ghost" onClick={() => navigate('/orders')}>
                    Back to orders
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 max-w-lg">
            <Button variant="ghost" className="w-fit -ml-2" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                <Badge variant={statusColor[order.status] ?? 'default'}>
                    {order.status}
                </Badge>
            </div>

            <p className="text-sm text-muted-foreground -mt-4">
                Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>

            {/* Show success message if redirected from Stripe after successful payment */}
            {order.status === 'pending' && redirectStatus === 'succeeded' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">Payment successful!</p>
                    <p className="text-sm text-green-600 mt-0.5">
                        Your order is being confirmed, refresh in a moment.
                    </p>
                </div>
            )}

            {/* Show payment button only if still pending and not just redirected from Stripe */}
            {order.status === 'pending' && redirectStatus !== 'succeeded' && (
                <Button onClick={() => navigate(`/payment/${order.id}`)}>
                    Complete Payment
                </Button>
            )}

            {order.status === 'confirmed' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">Order confirmed!</p>
                </div>
            )}

            {order.status === 'cancelled' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">Payment failed.</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => navigate(`/payment/${order.id}`)}
                    >
                        Retry Payment
                    </Button>
                </div>
            )}

            {/* Items — separator style instead of card */}
            <div>
                <h2 className="font-semibold text-lg mb-3">Items</h2>
                <div className="flex flex-col">
                    {order.items.map((item, index) => (
                        <div key={item.id}>
                            <div className="flex justify-between items-center py-3">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">{getProductName(item.product_id)}</span>
                                    <span className="text-sm text-muted-foreground">
                                        Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                                    </span>
                                </div>
                                <span className="font-semibold">
                                    ${(Number(item.price) * item.quantity).toFixed(2)}
                                </span>
                            </div>
                            {index < order.items.length - 1 && <Separator />}
                        </div>
                    ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl">${order.total}</span>
                </div>
            </div>
        </div>
    )
}