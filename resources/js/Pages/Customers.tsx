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
    Users,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    MapPin,
    Building2,
    FileText,
    Eye,
} from 'lucide-react';

interface Customer {
    id: number;
    company_id: string;
    name: string;
    address?: string | null;
    invoices_count?: number;
    created_at: string;
}

interface PaginatedCustomers {
    data: Customer[];
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

interface CustomersProps {
    customers: PaginatedCustomers;
    filters?: {
        search?: string;
    };
}

export default function Customers({ customers, filters }: CustomersProps) {
    const { activeCompany } = usePage<PageProps>().props;
    const companyName = activeCompany?.name || 'دلال دجلة';

    const [search, setSearch] = useState(filters?.search || '');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    // Form
    const form = useForm({
        name: '',
        address: '',
    });

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/customers', { search }, { preserveState: true });
    };

    const handleOpenAddModal = () => {
        setEditingCustomer(null);
        form.reset();
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        form.setData({
            name: customer.name,
            address: customer.address || '',
        });
        setIsAddModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCustomer) {
            form.put(`/customers/${editingCustomer.id}`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post('/customers', {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (customer: Customer) => {
        if (confirm(`هل أنت تأكد من حذف العميل "${customer.name}"؟`)) {
            router.delete(`/customers/${customer.id}`);
        }
    };

    const customerList = customers.data || [];

    // Clean Pagination Links Handling
    const prevLink = customers.links && customers.links.length > 0 ? customers.links[0] : null;
    const nextLink = customers.links && customers.links.length > 0 ? customers.links[customers.links.length - 1] : null;
    const pageNumberLinks = customers.links && customers.links.length > 2 ? customers.links.slice(1, -1) : [];

    return (
        <AuthenticatedLayout title="إدارة العملاء">
            <Head title={`العملاء - ${companyName}`} />

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
                            <Users className="h-6 w-6 text-primary" />
                            إدارة عملاء شركة {companyName}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            سجل أسماء وعناوين العملاء وتتبع كافة فواتيرهم ومرتجعاتهم
                        </p>
                    </div>
                    <Button onClick={handleOpenAddModal} className="gap-2 shrink-0">
                        <UserPlus className="h-4 w-4" />
                        إضافة عميل جديد
                    </Button>
                </div>

                {/* Search Bar */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearchSubmit} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="البحث باسم العميل أو العنوان..."
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

                {/* Customers Table / Card Container */}
                <Card className="overflow-hidden border-border">
                    <CardHeader className="bg-muted/40 border-b border-border py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                قائمة العملاء ({customers.total} عميل مسجل)
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">
                                عرض {customers.from || 0} إلى {customers.to || 0} من {customers.total}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {customerList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-1">لا يوجد عملاء مسجلين</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                    لم يتم إضافة أي عميل لشركة {companyName} بعد.
                                </p>
                                <Button onClick={handleOpenAddModal} className="gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    إضافة أول عميل
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Desktop View: Data Grid Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-sm text-right border-collapse">
                                        <thead className="bg-muted/60 text-xs font-semibold text-muted-foreground border-b border-border">
                                            <tr>
                                                <th className="p-3.5 pr-6">#</th>
                                                <th className="p-3.5">اسم العميل</th>
                                                <th className="p-3.5">عنوان العميل</th>
                                                <th className="p-3.5">عدد الفواتير</th>
                                                <th className="p-3.5 pl-6 text-center">الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {customerList.map((customer, index) => (
                                                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-3.5 pr-6 text-muted-foreground font-mono text-xs">
                                                        {(customers.from || 1) + index}
                                                    </td>
                                                    <td className="p-3.5">
                                                        <Link
                                                            href={`/customers/${customer.id}`}
                                                            className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                                        >
                                                            <span>{customer.name}</span>
                                                        </Link>
                                                    </td>
                                                    <td className="p-3.5 text-muted-foreground">
                                                        {customer.address ? (
                                                            <div className="flex items-center gap-1.5 text-foreground/90">
                                                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                                                <span>{customer.address}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground/60">غير محدد</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3.5">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary text-xs font-semibold">
                                                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {formatCurrency(customer.invoices_count || 0)} فاتورة
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5 pl-6">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <Link href={`/customers/${customer.id}`}>
                                                                <Button
                                                                    size="xs"
                                                                    variant="outline"
                                                                    className="gap-1 border-border"
                                                                    title="عرض سجل وفواتير العميل"
                                                                >
                                                                    <Eye className="h-3.5 w-3.5 text-primary" />
                                                                    <span>تتبع السجل</span>
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                size="icon-xs"
                                                                variant="ghost"
                                                                onClick={() => handleOpenEditModal(customer)}
                                                                title="تعديل البيانات"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                                            </Button>
                                                            <Button
                                                                size="icon-xs"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(customer)}
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

                                {/* Mobile View: Mobile Responsive Cards */}
                                <div className="block md:hidden divide-y divide-border p-3 space-y-3">
                                    {customerList.map((customer) => (
                                        <div
                                            key={customer.id}
                                            className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2.5"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <Link
                                                        href={`/customers/${customer.id}`}
                                                        className="font-bold text-foreground text-base hover:text-primary transition-colors block"
                                                    >
                                                        {customer.name}
                                                    </Link>
                                                    {customer.address ? (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                            <MapPin className="h-3 w-3 text-primary shrink-0" />
                                                            <span>{customer.address}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/60 mt-1 block">بدون عنوان</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="icon-xs"
                                                        variant="ghost"
                                                        onClick={() => handleOpenEditModal(customer)}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </Button>
                                                    <Button
                                                        size="icon-xs"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(customer)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                                                <Link href={`/customers/${customer.id}`}>
                                                    <Button size="xs" variant="outline" className="gap-1 border-border">
                                                        <Eye className="h-3.5 w-3.5 text-primary" />
                                                        <span>تتبع السجل والفواتير</span>
                                                    </Button>
                                                </Link>
                                                <span className="font-bold text-foreground px-2 py-0.5 rounded bg-secondary">
                                                    {formatCurrency(customer.invoices_count || 0)} فاتورة
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {customers.last_page > 1 && (
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-muted-foreground">
                            الصفحة {customers.current_page} من أصل {customers.last_page}
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

            {/* Add / Edit Customer Modal */}
            <Dialog
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={editingCustomer ? 'تعديل بيانات العميل' : `إضافة عميل جديد - شركة ${companyName}`}
                description={editingCustomer ? 'تعديل الاسم والعنوان' : 'إدخال بيانات العميل للحفظ والاستدعاء التلقائي في الفواتير'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
                    <div>
                        <Label htmlFor="customer-name">اسم العميل *</Label>
                        <Input
                            id="customer-name"
                            placeholder="مثال: أسواق دجلة الخير"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive mt-1">{form.errors.name}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="customer-address">عنوان العميل (اختياري)</Label>
                        <Input
                            id="customer-address"
                            placeholder="مثال: بغداد - الكرادة"
                            value={form.data.address}
                            onChange={(e) => form.setData('address', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            يُستخدم لاختيار وتطبيق العنوان تلقائياً عند إنشاء فاتورة لهذا العميل
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {editingCustomer ? 'تحديث العميل' : 'حفظ العميل'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </AuthenticatedLayout>
    );
}
