import { useState } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Dialog } from '@/Components/ui/dialog';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/ui/pagination';
import { PageProps } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    History,
    Boxes,
    Tag,
    DollarSign,
    Building2,
} from 'lucide-react';

interface Product {
    id: number;
    company_id: string;
    name: string;
    units_per_box: number;
    total_pieces: number;
    boxes_count: number;
    remaining_pieces: number;
    purchase_price?: number | null;
    sale_price: number;
    created_at: string;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    from: number | null;
    to: number | null;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface WarehouseProps {
    products: PaginatedProducts;
    filters?: {
        search?: string;
    };
    stats?: {
        total_products: number;
        total_boxes: number;
        total_pieces: number;
        total_stock_value: number;
    };
}

export default function Warehouse({ products, filters, stats }: WarehouseProps) {
    const { activeCompany } = usePage<PageProps>().props;
    const companyName = activeCompany?.name || 'دلال دجلة';

    const [search, setSearch] = useState(filters?.search || '');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [restockProduct, setRestockProduct] = useState<Product | null>(null);

    // Form for Adding / Editing Product
    const productForm = useForm<{
        name: string;
        units_per_box: string | number;
        initial_boxes: string | number;
        purchase_price: string;
        sale_price: string;
    }>({
        name: '',
        units_per_box: '',
        initial_boxes: '',
        purchase_price: '',
        sale_price: '',
    });

    // Form for Restocking (Boxes only)
    const restockForm = useForm<{
        boxes: string | number;
        notes: string;
    }>({
        boxes: '',
        notes: '',
    });

    // Search submit handler
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/warehouse', { search }, { preserveState: true });
    };

    // Open Add Product Modal
    const handleOpenAddModal = () => {
        setEditingProduct(null);
        productForm.setData({
            name: '',
            units_per_box: '',
            initial_boxes: '',
            purchase_price: '',
            sale_price: '',
        });
        setIsAddModalOpen(true);
    };

    // Open Edit Product Modal
    const handleOpenEditModal = (product: Product) => {
        setEditingProduct(product);
        productForm.setData({
            name: product.name,
            units_per_box: product.units_per_box,
            initial_boxes: '',
            purchase_price: product.purchase_price ? String(Math.round(product.purchase_price)) : '',
            sale_price: String(Math.round(product.sale_price)),
        });
        setIsAddModalOpen(true);
    };

    // Submit Add / Edit Product
    const handleSubmitProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            productForm.put(`/products/${editingProduct.id}`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    productForm.reset();
                },
            });
        } else {
            productForm.post('/products', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    productForm.reset();
                },
            });
        }
    };

    // Submit Add Stock / Restock (Boxes only)
    const handleSubmitRestock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!restockProduct) return;

        restockForm.post(`/products/${restockProduct.id}/add-stock`, {
            onSuccess: () => {
                setRestockProduct(null);
                restockForm.reset();
            },
        });
    };

    // Delete Product
    const handleDeleteProduct = (product: Product) => {
        if (confirm(`هل أنت تأكد من حذف المنتج "${product.name}"؟`)) {
            router.delete(`/products/${product.id}`);
        }
    };

    const productList = products.data || [];

    // Clean Pagination Links Handling
    const prevLink = products.links && products.links.length > 0 ? products.links[0] : null;
    const nextLink = products.links && products.links.length > 0 ? products.links[products.links.length - 1] : null;
    const pageNumberLinks = products.links && products.links.length > 2 ? products.links.slice(1, -1) : [];

    return (
        <AuthenticatedLayout title="المخزن">
            <Head title={`المخزن - ${companyName}`} />

            <div className="space-y-6" dir="rtl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-5 w-5 text-primary" />
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                شركة {companyName}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            إدارة مخزن {companyName}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            متابعة الشحنات والمنتجات والكراتين بالدينار العراقي
                        </p>
                    </div>
                    <Button onClick={handleOpenAddModal} className="gap-2 shrink-0">
                        <Plus className="h-4 w-4" />
                        إضافة منتج جديد
                    </Button>
                </div>

                {/* Stats Summary Bar */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                عدد المنتجات
                            </CardTitle>
                            <Package className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats?.total_products || 0)}</div>
                            <p className="text-xs text-muted-foreground mt-1">صنف متوفر بالمخزن</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                إجمالي الكراتين
                            </CardTitle>
                            <Boxes className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats?.total_boxes || 0)}</div>
                            <p className="text-xs text-muted-foreground mt-1">كرتون بالمخزن</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                إجمالي القطع
                            </CardTitle>
                            <Tag className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.total_pieces || 0)}</div>
                            <p className="text-xs text-muted-foreground mt-1">قطعة إجمالية متوفرة</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                القيمة الكلية للمخزون
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">
                                {formatCurrency(stats?.total_stock_value || 0)} <span className="text-xs font-normal">د.ع</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">تقدير قيمة بضاعة المخزن</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearchSubmit} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="البحث باسم المنتج..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pr-9"
                                    dir="rtl"
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="gap-2">
                                بحث
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Products Grid & Table Container */}
                <Card className="overflow-hidden border-border">
                    <CardHeader className="bg-muted/40 border-b border-border py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                قائمة منتجات {companyName}
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                                عرض {products.from || 0} إلى {products.to || 0} من {products.total}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {productList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                                    <Package className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-1">لا توجد منتجات بالمخزن</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                    لم يتم إضافة أي منتج في مخزن شركة {companyName} بعد.
                                </p>
                                <Button onClick={handleOpenAddModal} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    إضافة أول منتج
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Desktop View: Full Data Grid Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm text-right border-collapse">
                                        <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground border-b border-border">
                                            <tr>
                                                <th className="p-3.5 pr-6">اسم المنتج</th>
                                                <th className="p-3.5">الرصيد بالكراتين</th>
                                                <th className="p-3.5">تعبئة الكرتون</th>
                                                <th className="p-3.5">سعر الشراء</th>
                                                <th className="p-3.5">سعر البيع</th>
                                                <th className="p-3.5 pl-6 text-center">الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {productList.map((product) => (
                                                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-3.5 pr-6 font-bold text-foreground">
                                                        {product.name}
                                                    </td>
                                                    <td className="p-3.5">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-base">
                                                                {formatCurrency(product.boxes_count)} كرتون
                                                                {product.remaining_pieces > 0 && ` و ${formatCurrency(product.remaining_pieces)} قطعة`}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ({formatCurrency(product.total_pieces)} قطعة بالكامل)
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3.5">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-xs font-semibold">
                                                            {formatCurrency(product.units_per_box)} قطعة / كرتون
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 text-muted-foreground">
                                                        {product.purchase_price ? (
                                                            <span className="font-medium text-foreground">
                                                                {formatCurrency(product.purchase_price)} د.ع
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground/60">غير محدد</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3.5 font-bold text-primary text-base">
                                                        {formatCurrency(product.sale_price)} د.ع
                                                    </td>
                                                    <td className="p-3.5 pl-6">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {/* Restock Button */}
                                                            <Button
                                                                size="xs"
                                                                variant="default"
                                                                className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                                                onClick={() => {
                                                                    setRestockProduct(product);
                                                                    restockForm.setData((prev) => ({ ...prev, boxes: 1, notes: '' }));
                                                                }}
                                                                title="إضافة كراتين جديدة للمخزن"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                                <span>إضافة كراتين</span>
                                                            </Button>

                                                            {/* Dedicated Movement History Page Button */}
                                                            <Link href={`/products/${product.id}/movements`}>
                                                                <Button
                                                                    size="xs"
                                                                    variant="outline"
                                                                    className="gap-1 border-border"
                                                                    title="صفحة سجل الحركة"
                                                                >
                                                                    <History className="h-3.5 w-3.5 text-blue-600" />
                                                                    <span>السجل</span>
                                                                </Button>
                                                            </Link>

                                                            {/* Edit Button */}
                                                            <Button
                                                                size="icon-xs"
                                                                variant="ghost"
                                                                onClick={() => handleOpenEditModal(product)}
                                                                title="تعديل"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                                            </Button>

                                                            {/* Delete Button */}
                                                            <Button
                                                                size="icon-xs"
                                                                variant="ghost"
                                                                onClick={() => handleDeleteProduct(product)}
                                                                title="حذف"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View: Optimized Cards Grid (No horizontal overflow/clipping) */}
                                <div className="block md:hidden divide-y divide-border p-3 space-y-3">
                                    {productList.map((product) => (
                                        <div
                                            key={product.id}
                                            className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-bold text-foreground text-base">{product.name}</h4>
                                                    <span className="text-xs text-muted-foreground mt-0.5 block">
                                                        التعبئة: {formatCurrency(product.units_per_box)} قطعة لكل كرتون
                                                    </span>
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-xs text-muted-foreground block">سعر البيع:</span>
                                                    <span className="font-bold text-primary text-base">
                                                        {formatCurrency(product.sale_price)} <span className="text-xs font-normal">د.ع</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Stock Info Box */}
                                            <div className="bg-muted/30 p-2.5 rounded-lg border border-border/50 flex items-center justify-between text-xs">
                                                <div>
                                                    <span className="text-muted-foreground block">الرصيد بالكراتين:</span>
                                                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-base">
                                                        {formatCurrency(product.boxes_count)} كرتون
                                                        {product.remaining_pieces > 0 && ` و ${formatCurrency(product.remaining_pieces)} قطعة`}
                                                    </span>
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-muted-foreground block">إجمالي القطع:</span>
                                                    <span className="font-semibold text-foreground">
                                                        {formatCurrency(product.total_pieces)} قطعة
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions Bar */}
                                            <div className="flex items-center justify-between pt-2 border-t border-border/60 gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Button
                                                        size="xs"
                                                        className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                                        onClick={() => {
                                                            setRestockProduct(product);
                                                            restockForm.setData((prev) => ({ ...prev, boxes: 1, notes: '' }));
                                                        }}
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        <span>إضافة كراتين</span>
                                                    </Button>

                                                    <Link href={`/products/${product.id}/movements`}>
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            className="gap-1 border-border"
                                                        >
                                                            <History className="h-3.5 w-3.5 text-blue-600" />
                                                            <span>السجل</span>
                                                        </Button>
                                                    </Link>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="icon-xs"
                                                        variant="ghost"
                                                        onClick={() => handleOpenEditModal(product)}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </Button>
                                                    <Button
                                                        size="icon-xs"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteProduct(product)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Clean Shadcn UI Pagination */}
                {products.last_page > 1 && (
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">
                            الصفحة {products.current_page} من أصل {products.last_page}
                        </span>

                        <Pagination>
                            <PaginationContent>
                                {/* Previous Button */}
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={prevLink?.url}
                                        disabled={!prevLink?.url}
                                    />
                                </PaginationItem>

                                {/* Page Numbers */}
                                {pageNumberLinks.map((link, idx) => (
                                    <PaginationItem key={idx}>
                                        {link.label === '...' ? (
                                            <PaginationEllipsis />
                                        ) : (
                                            <PaginationLink
                                                href={link.url}
                                                isActive={link.active}
                                            >
                                                {link.label}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}

                                {/* Next Button */}
                                <PaginationItem>
                                    <PaginationNext
                                        href={nextLink?.url}
                                        disabled={!nextLink?.url}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Modal 1: Add / Edit Product */}
            <Dialog
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingProduct ? 'تعديل بيانات المنتج' : `إضافة منتج جديد - شركة ${companyName}`}
                description={editingProduct ? 'تعديل اسم المنتج والتعبئة والأسعار' : 'إدخال بيانات المنتج والتعبئة وعدد الكراتين الأولية'}
            >
                <form onSubmit={handleSubmitProduct} className="space-y-4 text-right" dir="rtl">
                    <div>
                        <Label htmlFor="product-name">اسم المنتج *</Label>
                        <Input
                            id="product-name"
                            placeholder="مثال: زيت دجلة 1 لتر"
                            value={productForm.data.name}
                            onChange={(e) => productForm.setData('name', e.target.value)}
                            required
                        />
                        {productForm.errors.name && (
                            <p className="text-xs text-destructive mt-1">{productForm.errors.name}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="units_per_box">عدد التعبئة (كم قطعة داخل الكرتون الواحد؟) *</Label>
                        <Input
                            id="units_per_box"
                            type="number"
                            min="1"
                            placeholder="مثال: 12"
                            value={productForm.data.units_per_box}
                            onChange={(e) => productForm.setData('units_per_box', e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            يُحدد مرة واحدة وتُحسب الكراتين بناءً عليه تلقائياً
                        </p>
                    </div>

                    {!editingProduct && (
                        <div className="bg-muted/30 p-3 rounded-lg border border-border">
                            <Label htmlFor="initial_boxes">عدد الكراتين الأولي بالمخزن *</Label>
                            <Input
                                id="initial_boxes"
                                type="number"
                                min="0"
                                placeholder="مثال: 10"
                                value={productForm.data.initial_boxes}
                                onChange={(e) => productForm.setData('initial_boxes', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                سيتم إظهار الرصيد بالكراتين وإجمالي القطع تلقائياً ({(Number(productForm.data.initial_boxes) || 0) * (Number(productForm.data.units_per_box) || 0)} قطعة)
                            </p>
                        </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="purchase_price">سعر الشراء بالدينار العراقي (اختياري)</Label>
                            <Input
                                id="purchase_price"
                                type="number"
                                step="1"
                                min="0"
                                placeholder="مثال: 18000"
                                value={productForm.data.purchase_price}
                                onChange={(e) => productForm.setData('purchase_price', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="sale_price">سعر البيع بالدينار العراقي *</Label>
                            <Input
                                id="sale_price"
                                type="number"
                                step="1"
                                min="0"
                                placeholder="مثال: 22000"
                                value={productForm.data.sale_price}
                                onChange={(e) => productForm.setData('sale_price', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={productForm.processing}>
                            {editingProduct ? 'تحديث المنتج' : 'حفظ المنتج'}
                        </Button>
                    </div>
                </form>
            </Dialog>

            {/* Modal 2: Simplified Restock Modal (Boxes Only) */}
            <Dialog
                open={!!restockProduct}
                onClose={() => setRestockProduct(null)}
                title={`إضافة كراتين جديدة للمخزن - ${restockProduct?.name}`}
                description={`تعبئة الكرتون: ${restockProduct?.units_per_box} قطعة لكل كرتون`}
            >
                {restockProduct && (
                    <form onSubmit={handleSubmitRestock} className="space-y-4 text-right" dir="rtl">
                        <div className="bg-muted/40 p-3 rounded-lg border border-border text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">الرصيد الحالي بالمخزن:</span>
                                <span className="font-bold text-foreground text-base">
                                    {formatCurrency(restockProduct.boxes_count)} كرتون
                                    {restockProduct.remaining_pieces > 0 && ` و ${formatCurrency(restockProduct.remaining_pieces)} قطعة`}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>إجمالي القطع الحالية:</span>
                                <span>{formatCurrency(restockProduct.total_pieces)} قطعة</span>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="add_boxes">كم كرتون تريد إضافته للمخزن؟ *</Label>
                            <Input
                                id="add_boxes"
                                type="number"
                                min="1"
                                placeholder="أدخل عدد الكراتين المضافة..."
                                value={restockForm.data.boxes}
                                onChange={(e) => restockForm.setData('boxes', e.target.value)}
                                required
                                autoFocus
                            />
                            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 mt-2 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                                💡 سيتم إضافة <strong>{formatCurrency((Number(restockForm.data.boxes) || 0) * restockProduct.units_per_box)} قطعة</strong> تلقائياً إلى المخزن ({restockForm.data.boxes || 0} كرتون × {restockProduct.units_per_box} تعبئة).
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">ملاحظات الشحنة (اختياري)</Label>
                            <Input
                                id="notes"
                                placeholder="مثال: وصول وجبة جديدة من المورد"
                                value={restockForm.data.notes}
                                onChange={(e) => restockForm.setData('notes', e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setRestockProduct(null)}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={restockForm.processing} className="bg-emerald-600 hover:bg-emerald-700 font-bold">
                                حفظ وإضافة الكراتين
                            </Button>
                        </div>
                    </form>
                )}
            </Dialog>
        </AuthenticatedLayout>
    );
}
