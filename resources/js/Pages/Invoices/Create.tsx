import { useState, useMemo, useEffect } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Combobox, ComboboxOption } from '@/Components/ui/combobox';
import { PrintableInvoice } from '@/Components/PrintableInvoice';
import { PageProps } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
    Receipt,
    Plus,
    Trash2,
    ArrowRight,
    Building2,
    UserCheck,
    Calendar,
    Package,
    ArrowUpRight,
    ArrowDownLeft,
    User as UserIcon,
    Printer,
    FilePlus2,
    CheckCircle2,
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    units_per_box: number;
    boxes_count: number;
    remaining_pieces: number;
    total_pieces: number;
    purchase_price?: number | null;
    sale_price: number;
}

interface Customer {
    id: number;
    name: string;
    address?: string | null;
}

interface InvoiceCreateProps {
    products: Product[];
    customers: Customer[];
    suggestedInvoiceNumber: string;
    todayDate: string;
}

interface RowItem {
    product_id: number | '';
    product_name: string;
    boxes: number;
    units_per_box: number;
    total_pieces: number;
    piece_price?: number;
    box_price: number;
    total_price: number;
}

export default function InvoiceCreate({
    products,
    customers,
    suggestedInvoiceNumber,
    todayDate,
}: InvoiceCreateProps) {
    const pageProps = usePage<PageProps & { flash?: { auto_print_invoice?: any; success?: string } }>().props;
    const { activeCompany, flash } = pageProps;
    const companyName = activeCompany?.name || 'دلال دجلة';

    // Track newly added row index for auto focus
    const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);

    // Form
    const form = useForm({
        customer_name: '',
        customer_address: '',
        invoice_number: suggestedInvoiceNumber,
        type: 'sale' as 'sale' | 'purchase',
        invoice_date: todayDate,
        action: 'save_only' as 'save_only' | 'save_and_new' | 'save_and_print',
        items: [
            {
                product_id: '' as number | '',
                product_name: '',
                boxes: 1,
                units_per_box: 1,
                total_pieces: 1,
                piece_price: 0,
                box_price: 0,
                total_price: 0,
            },
        ] as RowItem[],
    });

    // Reset Form Fields and Update Suggested Invoice Number on Successful Save / Redirect
    useEffect(() => {
        if (flash?.success || flash?.auto_print_invoice) {
            form.setData({
                customer_name: '',
                customer_address: '',
                invoice_number: suggestedInvoiceNumber,
                type: form.data.type,
                invoice_date: todayDate,
                action: 'save_only',
                items: [
                    {
                        product_id: '',
                        product_name: '',
                        boxes: 1,
                        units_per_box: 1,
                        total_pieces: 1,
                        piece_price: 0,
                        box_price: 0,
                        total_price: 0,
                    },
                ],
            });
            setFocusedRowIndex(0);
        }
    }, [suggestedInvoiceNumber, flash?.success, flash?.auto_print_invoice]);

    // Instant POS Auto-Print without leaving the Create Page
    useEffect(() => {
        if (flash?.auto_print_invoice) {
            const timer = setTimeout(() => {
                window.print();
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [flash?.auto_print_invoice]);

    // Format Customers for Combobox
    const customerOptions: ComboboxOption[] = useMemo(() => {
        return customers.map((c) => ({
            id: c.id,
            label: c.name,
            sublabel: c.address || undefined,
            badge: 'عميل مسجل',
            badgeVariant: 'outline',
        }));
    }, [customers]);

    // Format Products for Combobox
    const productOptions: ComboboxOption[] = useMemo(() => {
        return products.map((p) => {
            const unitsPerBox = Math.max(1, p.units_per_box || 1);
            const basePiecePrice = form.data.type === 'purchase' && p.purchase_price
                ? Number(p.purchase_price)
                : Number(p.sale_price);
            const boxPrice = Math.round(basePiecePrice * unitsPerBox);

            return {
                id: p.id,
                label: p.name,
                sublabel: `سعر القطعة: ${formatCurrency(basePiecePrice)} د.ع | سعر الكرتون (${formatCurrency(unitsPerBox)} قطعة): ${formatCurrency(boxPrice)} د.ع`,
                badge: `المخزن: ${formatCurrency(p.boxes_count)} كرتون`,
                badgeVariant: p.boxes_count > 0 ? 'success' : 'destructive',
            };
        });
    }, [products, form.data.type]);

    // Helper to calculate piece price from product
    const getProductPiecePrice = (product: Product, type: 'sale' | 'purchase') => {
        return type === 'purchase' && product.purchase_price
            ? Number(product.purchase_price)
            : Number(product.sale_price);
    };

    // Customer Selection Change
    const handleCustomerSelect = (customerName: string, option?: ComboboxOption) => {
        form.setData('customer_name', customerName);
        const existing = customers.find((c) => (option && c.id === option.id) || c.name.trim() === customerName.trim());
        if (existing) {
            form.setData('customer_address', existing.address || '');
        }
    };

    // Row Product Combobox Change
    const handleProductSelect = (index: number, productName: string, option?: ComboboxOption) => {
        const updatedItems = [...form.data.items];

        let matchedProduct: Product | undefined;

        if (option) {
            matchedProduct = products.find((p) => p.id === option.id || p.id.toString() === option.id.toString());
        } else if (productName.trim()) {
            const cleanName = productName.trim().toLowerCase();
            matchedProduct = products.find((p) => p.name.trim().toLowerCase() === cleanName);
        }

        if (matchedProduct) {
            const unitsPerBox = maxOne(matchedProduct.units_per_box);
            const piecePrice = getProductPiecePrice(matchedProduct, form.data.type);
            const boxPrice = Math.round(piecePrice * unitsPerBox);
            const boxes = updatedItems[index]?.boxes || 1;
            const totalPieces = boxes * unitsPerBox;
            const totalPrice = boxes * boxPrice;

            updatedItems[index] = {
                product_id: matchedProduct.id,
                product_name: matchedProduct.name,
                boxes: boxes,
                units_per_box: unitsPerBox,
                total_pieces: totalPieces,
                piece_price: piecePrice,
                box_price: boxPrice,
                total_price: totalPrice,
            };

            form.clearErrors(`items.${index}.product_id` as keyof typeof form.errors);
        } else {
            updatedItems[index] = {
                ...updatedItems[index],
                product_name: productName,
                product_id: '',
            };
        }

        form.setData('items', updatedItems);
    };

    // Invoice Type Toggle
    const handleTypeToggle = (newType: 'sale' | 'purchase') => {
        form.setData('type', newType);

        const updatedItems = form.data.items.map((row) => {
            if (row.product_id) {
                const product = products.find((p) => p.id === row.product_id);
                if (product) {
                    const piecePrice = getProductPiecePrice(product, newType);
                    const boxPrice = Math.round(piecePrice * row.units_per_box);
                    return {
                        ...row,
                        piece_price: piecePrice,
                        box_price: boxPrice,
                        total_price: row.boxes * boxPrice,
                    };
                }
            }
            return row;
        });

        form.setData('items', updatedItems);
    };

    // Row Boxes Change
    const handleBoxesChange = (index: number, boxes: number) => {
        const validBoxes = Math.max(1, boxes);
        const updatedItems = [...form.data.items];
        const item = updatedItems[index];

        const totalPieces = validBoxes * (item.units_per_box || 1);
        const totalPrice = validBoxes * (item.box_price || 0);

        updatedItems[index] = {
            ...item,
            boxes: validBoxes,
            total_pieces: totalPieces,
            total_price: totalPrice,
        };

        form.setData('items', updatedItems);
    };

    // Row Piece Price Change
    const handlePiecePriceChange = (index: number, price: number) => {
        const validPiecePrice = Math.max(0, price);
        const updatedItems = [...form.data.items];
        const item = updatedItems[index];

        const unitsPerBox = maxOne(item.units_per_box);
        const boxPrice = Math.round(validPiecePrice * unitsPerBox);
        const totalPrice = (item.boxes || 1) * boxPrice;

        updatedItems[index] = {
            ...item,
            piece_price: validPiecePrice,
            box_price: boxPrice,
            total_price: totalPrice,
        };

        form.setData('items', updatedItems);
    };

    // Row Box Price Change
    const handleBoxPriceChange = (index: number, price: number) => {
        const validBoxPrice = Math.max(0, price);
        const updatedItems = [...form.data.items];
        const item = updatedItems[index];

        const unitsPerBox = maxOne(item.units_per_box);
        const piecePrice = Math.round((validBoxPrice / unitsPerBox) * 100) / 100;
        const totalPrice = (item.boxes || 1) * validBoxPrice;

        updatedItems[index] = {
            ...item,
            piece_price: piecePrice,
            box_price: validBoxPrice,
            total_price: totalPrice,
        };

        form.setData('items', updatedItems);
    };

    // Add New Row & Auto-Focus Its Product Input
    const handleAddRow = () => {
        const newIndex = form.data.items.length;
        form.setData('items', [
            ...form.data.items,
            {
                product_id: '',
                product_name: '',
                boxes: 1,
                units_per_box: 1,
                total_pieces: 1,
                piece_price: 0,
                box_price: 0,
                total_price: 0,
            },
        ]);
        setFocusedRowIndex(newIndex);
    };

    // Remove Row
    const handleRemoveRow = (index: number) => {
        if (form.data.items.length === 1) return;
        const updatedItems = form.data.items.filter((_, i) => i !== index);
        form.setData('items', updatedItems);
        if (focusedRowIndex === index) {
            setFocusedRowIndex(null);
        }
    };

    // Helper min 1
    function maxOne(num: number) {
        return Math.max(1, num || 1);
    }

    // Grand Total Invoice Amount
    const grandTotal = useMemo(() => {
        return form.data.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    }, [form.data.items]);

    // Submit Handlers for Save & New vs Save & Print
    const handleSaveAndNew = (e: React.MouseEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            action: 'save_and_new',
        }));
        form.post('/invoices');
    };

    const handleSaveAndPrint = (e: React.MouseEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            action: 'save_and_print',
        }));
        form.post('/invoices');
    };

    const handleStandardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            action: 'save_only',
        }));
        form.post('/invoices');
    };

    return (
        <AuthenticatedLayout title="إنشاء فاتورة جديدة">
            <Head title={`إنشاء فاتورة جديدة - ${companyName}`} />

            {/* Main Interactive Create Form (Hidden during Browser Print) */}
            <form onSubmit={handleStandardSubmit} className="print:hidden space-y-6" dir="rtl">
                {/* Clean Header with Back Button Only */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                شركة {companyName}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            إنشاء فاتورة جديدة
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            أدخل معلومات العميل والمنتجات وسيتم ترحيل المخزن تلقائياً
                        </p>
                    </div>

                    <Link href="/invoices">
                        <Button variant="outline" type="button" className="gap-2 shrink-0 border-border">
                            <ArrowRight className="h-4 w-4" />
                            <span>عودة</span>
                        </Button>
                    </Link>
                </div>

                {/* Flash Success Notification Alert */}
                {flash?.success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Invoice Header Details Card */}
                <Card className="border-border">
                    <CardHeader className="bg-muted/30 border-b border-border py-3.5">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-primary" />
                            معلومات الفاتورة والعميل
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {/* Invoice Type */}
                            <div>
                                <Label htmlFor="invoice-type" className="font-bold">نوع الفاتورة *</Label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleTypeToggle('sale')}
                                        className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-bold transition-all ${
                                            form.data.type === 'sale'
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                : 'bg-card text-muted-foreground border-border hover:bg-muted'
                                        }`}
                                    >
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                        فاتورة بيع
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleTypeToggle('purchase')}
                                        className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-bold transition-all ${
                                            form.data.type === 'purchase'
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-card text-muted-foreground border-border hover:bg-muted'
                                        }`}
                                    >
                                        <ArrowDownLeft className="h-3.5 w-3.5" />
                                        فاتورة شراء
                                    </button>
                                </div>
                            </div>

                            {/* Invoice Number */}
                            <div>
                                <Label htmlFor="invoice_number" className="font-bold">رقم الفاتورة *</Label>
                                <Input
                                    id="invoice_number"
                                    value={form.data.invoice_number}
                                    onChange={(e) => form.setData('invoice_number', e.target.value)}
                                    className="mt-1 font-mono font-bold"
                                    required
                                />
                            </div>

                            {/* Invoice Date */}
                            <div>
                                <Label htmlFor="invoice_date" className="font-bold">تاريخ الفاتورة *</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="invoice_date"
                                        type="date"
                                        value={form.data.invoice_date}
                                        onChange={(e) => form.setData('invoice_date', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Customer Select / Searchable Shadcn Combobox */}
                            <div>
                                <Label htmlFor="customer_name" className="font-bold">اسم العميل *</Label>
                                <div className="space-y-1 mt-1">
                                    <Combobox
                                        options={customerOptions}
                                        value={form.data.customer_name}
                                        onChange={handleCustomerSelect}
                                        placeholder="ابحث باسم العميل أو اكتب اسماً جديداً..."
                                        icon={<UserIcon className="h-3.5 w-3.5" />}
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        💡 ابحث في قائمة العملاء أو اكتب اسم عميل جديد ليُحفظ تلقائياً
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Address */}
                        <div>
                            <Label htmlFor="customer_address">عنوان العميل (اختياري)</Label>
                            <Input
                                id="customer_address"
                                placeholder="مثال: بغداد - حي الجامعة"
                                value={form.data.customer_address}
                                onChange={(e) => form.setData('customer_address', e.target.value)}
                                className="mt-1 max-w-xl"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice Items Container Card */}
                <Card className="border-border overflow-hidden">
                    <CardHeader className="bg-muted/40 border-b border-border py-3.5 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            جدول منتجات الفاتورة ({form.data.items.length} صنف)
                        </CardTitle>
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={handleAddRow}
                            className="gap-1.5 font-bold shrink-0"
                        >
                            <Plus className="h-4 w-4" />
                            <span>إضافة سطر منتج</span>
                        </Button>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Desktop View: Pure Shadcn Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-right border-collapse">
                                <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground border-b border-border">
                                    <tr>
                                        <th className="p-3 w-12 text-center">ت</th>
                                        <th className="p-3 min-w-[280px]">اسم المنتج</th>
                                        <th className="p-3 w-28 text-center">الكارتون</th>
                                        <th className="p-3 w-24 text-center">التعبئة</th>
                                        <th className="p-3 w-28 text-center">العدد الكلي</th>
                                        <th className="p-3 w-36 text-center">السعر</th>
                                        <th className="p-3 w-40 text-center">الإجمالي</th>
                                        <th className="p-3 w-12 text-center">حذف</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {form.data.items.map((row, index) => (
                                        <tr key={index} className="hover:bg-muted/20 transition-colors">
                                            {/* التسلسل */}
                                            <td className="p-3 text-center font-bold text-muted-foreground font-mono">
                                                {index + 1}
                                            </td>

                                            {/* اسم المنتج */}
                                            <td className="p-3">
                                                <Combobox
                                                    options={productOptions}
                                                    value={row.product_name}
                                                    onChange={(val, opt) => handleProductSelect(index, val, opt)}
                                                    placeholder="ابحث عن اسم المنتج واضغط Enter للاختيار..."
                                                    icon={<Package className="h-3.5 w-3.5" />}
                                                    autoFocus={focusedRowIndex === index}
                                                />
                                                {form.errors[`items.${index}.product_id` as keyof typeof form.errors] && (
                                                    <p className="text-[11px] text-destructive font-semibold mt-1">
                                                        ⚠️ يرجى اختيار منتج صحيح من القائمة
                                                    </p>
                                                )}
                                            </td>

                                            {/* الكارتون */}
                                            <td className="p-3">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={row.boxes}
                                                    onChange={(e) => handleBoxesChange(index, parseInt(e.target.value) || 1)}
                                                    className="text-center font-bold h-9"
                                                    required
                                                />
                                            </td>

                                            {/* التعبئة */}
                                            <td className="p-3 text-center">
                                                <span className="inline-block px-2.5 py-1 rounded bg-secondary text-xs font-bold">
                                                    {formatCurrency(row.units_per_box)}
                                                </span>
                                            </td>

                                            {/* العدد (إجمالي القطع) */}
                                            <td className="p-3 text-center font-bold text-blue-600 dark:text-blue-400">
                                                {formatCurrency(row.total_pieces)} <span className="text-[11px] font-normal text-muted-foreground">قطعة</span>
                                            </td>

                                            {/* سعر القطعة الواحدة */}
                                            <td className="p-3">
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    min="0"
                                                    value={row.piece_price ?? (row.box_price / (row.units_per_box || 1))}
                                                    onChange={(e) => handlePiecePriceChange(index, parseFloat(e.target.value) || 0)}
                                                    className="text-center font-bold h-9"
                                                    required
                                                />
                                            </td>

                                            {/* الإجمالي */}
                                            <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400 text-base">
                                                {formatCurrency(row.total_price)} <span className="text-[11px] font-normal text-muted-foreground">د.ع</span>
                                            </td>

                                            {/* حذف السطر */}
                                            <td className="p-3 text-center">
                                                <Button
                                                    type="button"
                                                    size="icon-xs"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveRow(index)}
                                                    disabled={form.data.items.length === 1}
                                                    className="text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View: Ultra-Clean Mobile Responsive Product Item Cards */}
                        <div className="block md:hidden divide-y divide-border p-3 space-y-4">
                            {form.data.items.map((row, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3"
                                >
                                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                                سطر #{index + 1}
                                            </span>
                                            <span className="text-xs font-bold text-foreground">
                                                {row.product_name || 'منتج جديد'}
                                            </span>
                                        </div>

                                        <Button
                                            type="button"
                                            size="icon-xs"
                                            variant="ghost"
                                            onClick={() => handleRemoveRow(index)}
                                            disabled={form.data.items.length === 1}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Product Selector */}
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold">اسم المنتج *</Label>
                                        <Combobox
                                            options={productOptions}
                                            value={row.product_name}
                                            onChange={(val, opt) => handleProductSelect(index, val, opt)}
                                            placeholder="ابحث عن اسم المنتج..."
                                            icon={<Package className="h-3.5 w-3.5" />}
                                            autoFocus={focusedRowIndex === index}
                                        />
                                        {form.errors[`items.${index}.product_id` as keyof typeof form.errors] && (
                                            <p className="text-[11px] text-destructive font-semibold">
                                                ⚠️ يرجى اختيار منتج صحيح من القائمة
                                            </p>
                                        )}
                                    </div>

                                    {/* Boxes & Price Inputs */}
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div>
                                            <Label className="text-xs font-bold">عدد الكراتين *</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={row.boxes}
                                                onChange={(e) => handleBoxesChange(index, parseInt(e.target.value) || 1)}
                                                className="text-center font-bold h-9 mt-1"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs font-bold">سعر القطعة (د.ع) *</Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                min="0"
                                                value={row.piece_price ?? (row.box_price / (row.units_per_box || 1))}
                                                onChange={(e) => handlePiecePriceChange(index, parseFloat(e.target.value) || 0)}
                                                className="text-center font-bold h-9 mt-1"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Calculated Details Box */}
                                    <div className="bg-muted/40 p-3 rounded-lg border border-border/60 flex items-center justify-between text-xs pt-2">
                                        <div>
                                            <span className="text-muted-foreground block text-[11px]">إجمالي القطع:</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                                {formatCurrency(row.total_pieces)} قطعة ({formatCurrency(row.units_per_box)} / كرتون)
                                            </span>
                                        </div>

                                        <div className="text-left">
                                            <span className="text-muted-foreground block text-[11px]">مبلغ السطر:</span>
                                            <span className="font-bold text-emerald-600 text-sm">
                                                {formatCurrency(row.total_price)} د.ع
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Grand Total Summary Box */}
                        <div className="bg-muted/40 border-t border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddRow}
                                className="gap-2 w-full sm:w-auto border-border font-bold"
                            >
                                <Plus className="h-4 w-4 text-primary" />
                                إضافة سطر منتج آخر
                            </Button>

                            <div className="flex items-center gap-3 bg-card px-4 py-2.5 rounded-xl border border-border shadow-sm w-full sm:w-auto justify-between sm:justify-end">
                                <span className="text-sm font-bold text-muted-foreground">مبلغ القائمة الإجمالي:</span>
                                <span className="text-2xl font-bold text-primary">
                                    {formatCurrency(grandTotal)} <span className="text-sm font-normal text-muted-foreground">د.ع</span>
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Submit Action Buttons (ONLY HERE!) */}
                <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
                    <Link href="/invoices" className="w-full sm:w-auto">
                        <Button variant="outline" type="button" className="w-full sm:w-auto border-border">
                            إلغاء
                        </Button>
                    </Link>

                    <Button
                        type="button"
                        onClick={handleSaveAndNew}
                        disabled={form.processing}
                        className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                        <FilePlus2 className="h-4 w-4" />
                        حفظ وبدء فاتورة جديدة
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSaveAndPrint}
                        disabled={form.processing}
                        className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6"
                    >
                        <Printer className="h-4 w-4" />
                        حفظ وطباعة الفاتورة
                    </Button>
                </div>
            </form>

            {/* Hidden Printable Invoice Document (Matches 100% of attached photos!) */}
            {flash?.auto_print_invoice && (
                <PrintableInvoice invoice={flash.auto_print_invoice} />
            )}
        </AuthenticatedLayout>
    );
}
