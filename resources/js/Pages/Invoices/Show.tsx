import { useState, useEffect } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Dialog } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/Components/ui/table';
import { PrintableInvoice } from '@/Components/PrintableInvoice';
import { PageProps } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
    Printer,
    ArrowRight,
    Building2,
    Calendar,
    User as UserIcon,
    MapPin,
    RotateCcw,
    Package,
    AlertCircle,
    Receipt,
    DollarSign,
    Boxes,
} from 'lucide-react';

interface InvoiceItem {
    id: number;
    product_name: string;
    boxes: number;
    units_per_box: number;
    total_pieces: number;
    box_price: number;
    total_price: number;
}

interface Invoice {
    id: number;
    company_id: string;
    customer_id?: number | null;
    customer_name: string;
    customer_address?: string | null;
    invoice_number: string;
    type: 'sale' | 'purchase';
    status: 'active' | 'returned' | 'partially_returned';
    invoice_date: string;
    total_amount: number;
    returned_amount: number;
    user_name: string;
    created_at: string;
    items: InvoiceItem[];
}

interface InvoiceShowProps {
    invoice: Invoice;
}

export default function InvoiceShow({ invoice }: InvoiceShowProps) {
    const pageProps = usePage<PageProps & { flash?: { auto_print?: boolean } }>().props;
    const { activeCompany, flash } = pageProps;
    const companyName = activeCompany?.name || 'دلال دجلة';

    // Partial Item Return Modal State
    const [returningItem, setReturningItem] = useState<InvoiceItem | null>(null);

    const returnItemForm = useForm({
        invoice_item_id: 0,
        boxes_to_return: 1,
        notes: '',
    });

    useEffect(() => {
        const isAutoPrint = flash?.auto_print || window.location.search.includes('print=1');
        if (isAutoPrint) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handlePrint = () => {
        window.print();
    };

    const handleReturnFullInvoice = () => {
        if (confirm(`هل أنت تأكد من استرجاع الفاتورة رقم #${invoice.invoice_number} بالكامل وإعادة البضاعة للمخزن؟`)) {
            router.post(`/invoices/${invoice.id}/return`);
        }
    };

    const handleOpenReturnItemModal = (item: InvoiceItem) => {
        setReturningItem(item);
        returnItemForm.setData({
            invoice_item_id: item.id,
            boxes_to_return: 1,
            notes: '',
        });
    };

    const handleSubmitReturnItem = (e: React.FormEvent) => {
        e.preventDefault();
        returnItemForm.post(`/invoices/${invoice.id}/return-item`, {
            onSuccess: () => {
                setReturningItem(null);
                returnItemForm.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout title={`فاتورة رقم #${invoice.invoice_number}`}>
            <Head title={`فاتورة #${invoice.invoice_number} - ${companyName}`} />

            {/* Screen View Container (Hidden during Print) */}
            <div className="space-y-6 print:hidden" dir="rtl">
                {/* Header - Matching All Other Pages */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-5 w-5 text-primary" />
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                شركة {companyName}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Receipt className="h-6 w-6 text-primary" />
                            معاينة الفاتورة رقم #{invoice.invoice_number}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            تفاصيل الفاتورة، البضائع المخصومة من المخزن، والعميل المسجل
                        </p>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                        <Link href="/invoices">
                            <Button variant="outline" className="gap-2 shrink-0 border-border">
                                <ArrowRight className="h-4 w-4" />
                                الفواتير
                            </Button>
                        </Link>

                        {invoice.customer_id && (
                            <Link href={`/customers/${invoice.customer_id}`}>
                                <Button variant="secondary" className="gap-2 shrink-0">
                                    <UserIcon className="h-4 w-4 text-primary" />
                                    تتبع العميل
                                </Button>
                            </Link>
                        )}

                        {invoice.status !== 'returned' && (
                            <Button
                                variant="outline"
                                onClick={handleReturnFullInvoice}
                                className="gap-2 shrink-0 border-amber-300 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 font-bold"
                            >
                                <RotateCcw className="h-4 w-4" />
                                استرجاع كامل
                            </Button>
                        )}

                        <Button onClick={handlePrint} className="gap-2 shrink-0 bg-primary font-bold">
                            <Printer className="h-4 w-4" />
                            طباعة الفاتورة
                        </Button>
                    </div>
                </div>

                {/* Alerts */}
                {invoice.status === 'returned' && (
                    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm font-bold flex items-center gap-2 print:hidden">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>تم استرجاع هذه الفاتورة بالكامل وإعادة كافة الكراتين والمنتجات إلى رصيد المخزن.</span>
                    </div>
                )}
                {invoice.status === 'partially_returned' && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-4 rounded-xl text-amber-800 dark:text-amber-300 text-sm font-bold flex items-center justify-between print:hidden">
                        <div className="flex items-center gap-2">
                            <RotateCcw className="h-5 w-5 shrink-0" />
                            <span>تم إجراء استرجاع جزئي على هذه الفاتورة بمبلغ {formatCurrency(invoice.returned_amount)} د.ع</span>
                        </div>
                    </div>
                )}

                {/* Stats / Quick Meta Bar (Matching Other Pages Grid) */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                اسم العميل
                            </CardTitle>
                            <UserIcon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-foreground truncate">{invoice.customer_name}</div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                {invoice.customer_address || 'بدون عنوان مدون'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                نوع الفاتورة والحالة
                            </CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                {invoice.type === 'sale' ? (
                                    <Badge variant="success" className="font-bold">فاتورة بيع</Badge>
                                ) : (
                                    <Badge variant="info" className="font-bold">فاتورة شراء</Badge>
                                )}
                                <Badge variant={invoice.status === 'returned' ? 'destructive' : (invoice.status === 'partially_returned' ? 'warning' : 'outline')}>
                                    {invoice.status === 'returned' ? 'مسترجعة' : (invoice.status === 'partially_returned' ? 'مسترجعة جزئياً' : 'نشطة')}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">تاريخ: {invoice.invoice_date}</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                عدد أصناف البضائع
                            </CardTitle>
                            <Boxes className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(invoice.items.length)}</div>
                            <p className="text-xs text-muted-foreground mt-1">صنف مسجل في الفاتورة</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                مبلغ القائمة النهائي
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {formatCurrency(invoice.total_amount)} <span className="text-xs font-normal">د.ع</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">المبلغ الإجمالي للفاتورة</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Card (Matching Warehouse & Invoices Container) */}
                <Card className="overflow-hidden border-border">
                    <CardHeader className="bg-muted/40 border-b border-border py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                جدول تفاصيل البضائع المسجلة بالفاتورة
                            </CardTitle>
                            <span className="text-xs text-muted-foreground font-mono">
                                #{invoice.invoice_number}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Desktop View: Pure Shadcn Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/60">
                                        <TableHead className="w-12 pr-6">ت</TableHead>
                                        <TableHead>اسم المنتج</TableHead>
                                        <TableHead>الكراتين</TableHead>
                                        <TableHead>التعبئة</TableHead>
                                        <TableHead>إجمالي القطع</TableHead>
                                        <TableHead>سعر القطعة</TableHead>
                                        <TableHead>الإجمالي</TableHead>
                                        <TableHead className="pl-6 text-center print:hidden">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.items.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="pr-6 font-mono text-xs font-bold text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="font-bold text-foreground">
                                                {item.product_name}
                                            </TableCell>
                                            <TableCell className="font-bold text-emerald-700 dark:text-emerald-400">
                                                {formatCurrency(item.boxes)} كرتون
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-semibold text-xs">
                                                    {formatCurrency(item.units_per_box)} قطعة / كرتون
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold text-blue-600 dark:text-blue-400">
                                                {formatCurrency(item.total_pieces)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(Math.round(item.box_price / (item.units_per_box || 1)))} د.ع
                                            </TableCell>
                                            <TableCell className="font-bold text-primary text-base">
                                                {formatCurrency(item.total_price)} د.ع
                                            </TableCell>
                                            <TableCell className="pl-6 text-center print:hidden">
                                                {invoice.status !== 'returned' && (
                                                    <Button
                                                        size="xs"
                                                        variant="outline"
                                                        className="gap-1 border-border"
                                                        onClick={() => handleOpenReturnItemModal(item)}
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                                                        <span>استرجاع</span>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View: Clean Card List */}
                        <div className="block md:hidden divide-y divide-border p-3 space-y-3">
                            {invoice.items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-xs font-mono font-bold text-muted-foreground">
                                                    #{index + 1}
                                                </span>
                                                <h5 className="font-bold text-foreground text-sm">{item.product_name}</h5>
                                            </div>
                                            <span className="text-xs text-muted-foreground block">
                                                التعبئة: {formatCurrency(item.units_per_box)} قطعة لكل كرتون
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="shrink-0 text-xs">
                                            {formatCurrency(Math.round(item.box_price / (item.units_per_box || 1)))} د.ع / قطعة
                                        </Badge>
                                    </div>

                                    <div className="bg-muted/30 p-2.5 rounded-lg border border-border/50 flex items-center justify-between text-xs">
                                        <div>
                                            <span className="text-muted-foreground block text-[11px]">الكمية بالكراتين:</span>
                                            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                                                {formatCurrency(item.boxes)} كرتون
                                            </span>
                                        </div>

                                        <div className="text-left">
                                            <span className="text-muted-foreground block text-[11px]">إجمالي القطع:</span>
                                            <span className="font-bold text-blue-600 text-sm">
                                                {formatCurrency(item.total_pieces)} قطعة
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div>
                                            <span className="text-[11px] text-muted-foreground block">الإجمالي:</span>
                                            <span className="font-bold text-primary text-base">
                                                {formatCurrency(item.total_price)} <span className="text-xs font-normal">د.ع</span>
                                            </span>
                                        </div>

                                        {invoice.status !== 'returned' && (
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                className="gap-1 border-border"
                                                onClick={() => handleOpenReturnItemModal(item)}
                                            >
                                                <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                                                <span>استرجاع</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Grand Total Summary Footer Bar */}
                        <div className="p-4 bg-muted/40 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-xs text-muted-foreground">
                                المحرر: {invoice.user_name} | التوثيق إلكتروني لمخزن شركة {companyName}
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                {invoice.returned_amount > 0 && (
                                    <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                                        المسترجع: {formatCurrency(invoice.returned_amount)} د.ع
                                    </span>
                                )}

                                <div className="flex items-center gap-3 bg-card px-4 py-2.5 rounded-xl border border-border shadow-sm">
                                    <span className="text-sm font-bold text-muted-foreground">مبلغ الفاتورة النهائي:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {formatCurrency(invoice.total_amount)} <span className="text-xs font-normal text-muted-foreground">د.ع</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Printable Document (Matches 100% of attached photos!) */}
            <PrintableInvoice invoice={invoice} />

            {/* Modal: Return Specific Item / Boxes */}
            <Dialog
                open={!!returningItem}
                onClose={() => setReturningItem(null)}
                title={`استرجاع مادة: ${returningItem?.product_name}`}
                description={`الكمية المتوفرة: ${returningItem?.boxes} كرتون بسعر ${formatCurrency(returningItem?.box_price || 0)} د.ع / كرتون`}
            >
                {returningItem && (
                    <form onSubmit={handleSubmitReturnItem} className="space-y-4 text-right" dir="rtl">
                        <div>
                            <Label htmlFor="boxes_to_return">عدد الكراتين المراد استرجاعها للمخزن *</Label>
                            <Input
                                id="boxes_to_return"
                                type="number"
                                min="1"
                                max={returningItem.boxes}
                                value={returnItemForm.data.boxes_to_return}
                                onChange={(e) => returnItemForm.setData('boxes_to_return', parseInt(e.target.value) || 1)}
                                required
                                autoFocus
                            />
                            <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 mt-2 rounded-lg border border-amber-200 text-xs text-amber-800 dark:text-amber-300 font-medium">
                                💡 سيتم إعادة <strong>{formatCurrency(returnItemForm.data.boxes_to_return * returningItem.units_per_box)} قطعة</strong> للمخزن وخصم <strong>{formatCurrency(returnItemForm.data.boxes_to_return * returningItem.box_price)} د.ع</strong> من الفاتورة.
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">ملاحظات / سبب الاسترجاع (اختياري)</Label>
                            <Input
                                id="notes"
                                placeholder="مثال: تلف بالكرتون"
                                value={returnItemForm.data.notes}
                                onChange={(e) => returnItemForm.setData('notes', e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setReturningItem(null)}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={returnItemForm.processing} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                                تأكيد الاسترجاع
                            </Button>
                        </div>
                    </form>
                )}
            </Dialog>
        </AuthenticatedLayout>
    );
}
