import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from '@/Components/ui/table';
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
    Receipt,
    Plus,
    Search,
    Eye,
    Trash2,
    Building2,
    Calendar,
    User as UserIcon,
    ArrowDownLeft,
    ArrowUpRight,
    DollarSign,
    RotateCcw,
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
    items?: InvoiceItem[];
}

interface PaginatedInvoices {
    data: Invoice[];
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

interface InvoicesIndexProps {
    invoices: PaginatedInvoices;
    filters?: {
        search?: string;
        type?: string;
    };
    stats?: {
        total_sales_count: number;
        total_purchases_count: number;
        total_sales_amount: number;
        total_purchases_amount: number;
    };
}

export default function InvoicesIndex({ invoices, filters, stats }: InvoicesIndexProps) {
    const { activeCompany } = usePage<PageProps>().props;
    const companyName = activeCompany?.name || 'دلال دجلة';

    const [search, setSearch] = useState(filters?.search || '');
    const [selectedType, setSelectedType] = useState(filters?.type || 'all');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/invoices', { search, type: selectedType }, { preserveState: true });
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        router.get('/invoices', { search, type }, { preserveState: true });
    };

    const handleDelete = (invoice: Invoice) => {
        if (confirm(`هل أنت تأكد من حذف الفاتورة رقم "${invoice.invoice_number}"؟`)) {
            router.delete(`/invoices/${invoice.id}`);
        }
    };

    const invoiceList = invoices.data || [];

    // Clean Pagination Links Handling
    const prevLink = invoices.links && invoices.links.length > 0 ? invoices.links[0] : null;
    const nextLink = invoices.links && invoices.links.length > 0 ? invoices.links[invoices.links.length - 1] : null;
    const pageNumberLinks = invoices.links && invoices.links.length > 2 ? invoices.links.slice(1, -1) : [];

    return (
        <AuthenticatedLayout title="إدارة الفواتير">
            <Head title={`الفواتير - ${companyName}`} />

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
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Receipt className="h-6 w-6 text-primary" />
                            فواتير شركة {companyName}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            متابعة فواتير البيع والشراء والربط مع العملاء والمخزن
                        </p>
                    </div>
                    <Link href="/invoices/create">
                        <Button className="gap-2 shrink-0 bg-primary font-bold shadow-sm">
                            <Plus className="h-4 w-4" />
                            إنشاء فاتورة جديدة
                        </Button>
                    </Link>
                </div>

                {/* Stats Summary Bar */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                عدد فواتير البيع
                            </CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats?.total_sales_count || 0)}</div>
                            <p className="text-xs text-muted-foreground mt-1">فاتورة بيع صادرة</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                إجمالي مبيعات القوائم
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(stats?.total_sales_amount || 0)} <span className="text-xs font-normal">د.ع</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">المبلغ الكلي للمبيعات</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                عدد فواتير الشراء
                            </CardTitle>
                            <ArrowDownLeft className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats?.total_purchases_count || 0)}</div>
                            <p className="text-xs text-muted-foreground mt-1">فاتورة توريد/شراء</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                إجمالي مبالغ الشراء
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(stats?.total_purchases_amount || 0)} <span className="text-xs font-normal">د.ع</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">مبالغ البضائع المشتراة</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                            {/* Type Tabs */}
                            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border w-full sm:w-auto">
                                <Button
                                    size="sm"
                                    variant={selectedType === 'all' ? 'default' : 'ghost'}
                                    onClick={() => handleTypeChange('all')}
                                    className="text-xs flex-1 sm:flex-none"
                                >
                                    كافة الفواتير
                                </Button>
                                <Button
                                    size="sm"
                                    variant={selectedType === 'sale' ? 'default' : 'ghost'}
                                    onClick={() => handleTypeChange('sale')}
                                    className="text-xs flex-1 sm:flex-none gap-1"
                                >
                                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                                    بيع
                                </Button>
                                <Button
                                    size="sm"
                                    variant={selectedType === 'purchase' ? 'default' : 'ghost'}
                                    onClick={() => handleTypeChange('purchase')}
                                    className="text-xs flex-1 sm:flex-none gap-1"
                                >
                                    <ArrowDownLeft className="h-3.5 w-3.5 text-blue-500" />
                                    شراء
                                </Button>
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto flex-1 sm:max-w-md">
                                <div className="relative flex-1">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="البحث برقم الفاتورة أو العميل..."
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
                        </div>
                    </CardContent>
                </Card>

                {/* Invoices Desktop Table / Mobile Cards Container */}
                <Card className="overflow-hidden border-border/80 shadow-sm">
                    <CardHeader className="bg-muted/40 border-b border-border py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-primary" />
                                قائمة الفواتير ({invoices.total} فاتورة)
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                                عرض {invoices.from || 0} إلى {invoices.to || 0} من {invoices.total}
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {invoiceList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                                    <Receipt className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-1">لا توجد فواتير</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                    لم يتم إنشاء أي فاتورة لشركة {companyName} بعد.
                                </p>
                                <Link href="/invoices/create">
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        إنشاء أول فاتورة
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Desktop View: Styled Shadcn UI Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/70">
                                                <TableHead className="pr-6">رقم الفاتورة</TableHead>
                                                <TableHead>النوع</TableHead>
                                                <TableHead>الحالة</TableHead>
                                                <TableHead>اسم العميل</TableHead>
                                                <TableHead>تاريخ الفاتورة</TableHead>
                                                <TableHead>مبلغ القائمة</TableHead>
                                                <TableHead className="pl-6 text-center">الإجراءات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoiceList.map((invoice) => (
                                                <TableRow key={invoice.id}>
                                                    <TableCell className="pr-6 font-mono font-bold text-foreground">
                                                        #{invoice.invoice_number}
                                                    </TableCell>
                                                    <TableCell>
                                                        {invoice.type === 'sale' ? (
                                                            <Badge variant="success" className="gap-1 font-bold">
                                                                <ArrowUpRight className="h-3 w-3" />
                                                                بيع
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="info" className="gap-1 font-bold">
                                                                <ArrowDownLeft className="h-3 w-3" />
                                                                شراء
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {invoice.status === 'returned' && (
                                                            <Badge variant="destructive">مسترجعة بالكامل</Badge>
                                                        )}
                                                        {invoice.status === 'partially_returned' && (
                                                            <Badge variant="warning">مسترجعة جزئياً</Badge>
                                                        )}
                                                        {invoice.status === 'active' && (
                                                            <Badge variant="outline">نشطة</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-foreground">
                                                        {invoice.customer_id ? (
                                                            <Link href={`/customers/${invoice.customer_id}`} className="hover:text-primary transition-colors">
                                                                {invoice.customer_name}
                                                            </Link>
                                                        ) : (
                                                            <span>{invoice.customer_name}</span>
                                                        )}
                                                        {invoice.customer_address && (
                                                            <span className="text-xs font-normal text-muted-foreground block">
                                                                {invoice.customer_address}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span>{invoice.invoice_date}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-primary text-base">
                                                        {formatCurrency(invoice.total_amount)} <span className="text-xs font-normal text-muted-foreground">د.ع</span>
                                                    </TableCell>
                                                    <TableCell className="pl-6">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <Link href={`/invoices/${invoice.id}`}>
                                                                <Button
                                                                    size="xs"
                                                                    variant="outline"
                                                                    className="gap-1 border-border"
                                                                    title="عرض وطباعة الفاتورة"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5 text-primary" />
                                                                    <span>معاينة</span>
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                size="icon-xs"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(invoice)}
                                                                title="حذف الفاتورة"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile View: Ultra Clean Mobile Responsive Cards */}
                                <div className="block md:hidden divide-y divide-border p-3 space-y-3">
                                    {invoiceList.map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-foreground text-sm">
                                                        #{invoice.invoice_number}
                                                    </span>
                                                    {invoice.type === 'sale' ? (
                                                        <Badge variant="success" className="text-[11px]">بيع</Badge>
                                                    ) : (
                                                        <Badge variant="info" className="text-[11px]">شراء</Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {invoice.invoice_date}
                                                </span>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-foreground text-base">{invoice.customer_name}</h4>
                                                {invoice.customer_address && (
                                                    <p className="text-xs text-muted-foreground">{invoice.customer_address}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-lg border border-border/50">
                                                <span className="text-xs text-muted-foreground">مبلغ القائمة:</span>
                                                <span className="font-extrabold text-primary text-base">
                                                    {formatCurrency(invoice.total_amount)} <span className="text-xs font-normal">د.ع</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-border/60 gap-2">
                                                <div className="flex items-center gap-1">
                                                    {invoice.status === 'returned' && (
                                                        <Badge variant="destructive">مسترجعة</Badge>
                                                    )}
                                                    {invoice.status === 'partially_returned' && (
                                                        <Badge variant="warning">مسترجعة جزئياً</Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <Link href={`/invoices/${invoice.id}`}>
                                                        <Button size="xs" variant="outline" className="gap-1 border-border">
                                                            <Eye className="h-3.5 w-3.5 text-primary" />
                                                            <span>معاينة</span>
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="icon-xs"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(invoice)}
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

                {/* Pagination */}
                {invoices.last_page > 1 && (
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">
                            الصفحة {invoices.current_page} من أصل {invoices.last_page}
                        </span>

                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={prevLink?.url}
                                        disabled={!prevLink?.url}
                                    />
                                </PaginationItem>

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
        </AuthenticatedLayout>
    );
}
