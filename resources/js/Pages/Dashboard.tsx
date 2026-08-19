import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table';
import { PageProps } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
    FileText,
    Package,
    TrendingUp,
    Users,
    Building2,
    Plus,
    Receipt,
    DollarSign,
    Boxes,
    ArrowUpRight,
    ArrowDownLeft,
    AlertTriangle,
    Eye,
    ChevronLeft,
    Sparkles,
} from 'lucide-react';

interface RecentInvoice {
    id: number;
    invoice_number: string;
    customer_name: string;
    type: 'sale' | 'purchase';
    status: 'active' | 'returned' | 'partially_returned';
    invoice_date: string;
    total_amount: number;
}

interface LowStockProduct {
    id: number;
    name: string;
    boxes_count: number;
    units_per_box: number;
    total_pieces: number;
}

interface DashboardProps {
    stats: {
        totalSalesAmount: number;
        totalPurchasesAmount: number;
        invoicesCount: number;
        customersCount: number;
        productsCount: number;
        totalStockBoxes: number;
        totalStockPieces: number;
    };
    recentInvoices: RecentInvoice[];
    lowStockProducts: LowStockProduct[];
}

export default function Dashboard({ stats, recentInvoices, lowStockProducts }: DashboardProps) {
    const { activeCompany } = usePage<PageProps>().props;
    const companyName = activeCompany?.name || 'دلال دجلة';

    const netProfit = (stats?.totalSalesAmount || 0) - (stats?.totalPurchasesAmount || 0);

    return (
        <AuthenticatedLayout title="لوحة التحكم">
            <Head title={`لوحة التحكم - ${companyName}`} />

            <div className="space-y-6" dir="rtl">
                {/* Dashboard Banner & Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="space-y-1 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-primary/10 text-primary">
                                شركة {companyName}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                            لوحة التحكم والتحليلات - {companyName}
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                            استعرض حركة الفواتير، الإيرادات الحالية، رصيد المخزن والعملاء لشركة {companyName} لحظة بلحظة.
                        </p>
                    </div>

                    {/* Quick POS Create Invoice Button */}
                    <div className="flex items-center gap-3 relative z-10 shrink-0">
                        <Link href="/invoices/create">
                            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md">
                                <Plus className="h-5 w-5" />
                                <span>إنشاء فاتورة جديدة</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main 4 KPI Summary Cards Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Total Sales */}
                    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground">
                                إجمالي المبيعات (الإيرادات)
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                                <ArrowUpRight className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(stats?.totalSalesAmount || 0)} <span className="text-xs font-normal text-muted-foreground">د.ع</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                                إجمالي فواتير البيع النشطة
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card 2: Total Purchases */}
                    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground">
                                إجمالي المشتريات
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                                <ArrowDownLeft className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {formatCurrency(stats?.totalPurchasesAmount || 0)} <span className="text-xs font-normal text-muted-foreground">د.ع</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">
                                إجمالي بضائع الموردين المدخلة
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card 3: Total Stock */}
                    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground">
                                رصيد المخزن الحالي
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                                <Boxes className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {formatCurrency(stats?.totalStockBoxes || 0)} <span className="text-xs font-normal text-muted-foreground">كرتون</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">
                                يتضمن {formatCurrency(stats?.totalStockPieces || 0)} قطعة ({stats?.productsCount || 0} صنف)
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card 4: Customers & Invoices Count */}
                    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground">
                                العملاء والفواتير
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                                <Users className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-foreground">
                                {formatCurrency(stats?.customersCount || 0)} <span className="text-xs font-normal text-muted-foreground">عميل</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">
                                صادرة عبر {formatCurrency(stats?.invoicesCount || 0)} فاتورة مسجلة
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Interactive Action Shortcuts Bar */}
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                    <Link href="/invoices/create" className="w-full">
                        <div className="p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-all flex items-center justify-between shadow-sm group">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                                    <Receipt className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">إنشاء فاتورة جديده</h4>
                                    <p className="text-[11px] text-muted-foreground">مبيعات أو شراء POS</p>
                                </div>
                            </div>
                            <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    <Link href="/warehouse" className="w-full">
                        <div className="p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-all flex items-center justify-between shadow-sm group">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">إدارة كشف المخزن</h4>
                                    <p className="text-[11px] text-muted-foreground">إضافة مواد وتعديل التعبئة</p>
                                </div>
                            </div>
                            <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    <Link href="/customers" className="w-full">
                        <div className="p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-all flex items-center justify-between shadow-sm group">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">قائمة العملاء</h4>
                                    <p className="text-[11px] text-muted-foreground">تسجيل وتتبع حسابات العميل</p>
                                </div>
                            </div>
                            <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    <Link href="/invoices" className="w-full">
                        <div className="p-4 rounded-xl border border-border bg-card hover:bg-muted/40 transition-all flex items-center justify-between shadow-sm group">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">أرشيف الفواتير</h4>
                                    <p className="text-[11px] text-muted-foreground">استرجاع وتدقيق الفواتير</p>
                                </div>
                            </div>
                            <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>

                {/* Dashboard Data Widgets: Recent Invoices & Low Stock Alert */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Widget 1: Recent Invoices Table (Spans 2 columns) */}
                    <Card className="lg:col-span-2 border-border overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border py-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Receipt className="h-4 w-4 text-primary" />
                                    آخر الفواتير المسجلة - {companyName}
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    أحدث الفواتير التي تم إنشاؤها مؤخراً لشركة {companyName}
                                </CardDescription>
                            </div>
                            <Link href="/invoices">
                                <Button size="sm" variant="ghost" className="gap-1 text-xs font-bold">
                                    <span>عرض الكل</span>
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentInvoices.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                    <p className="text-sm font-bold text-muted-foreground">
                                        لا توجد فواتير مسجلة لشركة {companyName} حتى الآن
                                    </p>
                                    <Link href="/invoices/create" className="mt-3">
                                        <Button size="sm" className="gap-1.5">
                                            <Plus className="h-4 w-4" />
                                            إنشاء أول فاتورة
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead className="w-28 font-mono">رقم الفاتورة</TableHead>
                                                <TableHead>اسم العميل</TableHead>
                                                <TableHead className="w-24 text-center">النوع</TableHead>
                                                <TableHead className="w-28 text-center">التاريخ</TableHead>
                                                <TableHead className="w-32 text-center">الإجمالي</TableHead>
                                                <TableHead className="w-16 text-center">معاينة</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentInvoices.map((inv) => (
                                                <TableRow key={inv.id} className="hover:bg-muted/20">
                                                    <TableCell className="font-mono font-bold text-xs text-foreground">
                                                        #{inv.invoice_number}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-foreground">
                                                        {inv.customer_name}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {inv.type === 'sale' ? (
                                                            <Badge variant="success" className="text-[11px]">بيع</Badge>
                                                        ) : (
                                                            <Badge variant="info" className="text-[11px]">شراء</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center text-xs font-mono text-muted-foreground">
                                                        {(inv.invoice_date || '').split('T')[0]}
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold text-primary text-sm">
                                                        {formatCurrency(inv.total_amount)} د.ع
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Link href={`/invoices/${inv.id}`}>
                                                            <Button size="icon-xs" variant="ghost">
                                                                <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Widget 2: Low Stock Alert Widget */}
                    <Card className="border-border overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border py-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                تنبيهات نواقص المخزن (الكميات المنخفضة)
                            </CardTitle>
                            <CardDescription className="text-xs">
                                منتجات وصل رصيد كراتينها إلى 5 كراتين أو أقل
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {lowStockProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center p-4">
                                    <Package className="h-10 w-10 text-emerald-500/30 mb-2" />
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        رصيد المخزن في حالة ممتازة!
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        لا توجد مواد منخفضة الكراتين حالياً
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {lowStockProducts.map((prod) => (
                                        <div key={prod.id} className="p-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                                            <div className="space-y-0.5">
                                                <h5 className="text-xs font-bold text-foreground">{prod.name}</h5>
                                                <p className="text-[11px] text-muted-foreground">
                                                    التعبئة: {formatCurrency(prod.units_per_box)} قطعة/كرتون
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="destructive" className="font-bold text-xs">
                                                    المتبقي: {formatCurrency(prod.boxes_count)} كرتون
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-3 bg-muted/40 border-t border-border">
                                <Link href="/warehouse">
                                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-border">
                                        فتح كشف المخزن الكامل
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
