import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '@/api/orderApi'
import { getCart } from '@/api/cartApi'
import { getProducts } from '@/api/productApi'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShoppingBag } from 'lucide-react'

export default function CheckoutPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: cart, isLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
        retry: false,
    })

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const getProductName = (productId: number) => {
        return products?.find((p) => p.id === productId)?.name ?? `Product #${productId}`
    }

    const total = cart?.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity, 0
    ) ?? 0

    const { mutate: placeOrder, isPending, isError, error } = useMutation({
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

            {/* Order summary — clean list style */}
            <div>
                <h2 className="font-semibold text-lg mb-3">Order Summary</h2>
                <div className="flex flex-col">
                    {cart.items.map((item, index) => (
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
                            {index < cart.items.length - 1 && <Separator />}
                        </div>
                    ))}
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl">${total.toFixed(2)}</span>
                </div>
            </div>

            {isError && (
                <p className="text-sm text-red-500">
                    {(error as any)?.response?.data?.detail || 'Failed to place order. Try again.'}
                </p>
            )}

            <Button size="lg" onClick={() => placeOrder()} disabled={isPending}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                {isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
        </div>
    )
}