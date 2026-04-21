import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, removeItem, clearCart } from '@/api/cartApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CartPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: cart, isLoading, isError } = useQuery({ //Runs automatically when component renders to fetch cart.
        queryKey: ['cart'], //caching
        queryFn: getCart,
        retry: false, //Don't retry on 404 (empty cart)
    })

    const { mutate: remove } = useMutation({ //Triggers on remove cart item. Calls API.
        mutationFn: (itemId: number) => removeItem(itemId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }), //Removes older cache
    })

    const { mutate: clear, isPending: clearing } = useMutation({ //Triggers on clearing cart item. Calls API.
        mutationFn: clearCart,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }), //Removes older cache
    })

    const total = cart?.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) ?? 0

    if (isLoading) {
        return <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
        </div>
    }

    const isEmpty = isError || !cart || cart.items.length === 0

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center gap-4 py-20">
                <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground">Your cart is empty.</p>
                <Button onClick={() => navigate('/products')}>Browse Products</Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Your Cart</h1>
                <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => clear()}
                    disabled={clearing}
                >
                    {clearing ? 'Clearing...' : 'Clear Cart'}
                </Button>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-3">
                {cart.items.map((item) => (
                    <Card key={item.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <p className="font-medium">Product #{item.product_id}</p>
                                <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold">
                                    ${(Number(item.price) * item.quantity).toFixed(2)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => remove(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Total + Checkout */}
            <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                </div>
                <Button size="lg" onClick={() => navigate('/checkout')}>
                    Proceed to Checkout
                </Button>
            </div>
        </div>
    )
}