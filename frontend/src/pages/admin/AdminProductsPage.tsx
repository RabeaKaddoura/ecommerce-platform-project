import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/api/productApi'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { PRODUCT_SERVICE_URL } from '@/utils/config'

type ProductFormData = Omit<Product, 'id'>

const emptyForm: ProductFormData = {
    name: '',
    category: '',
    original_price: 0,
    new_price: 0,
    percentage_discount: 0,
    offer_expiration: '',
    product_image: 'productDefault.jpg',
}

interface ProductFormProps {
    initial: ProductFormData
    onSubmit: (data: ProductFormData) => void
    isPending: boolean
    onCancel: () => void
    title: string
}

function ProductForm({ initial, onSubmit, isPending, onCancel, title }: ProductFormProps) { //Reusable form component for CRUD operations.
    const [form, setForm] = useState<ProductFormData>(initial)

    const set = (field: keyof ProductFormData, value: string | number) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Product name" />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Category</Label>
                    <Input value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Electronics" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                        <Label>Original Price</Label>
                        <Input
                            type="number"
                            value={form.original_price}
                            onChange={(e) => set('original_price', parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label>New Price</Label>
                        <Input
                            type="number"
                            value={form.new_price}
                            onChange={(e) => set('new_price', parseFloat(e.target.value))}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Discount %</Label>
                    <Input
                        type="number"
                        value={form.percentage_discount}
                        onChange={(e) => set('percentage_discount', parseInt(e.target.value))}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Offer Expiration</Label>
                    <Input
                        type="date"
                        value={form.offer_expiration}
                        onChange={(e) => set('offer_expiration', e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Image Filename</Label>
                    <Input
                        value={form.product_image}
                        onChange={(e) => set('product_image', e.target.value)}
                        placeholder="productDefault.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                        Must match a file in your product service static/images/ folder
                    </p>
                </div>
                <div className="flex gap-2 mt-2">
                    <Button onClick={() => onSubmit(form)} disabled={isPending} className="flex-1">
                        {isPending ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={onCancel} disabled={isPending}>
                        Cancel
                    </Button>
                </div>
            </div>
        </DialogContent>
    )
}

export default function AdminProductsPage() {
    const queryClient = useQueryClient()
    const [createOpen, setCreateOpen] = useState(false)
    const [editProduct, setEditProduct] = useState<Product | null>(null)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [error, setError] = useState('')

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['products'] })

    const { mutate: create, isPending: creating } = useMutation({
        mutationFn: (data: ProductFormData) => createProduct(data),
        onSuccess: () => { invalidate(); setCreateOpen(false); setError('') },
        onError: (err: any) => setError(err.response?.data?.detail || 'Failed to create product'),
    })

    const { mutate: edit, isPending: editing } = useMutation({
        mutationFn: (data: ProductFormData) => updateProduct(editProduct!.id, data),
        onSuccess: () => { invalidate(); setEditProduct(null); setError('') },
        onError: (err: any) => setError(err.response?.data?.detail || 'Failed to update product'),
    })

    const { mutate: remove, isPending: deleting } = useMutation({
        mutationFn: (id: number) => deleteProduct(id),
        onSuccess: () => { invalidate(); setDeleteId(null) },
        onError: (err: any) => setError(err.response?.data?.detail || 'Failed to delete product'),
    })

    if (isLoading) {
        return <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
        </div>
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin — Products</h1>
                    <p className="text-muted-foreground text-sm">{products?.length ?? 0} products total</p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Product list */}
            <div className="flex flex-col gap-3">
                {products?.map((product) => (
                    <Card key={product.id}>
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                                <img
                                    src={`${PRODUCT_SERVICE_URL}/static/images/${product.product_image}`}
                                    alt={product.name}
                                    className="w-12 h-12 rounded object-cover bg-muted shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{product.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                                        <span className="text-sm text-muted-foreground">
                                            ${Number(product.new_price).toFixed(2)}
                                        </span>
                                        <span className="text-xs text-muted-foreground line-through">
                                            ${Number(product.original_price).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => { setEditProduct(product); setError('') }}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => setDeleteId(product.id)}
                                    disabled={deleting && deleteId === product.id}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <ProductForm
                    title="Add Product"
                    initial={emptyForm}
                    onSubmit={create}
                    isPending={creating}
                    onCancel={() => setCreateOpen(false)}
                />
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
                {editProduct && (
                    <ProductForm
                        title="Edit Product"
                        initial={{
                            name: editProduct.name,
                            category: editProduct.category,
                            original_price: editProduct.original_price,
                            new_price: editProduct.new_price,
                            percentage_discount: editProduct.percentage_discount,
                            offer_expiration: editProduct.offer_expiration,
                            product_image: editProduct.product_image,
                        }}
                        onSubmit={edit}
                        isPending={editing}
                        onCancel={() => setEditProduct(null)}
                    />
                )}
            </Dialog>

            {/* Delete confirmation dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground text-sm">
                        Are you sure you want to delete this product? This cannot be undone.
                    </p>
                    <div className="flex gap-2 mt-2">
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => deleteId && remove(deleteId)}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}