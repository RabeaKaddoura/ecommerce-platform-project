import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/api/orderApi'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PackageSearch } from 'lucide-react'

const statusColor: Record<string, 'default' | 'secondary' | 'destructive'> = { //Used to change order status UI color based fetched order status.
    pending: 'secondary',
    confirmed: 'default',
    shipped: 'default',
    delivered: 'default',
    cancelled: 'destructive',
}

export default function OrdersPage() {
    const navigate = useNavigate()

    const { data: orders, isLoading, isError } = useQuery({ //A state manager for getOrders request. Runs automatically when component renders to fetch orders.
        queryKey: ['orders'], //Caching
        queryFn: getOrders,
    })

    if (isLoading) {
        return <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
        </div>
    }

    if (isError) {
        return <p className="text-red-500">Failed to load orders.</p>
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-20">
                <PackageSearch className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground">No orders yet.</p>
                <Button onClick={() => navigate('/products')}>Start Shopping</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Your Orders</h1>
            <div className="flex flex-col gap-3">
                {orders.map((order) => (
                    <Card
                        key={order.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigate(`/orders/${order.id}`)}
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="font-medium">Order #{order.id}</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(order.created_at).toLocaleDateString()} · {order.items.length} item(s)
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold">${order.total}</span>
                                <Badge variant={statusColor[order.status] ?? 'default'}>
                                    {order.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}