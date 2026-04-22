import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOrder } from '@/api/orderApi'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

    const { data: order, isLoading, isError } = useQuery({ //A state manager for getOrder request. Runs automatically when component renders to fetch specific orders.
        queryKey: ['order', id], //Caching
        queryFn: () => getOrder(Number(id)),
    })

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

            <p className="text-sm text-muted-foreground">
                Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>

            <Card>
                <CardContent className="p-4 flex flex-col gap-3">
                    <h2 className="font-semibold">Items</h2>
                    {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Product #{item.product_id} × {item.quantity}
                            </span>
                            <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between font-bold">
                        <span>Total</span>
                        <span>${order.total}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}