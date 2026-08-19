import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
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
    ArrowRight,
    Building2,
    Calendar,
    User as UserIcon,
    Package,
    Boxes,
    Tag,
    History,
    TrendingUp,
} from 'lucide-react';

interface Movement {
    id: number;
    type: string;
    user_name: string;
    boxes_changed: number;
    pieces_changed: number;
    total_pieces_changed: number;
    total_pieces_after: number;
    notes?: string;
    created_at: string;
}

interface PaginatedMovements {
    data: Movement[];
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
}

interface ProductMovementsProps {
    product: Product;
    movements: PaginatedMovements;
}

export default function ProductMovements({ product, movements }: ProductMovementsProps) {
    const { activeCompany } = usePage<PageProps>().props;
    const companyName = activeCompany?.name || 'دلال دجلة';

    const getMovementBadge = (type: string) => {
        switch (type) {
            case 'initial':
                return <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full font-bold">إنشاء جديد</span>;
            case 'add_stock':
                return <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs px-2.5 py-1 rounded-full font-bold">إضافة مخزون</span>;
            case 'sale':
                return <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs px-2.5 py-1 rounded-full font-bold">بيع</span>;
            default:
                return <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-xs px-2.5 py-1 rounded-full font-bold">تعديل</span>;
        }
    };

    // Clean Pagination Links Handling
    const prevLink = movements.links && movements.links.length > 0 ? movements.links[0] : null;
    const nextLink = movements.links && movements.links.length > 0 ? movements.links[movements.links.length - 1] : null;
    const pageNumberLinks = movements.links && movements.links.length > 2 ? movements.links.slice(1, -1) : [];

    return (
        <AuthenticatedLayout title={`سجل حركة ${product.name}`}>
            <Head title={`سجل حركة ${product.name} - ${companyName}`} />

            <div className="space-y-6" dir="rtl">
                {/* Header with Back Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                شركة {companyName}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <History className="h-6 w-6 text-primary" />
                            سجل حركة المنتج: {product.name}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            سجل تتبع الشحنات، البيع، والمستخدمين المسؤولين عن الحركة
                        </p>
                    </div>

                    <Link href="/warehouse">
                        <Button variant="outline" className="gap-2 shrink-0 border-border">
                            <ArrowRight className="h-4 w-4" />
                            العودة لمخزن {companyName}
                        </Button>
                    </Link>
                </div>

                {/* Product Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-1 pt-4">
                            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Boxes className="h-3.5 w-3.5 text-primary" />
                                التعبئة بالكرتون
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="text-xl font-bold text-foreground">
                                {formatCurrency(product.units_per_box)} <span className="text-xs font-normal">قطعة / كرتون</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="pb-1 pt-4">
                            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5 text-emerald-600" />
                                الرصيد الحالي بالمخزن
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="text-xl font-bold text-emerald-600">
                                {formatCurrency(product.boxes_count)} <span className="text-xs font-normal">كرتون</span>
                                {product.remaining_pieces > 0 && ` و ${formatCurrency(product.remaining_pieces)} قطعة`}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">إجمالي: {formatCurrency(product.total_pieces)} قطعة</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="pb-1 pt-4">
                            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                                سعر الشراء
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="text-xl font-bold text-foreground">
                                {product.purchase_price ? `${formatCurrency(product.purchase_price)} د.ع` : 'غير محدد'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader className="pb-1 pt-4">
                            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                                سعر البيع
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="text-xl font-bold text-primary">
                                {formatCurrency(product.sale_price)} <span className="text-xs font-normal">د.ع</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Movements List Container */}
                <Card className="overflow-hidden border-border">
                    <CardHeader className="bg-muted/40 border-b border-border py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <History className="h-4 w-4 text-primary" />
                                سجل تتبع الحركات ({movements.total} حركة مسجلة)
                            </CardTitle>
                            {movements.total > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    عرض {movements.from} إلى {movements.to} من أصل {movements.total}
                                </span>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {movements.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <History className="h-12 w-12 text-muted-foreground/30 mb-3" />
                                <h3 className="text-base font-bold mb-1">لا يوجد سجل حركات حتى الآن</h3>
                                <p className="text-sm text-muted-foreground">
                                    لم يتم تسجيل أي شحنات أو حركات بيع لهذا المنتج بعد.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop View: Full Data Grid Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm text-right border-collapse">
                                        <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground border-b border-border">
                                            <tr>
                                                <th className="p-3.5 pr-6">#</th>
                                                <th className="p-3.5">نوع الحركة</th>
                                                <th className="p-3.5">الكمية المضافة / المخصومة</th>
                                                <th className="p-3.5">الرصيد بعد الحركة</th>
                                                <th className="p-3.5">المستخدم المسؤول</th>
                                                <th className="p-3.5">الملاحظات</th>
                                                <th className="p-3.5 pl-6">التاريخ والوقت</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {movements.data.map((m, index) => (
                                                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-3.5 pr-6 text-muted-foreground font-mono text-xs">
                                                        {(movements.from || 1) + index}
                                                    </td>
                                                    <td className="p-3.5">
                                                        {getMovementBadge(m.type)}
                                                    </td>
                                                    <td className="p-3.5 font-bold text-foreground">
                                                        {m.boxes_changed > 0 && `+ ${formatCurrency(m.boxes_changed)} كرتون `}
                                                        {m.pieces_changed > 0 && `+ ${formatCurrency(m.pieces_changed)} قطعة`}
                                                        {m.boxes_changed === 0 && m.pieces_changed === 0 && `${formatCurrency(m.total_pieces_changed)} قطعة`}
                                                    </td>
                                                    <td className="p-3.5 font-semibold text-emerald-700 dark:text-emerald-400">
                                                        {formatCurrency(m.total_pieces_after)} قطعة
                                                    </td>
                                                    <td className="p-3.5">
                                                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                            <UserIcon className="h-3.5 w-3.5 text-primary" />
                                                            <span>{m.user_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3.5 text-muted-foreground max-w-xs truncate">
                                                        {m.notes || '—'}
                                                    </td>
                                                    <td className="p-3.5 pl-6 text-xs text-muted-foreground dir-ltr">
                                                        <div className="flex items-center gap-1 justify-end">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span>{new Date(m.created_at).toLocaleString('ar-EG')}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View: Optimized Cards Grid (No horizontal overflow/clipping) */}
                                <div className="block md:hidden divide-y divide-border p-3 space-y-3">
                                    {movements.data.map((m, index) => (
                                        <div
                                            key={m.id}
                                            className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        #{(movements.from || 1) + index}
                                                    </span>
                                                    {getMovementBadge(m.type)}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{new Date(m.created_at).toLocaleDateString('ar-EG')}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-lg border border-border/50">
                                                <div>
                                                    <span className="text-xs text-muted-foreground block">التغيير:</span>
                                                    <span className="font-bold text-foreground text-sm">
                                                        {m.boxes_changed > 0 && `+ ${formatCurrency(m.boxes_changed)} كرتون `}
                                                        {m.pieces_changed > 0 && `+ ${formatCurrency(m.pieces_changed)} قطعة`}
                                                        {m.boxes_changed === 0 && m.pieces_changed === 0 && `${formatCurrency(m.total_pieces_changed)} قطعة`}
                                                    </span>
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-xs text-muted-foreground block">الرصيد بعد الحركة:</span>
                                                    <span className="font-bold text-emerald-600 text-sm">
                                                        {formatCurrency(m.total_pieces_after)} قطعة
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs pt-1">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <UserIcon className="h-3.5 w-3.5 text-primary" />
                                                    <span>بواسطة: <strong className="text-foreground">{m.user_name}</strong></span>
                                                </div>
                                            </div>

                                            {m.notes && (
                                                <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40 leading-relaxed">
                                                    📝 {m.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Clean Shadcn UI Pagination */}
                {movements.last_page > 1 && (
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">
                            الصفحة {movements.current_page} من أصل {movements.last_page}
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
        </AuthenticatedLayout>
    );
}
