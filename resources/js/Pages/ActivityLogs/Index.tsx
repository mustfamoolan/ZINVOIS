import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/Components/ui/pagination';
import { PageProps } from '@/types';
import {
    History,
    Search,
    Building2,
    User as UserIcon,
    Filter,
    Shield,
    Activity,
    Clock,
    FileText,
    Package,
    Users,
} from 'lucide-react';

interface LogItem {
    id: number;
    user_id?: number | null;
    user_name: string;
    company_id?: string | null;
    action: string;
    description: string;
    ip_address?: string | null;
    created_at: string;
}

interface UserOption {
    id: number;
    name: string;
}

interface ActivityLogsIndexProps {
    logs: {
        data: LogItem[];
        links: any[];
    };
    users: UserOption[];
    filters: {
        search: string;
        user_id: string;
        action: string;
    };
}

export default function ActivityLogsIndex({ logs, users, filters }: ActivityLogsIndexProps) {
    const pageProps = usePage<PageProps>().props;
    const { activeCompany } = pageProps;
    const companyName = activeCompany?.name || 'دلال دجلة';

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedUser, setSelectedUser] = useState(filters.user_id || 'all');
    const [selectedAction, setSelectedAction] = useState(filters.action || 'all');

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/activity-logs',
            {
                search: searchTerm,
                user_id: selectedUser,
                action: selectedAction,
            },
            { preserveState: true }
        );
    };

    // Action Badge Helper
    const getActionBadge = (action: string) => {
        if (action.includes('invoice') || action.includes('return')) {
            return <Badge variant="success" className="font-bold">فاتورة / مبيعات</Badge>;
        }
        if (action.includes('user')) {
            return <Badge variant="default" className="font-bold bg-purple-600 text-white">إدارة حسابات</Badge>;
        }
        if (action.includes('stock') || action.includes('product')) {
            return <Badge variant="info" className="font-bold">حركة مخزن</Badge>;
        }
        if (action.includes('customer')) {
            return <Badge variant="outline" className="font-bold">عميل جديد</Badge>;
        }
        return <Badge variant="secondary" className="font-bold">{action}</Badge>;
    };

    return (
        <AuthenticatedLayout title="سجل الأحداث والنشاطات">
            <Head title={`سجل الحركات والأحداث - ${companyName}`} />

            <div className="space-y-6" dir="rtl">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            شركة {companyName}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <History className="h-6 w-6 text-primary" />
                        سجل الحركات والنشاطات (Activity Logs)
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        تتبع كافة الإجراءات والحركات المنفذة في النظام ومن قام بها بالوقت والـ IP
                    </p>
                </div>

                {/* Filter Controls Card */}
                <Card className="border-border">
                    <CardContent className="pt-4 pb-4">
                        <form onSubmit={handleFilterSubmit} className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 items-end">
                            {/* Search */}
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground">البحث بالنص أو الحساب:</span>
                                <div className="relative">
                                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="ابحث في نص التتبع..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pr-9 text-xs font-bold"
                                    />
                                </div>
                            </div>

                            {/* User Filter */}
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground">المستخدم المنفذ:</span>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-input bg-background text-xs font-bold h-9"
                                >
                                    <option value="all">كل المستخدمين</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Filter */}
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground">نوع الحركة:</span>
                                <select
                                    value={selectedAction}
                                    onChange={(e) => setSelectedAction(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-input bg-background text-xs font-bold h-9"
                                >
                                    <option value="all">كل أنواع الحركات</option>
                                    <option value="create_invoice">إنشاء فواتير</option>
                                    <option value="return_invoice">استرجاع فواتير</option>
                                    <option value="create_user">إضافة مستخدمين</option>
                                    <option value="update_user">تحديث مستخدمين</option>
                                    <option value="create_product">إضافة منتجات للمخزن</option>
                                    <option value="add_stock">إضافة شحنات كراتين</option>
                                    <option value="create_customer">تسجيل عملاء</option>
                                </select>
                            </div>

                            {/* Submit Filter Button */}
                            <Button type="submit" variant="secondary" className="gap-2 text-xs font-bold h-9">
                                <Filter className="h-3.5 w-3.5" />
                                تطبيق الفلترة
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Main Logs Table */}
                <Card className="overflow-hidden border-border">
                    <CardHeader className="bg-muted/40 border-b border-border py-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            جدول أحداث وتتبع الحركة ({logs.data.length} سجل)
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        {logs.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <History className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                <p className="text-sm font-bold text-muted-foreground">لا توجد سجلات تتبع تطابق الفلتر الحقيقي</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/60">
                                                <TableHead className="w-12 pr-6">ت</TableHead>
                                                <TableHead className="w-40">المستخدم المنفذ</TableHead>
                                                <TableHead className="w-32 text-center">نوع الإجراء</TableHead>
                                                <TableHead>تفاصيل ووصف الحركة المنفذة</TableHead>
                                                <TableHead className="w-32 text-center">التوقيت والـ IP</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {logs.data.map((log, idx) => (
                                                <TableRow key={log.id} className="hover:bg-muted/20">
                                                    <TableCell className="pr-6 font-mono text-xs font-bold text-muted-foreground">
                                                        {idx + 1}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-foreground">
                                                        <div className="flex items-center gap-1.5">
                                                            <UserIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                                                            <span>{log.user_name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {getActionBadge(log.action)}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-xs text-foreground">
                                                        {log.description}
                                                    </TableCell>
                                                    <TableCell className="text-center text-xs font-mono text-muted-foreground">
                                                        <div>{(log.created_at || '').replace('T', ' ').split('.')[0]}</div>
                                                        {log.ip_address && (
                                                            <span className="text-[10px] text-muted-foreground block">
                                                                {log.ip_address}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="block md:hidden divide-y divide-border p-3 space-y-3">
                                    {logs.data.map((log, idx) => (
                                        <div key={log.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                                    <UserIcon className="h-3.5 w-3.5 text-primary" />
                                                    <span>{log.user_name}</span>
                                                </div>
                                                {getActionBadge(log.action)}
                                            </div>

                                            <p className="text-xs font-medium text-foreground pt-1">
                                                {log.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
                                                <span>{(log.created_at || '').replace('T', ' ').split('.')[0]}</span>
                                                {log.ip_address && <span>IP: {log.ip_address}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Footer */}
                                {logs.links && logs.links.length > 3 && (
                                    <div className="p-4 border-t border-border bg-card">
                                        <Pagination>
                                            <PaginationContent className="flex-wrap justify-center gap-1">
                                                {logs.links.map((link, i) => (
                                                    <PaginationItem key={i}>
                                                        {link.label.includes('السابق') || link.label.includes('&laquo;') ? (
                                                            <PaginationPrevious href={link.url} disabled={!link.url} />
                                                        ) : link.label.includes('التالي') || link.label.includes('&raquo;') ? (
                                                            <PaginationNext href={link.url} disabled={!link.url} />
                                                        ) : link.label === '...' ? (
                                                            <PaginationEllipsis />
                                                        ) : (
                                                            <PaginationLink href={link.url} isActive={link.active}>
                                                                {link.label}
                                                            </PaginationLink>
                                                        )}
                                                    </PaginationItem>
                                                ))}
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
