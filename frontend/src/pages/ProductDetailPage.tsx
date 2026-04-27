import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProduct } from '@/api/productApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Tag, Calendar } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addItem } from '@/api/cartApi'
import { ShoppingCart, Check } from 'lucide-react'
import { PRODUCT_SERVICE_URL } from '@/utils/config'

export default function ProductDetailPage() {
    const { id } = useParams() //Loads value from URL path. id in this case.
    const navigate = useNavigate()

    const queryClient = useQueryClient() //Querying cache
    const [added, setAdded] = useState(false)

    const { data: product, isLoading, isError } = useQuery({ //Runs automatically when component renders to fetch a product.
        queryKey: ['product', id], //Caching
        queryFn: () => getProduct(Number(id)),
    })


    const { mutate: addToCart, isPending } = useMutation({ //Triggers when adding to cart. Calls API.
        mutationFn: () => addItem({
            product_id: product.id,
            quantity: 1,
            price: Number(product.new_price),
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] }) //Removes older cache
            setAdded(true)
            setTimeout(() => setAdded(false), 2000)
        },
    })


    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 gap-8 animate-pulse">
                <div className="aspect-square bg-muted rounded-lg" />
                <div className="flex flex-col gap-4">
                    <div className="h-8 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-10 bg-muted rounded w-1/3" />
                </div>
            </div>
        )
    }

    if (isError || !product) {
        return (
            <div className="flex flex-col items-center gap-4 py-20">
                <p className="text-muted-foreground">Product not found.</p>
                <Button variant="ghost" onClick={() => navigate('/products')}>
                    Back to products
                </Button>
            </div>
        )
    }

    const imageUrl = `${PRODUCT_SERVICE_URL}/static/images/${product.product_image}`

    return (
        <div className="flex flex-col gap-6">
            {/* Back button */}
            <Button
                variant="ghost"
                className="w-fit -ml-2"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Image */}
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Details */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <Badge variant="secondary">{product.category}</Badge>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold">
                            ${Number(product.new_price).toFixed(2)}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                            ${Number(product.original_price).toFixed(2)}
                        </span>
                        <Badge variant="destructive">
                            {product.percentage_discount}% off
                        </Badge>
                    </div>

                    {/* Offer expiration */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Offer expires: {product.offer_expiration}</span>
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Tag className="w-4 h-4" />
                        <span>{product.category}</span>
                    </div>

                    <hr className="my-2" />

                    {/* Add to cart */}
                    <Button
                        size="lg"
                        className="w-full md:w-fit"
                        onClick={() => addToCart()}
                        disabled={isPending || added}
                    >
                        {added ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Added!
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                {isPending ? 'Adding...' : 'Add to Cart'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}