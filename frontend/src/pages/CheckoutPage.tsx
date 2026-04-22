import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '@/api/orderApi'
import { getCart } from '@/api/cartApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingBag } from 'lucide-react'

export default function CheckoutPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: cart, isLoading } = useQuery({ //A state manager for getCart request. Runs automatically when component renders to fetch cart.
        queryKey: ['cart'], //Caching
        queryFn: getCart,
        retry: false,
    })

    const total = cart?.items.reduce( //Sums cart's items total
        (sum, item) => sum + Number(item.price) * item.quantity, 0
    ) ?? 0

    const { mutate: placeOrder, isPending, isError, error } = useMutation({ //Triggers when order is placed. Calls order service API.
        mutationFn: createOrder,
        onSuccess: (order) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            navigate(`/orders/${order.id}`)
        },
    })

    if (isLoading) {
        return <div className="h-40 bg-muted rounded-lg animate-pulse" />
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-20">
                <p className="text-muted-foreground">Your cart is empty.</p>
                <Button onClick={() => navigate('/products')}>Browse Products</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 max-w-lg">
            <h1 className="text-3xl font-bold">Checkout</h1>

            {/* Order summary */}
            <Card>
                <CardContent className="p-4 flex flex-col gap-3">
                    <h2 className="font-semibold text-lg">Order Summary</h2>
                    {cart.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Product #{item.product_id} × {item.quantity}
                            </span>
                            <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>

            {isError && (
                <p className="text-sm text-red-500">
                    {(error as any)?.response?.data?.detail || 'Failed to place order. Try again.'}
                </p>
            )}

            <Button
                size="lg"
                onClick={() => placeOrder()}
                disabled={isPending}
            >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
        </div>
    )
}