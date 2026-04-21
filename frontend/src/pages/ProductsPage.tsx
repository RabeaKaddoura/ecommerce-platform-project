import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/api/productApi'
import ProductCard from '@/components/shared/ProductCard'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function ProductsPage() {

    const [search, setSearch] = useState('')

    const { data: products, isLoading, isError } = useQuery({ //A state manager for getProducts request. Runs automatically when component renders to fetch products.
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const filtered = products?.filter((p) => //Matches either product name or category against search and returns the matching product(s).
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    )


    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold">Products</h1>
                <p className="text-muted-foreground">Browse our full catalogue</p>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* States */}
            {isLoading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
                    ))}
                </div>
            )}

            {isError && (
                <p className="text-red-500">Failed to load products.</p>
            )}

            {filtered && filtered.length === 0 && (
                <p className="text-muted-foreground">No products found.</p>
            )}

            {/* Grid */}
            {filtered && filtered.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}