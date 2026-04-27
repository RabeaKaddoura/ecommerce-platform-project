import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, removeItem, clearCart } from '@/api/cartApi'
import { getProducts } from '@/api/productApi'
import { Button } from '@/components/ui/button'
import { Trash2, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { PRODUCT_SERVICE_URL } from '@/utils/config'

export default function CartPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: cart, isLoading: cartLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
        retry: false,
    })

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const { mutate: remove } = useMutation({
        mutationFn: (itemId: number) => removeItem(itemId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    })

    const { mutate: clear, isPending: clearing } = useMutation({
        mutationFn: clearCart,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    })

    const getProductName = (productId: number) => {
        return products?.find((p) => p.id === productId)?.name ?? `Product #${productId}`
    }

    const getProductImage = (productId: number) => {
        const image = products?.find((p) => p.id === productId)?.product_image
        return image ? `${PRODUCT_SERVICE_URL}/static/images/${image}` : null
    }

    const total = cart?.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity, 0
    ) ?? 0

    if (cartLoading) {
        return (
            <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                ))}
            </div>
        )
    }

    const isEmpty = !cart || cart.items.length === 0

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
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => clear()}
                    disabled={clearing}
                >
                    {clearing ? 'Clearing...' : 'Clear all'}
                </Button>
            </div>

            {/* Items — table style, no cards */}
            <div className="flex flex-col">
                {cart.items.map((item, index) => (
                    <div key={item.id}>
                        <div className="flex items-center gap-4 py-4">
                            {/* Image */}
                            <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                                {getProductImage(item.product_id) ? (
                                    <img
                                        src={getProductImage(item.product_id)!}
                                        alt={getProductName(item.product_id)}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-muted" />
                                )}
                            </div>

                            {/* Name + qty */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{getProductName(item.product_id)}</p>
                                <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                                </p>
                            </div>

                            {/* Price + delete */}
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="font-semibold">
                                    ${(Number(item.price) * item.quantity).toFixed(2)}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-red-500"
                                    onClick={() => remove(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        {index < cart.items.length - 1 && <Separator />}
                    </div>
                ))}
            </div>

            {/* Total + Checkout */}
            <div className="border-t pt-4 flex items-center justify-between">
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