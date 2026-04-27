import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'
import { PRODUCT_SERVICE_URL } from '@/utils/config'

interface Props {
    product: Product
}



export default function ProductCard({ product }: Props) {

    const imageUrl = `${PRODUCT_SERVICE_URL}/static/images/${product.product_image}` //temporary 

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-muted overflow-hidden">
                {product.product_image ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No image
                    </div>
                )}
            </div>
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2">{product.name}</h3>
                    <Badge variant="secondary" className="shrink-0 text-xs">{product.category}</Badge>
                </div>

                <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold">${Number(product.new_price).toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground line-through">${Number(product.original_price).toFixed(2)}</span>
                    <Badge variant="destructive" className="text-xs ml-auto">{product.percentage_discount}% off</Badge>
                </div>

                <p className="text-xs text-muted-foreground">
                    Offer expires: {product.offer_expiration}
                </p>

                <Button asChild size="sm" className="w-full mt-1">
                    <Link to={`/products/${product.id}`}>View Product</Link>
                </Button>
            </CardContent>
        </Card>
    )
}