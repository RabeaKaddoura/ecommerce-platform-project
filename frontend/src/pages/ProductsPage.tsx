import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/api/productApi'
import ProductCard from '@/components/shared/ProductCard'
import { Search, SlidersHorizontal } from 'lucide-react'

export default function ProductsPage() {
    const [search, setSearch] = useState('')

    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const filtered = products?.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="products-page">
            {/* Hero header */}
            <div className="page-hero">
                <p className="hero-eyebrow">Our Collection</p>
                <h1 className="hero-title">All Products</h1>
                <p className="hero-subtitle">Curated selections, exceptional quality</p>
            </div>

            {/* Search bar */}
            <div className="search-row">
                <div className="search-wrap">
                    <Search className="search-icon" size={16} />
                    <input
                        className="search-input"
                        placeholder="Search by name or category…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="result-count">
                    {filtered ? `${filtered.length} items` : ''}
                </div>
            </div>

            {/* Loading skeletons */}
            {isLoading && (
                <div className="product-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-img" />
                            <div className="skeleton-line wide" />
                            <div className="skeleton-line narrow" />
                        </div>
                    ))}
                </div>
            )}

            {isError && (
                <div className="empty-state">
                    <p>Something went wrong loading products.</p>
                </div>
            )}

            {filtered && filtered.length === 0 && (
                <div className="empty-state">
                    <p>No products match your search.</p>
                </div>
            )}

            {filtered && filtered.length > 0 && (
                <div className="product-grid">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}