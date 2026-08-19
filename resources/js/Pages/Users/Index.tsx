import { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Dialog } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/Components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/Components/ui/pagination';
import { PageProps } from '@/types';
import {
    Users as UsersIcon,
    UserPlus,
    Search,
    Building2,
    Shield,
    Trash2,
    Edit,
    CheckCircle2,
    UserCheck,
    Lock,
    Mail,
    User as UserIcon,
} from 'lucide-react';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface UsersIndexProps {
    users: {
        data: UserItem[];
        links: any[];
    };
    filters: {
        search: string;
    };
}

export default function UsersIndex({ users, filters }: UsersIndexProps) {
    const pageProps = usePage<PageProps & { flash?: { success?: string; error?: string } }>().props;
    const { activeCompany, flash, auth } = pageProps;
    const companyName = activeCompany?.name || 'دلال دجلة';

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);

    // Create Form
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'admin',
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'admin',
    });

    // Search Handler
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/users', { search: searchTerm }, { preserveState: true });
    };

    // Submit Create User
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/users', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (user: UserItem) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
        });
    };

    // Submit Edit User
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        editForm.put(`/users/${editingUser.id}`, {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    // Delete User
    const handleDeleteUser = (user: UserItem) => {
        if (confirm(`هل أنت متأكد من حذف حساب المستخدم (${user.name})؟`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    // Role Label Badge Helper
    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge variant="default" className="font-bold bg-primary">مدير النظام (Admin)</Badge>;
            case 'reception':
                return <Badge variant="info" className="font-bold">الاستقبال (Reception)</Badge>;
            case 'doctor':
                return <Badge variant="success" className="font-bold">الطبيب (Doctor)</Badge>;
            case 'pharmacy':
                return <Badge variant="warning" className="font-bold">الصيدلية (Pharmacy)</Badge>;
            case 'lab':
                return <Badge variant="secondary" className="font-bold">المختبر (Lab)</Badge>;
            default:
                return <Badge variant="outline" className="font-bold">موظف (Employee)</Badge>;
        }
    };

    return (
        <AuthenticatedLayout title="إدارة المستخدمين">
            <Head title={`إدارة المستخدمين - ${companyName}`} />

            <div className="space-y-6" dir="rtl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                شركة {companyName}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <UsersIcon className="h-6 w-6 text-primary" />
                            إدارة المستخدمين والحسابات
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            إنشاء الحسابات، ضبط الصلاحيات للأطباء والاستقبال والمدراء
                        </p>
                    </div>

                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-primary font-bold shrink-0">
                        <UserPlus className="h-4 w-4" />
                        إضافة مستخدم جديد
                    </Button>
                </div>

                {/* Flash Alerts */}
                {flash?.success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-destructive/10 border border-destructive/30 p-3.5 rounded-xl text-destructive text-xs font-bold flex items-center gap-2 shadow-sm">
                        <Shield className="h-4 w-4 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Search Bar Card */}
                <Card className="border-border">
                    <CardContent className="pt-4 pb-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="ابحث باسم المستخدم أو البريد الإلكتروني..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-9 text-xs font-bold"
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="gap-2 text-xs font-bold shrink-0">
                                <Search className="h-3.5 w-3.5" />
                                بحث
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Main Users Table */}
                <Card className="overflow-hidden border-border">
                    <CardHeader className="bg-muted/40 border-b border-border py-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-primary" />
                            جدول حسابات المستخدمين المسجلة ({users.data.length} مستخدم)
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        {users.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <UsersIcon className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                <p className="text-sm font-bold text-muted-foreground">لا يوجد مستخدمين يطابقون البحث</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/60">
                                                <TableHead className="w-12 pr-6">ت</TableHead>
                                                <TableHead>اسم المستخدم</TableHead>
                                                <TableHead>البريد الإلكتروني</TableHead>
                                                <TableHead className="text-center">الصلاحية / الرتبة</TableHead>
                                                <TableHead className="text-center">تاريخ الإنشاء</TableHead>
                                                <TableHead className="pl-6 text-center">الإجراءات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.data.map((u, idx) => (
                                                <TableRow key={u.id}>
                                                    <TableCell className="pr-6 font-mono text-xs font-bold text-muted-foreground">
                                                        {idx + 1}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <UserIcon className="h-4 w-4 text-primary" />
                                                            <span>{u.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {u.email}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {getRoleBadge(u.role)}
                                                    </TableCell>
                                                    <TableCell className="text-center text-xs font-mono text-muted-foreground">
                                                        {(u.created_at || '').split('T')[0]}
                                                    </TableCell>
                                                    <TableCell className="pl-6 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                size="xs"
                                                                variant="outline"
                                                                className="gap-1 border-border"
                                                                onClick={() => handleOpenEdit(u)}
                                                            >
                                                                <Edit className="h-3.5 w-3.5 text-primary" />
                                                                <span>تعديل</span>
                                                            </Button>

                                                            {u.id !== auth?.user?.id && (
                                                                <Button
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    className="text-destructive hover:bg-destructive/10"
                                                                    onClick={() => handleDeleteUser(u)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="block md:hidden divide-y divide-border p-3 space-y-3">
                                    {users.data.map((u, idx) => (
                                        <div key={u.id} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h5 className="font-bold text-foreground text-sm">{u.name}</h5>
                                                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{u.email}</p>
                                                </div>
                                                {getRoleBadge(u.role)}
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-border/60">
                                                <span className="text-[11px] font-mono text-muted-foreground">
                                                    تاريخ: {(u.created_at || '').split('T')[0]}
                                                </span>

                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="xs"
                                                        variant="outline"
                                                        className="gap-1 border-border"
                                                        onClick={() => handleOpenEdit(u)}
                                                    >
                                                        <Edit className="h-3.5 w-3.5 text-primary" />
                                                        <span>تعديل</span>
                                                    </Button>

                                                    {u.id !== auth?.user?.id && (
                                                        <Button
                                                            size="xs"
                                                            variant="ghost"
                                                            className="text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDeleteUser(u)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Footer */}
                                {users.links && users.links.length > 3 && (
                                    <div className="p-4 border-t border-border bg-card">
                                        <Pagination>
                                            <PaginationContent className="flex-wrap justify-center gap-1">
                                                {users.links.map((link, i) => (
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

            {/* Modal: Create User */}
            <Dialog
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="إضافة حساب مستخدم جديد"
                description="أدخل تفاصيل الحساب الجديد وحدد صلاحية المستخدم في النظام"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4 text-right" dir="rtl">
                    <div>
                        <Label htmlFor="create-name">الاسم الكامل *</Label>
                        <Input
                            id="create-name"
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                            placeholder="مثال: د. علي المحمداوي"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="create-email">البريد الإلكتروني *</Label>
                        <Input
                            id="create-email"
                            type="email"
                            value={createForm.data.email}
                            onChange={(e) => createForm.setData('email', e.target.value)}
                            placeholder="email@domain.com"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="create-password">كلمة المرور *</Label>
                        <Input
                            id="create-password"
                            type="password"
                            value={createForm.data.password}
                            onChange={(e) => createForm.setData('password', e.target.value)}
                            placeholder="كلمة مرور قوية"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="create-role">الصلاحية / الرتبة *</Label>
                        <select
                            id="create-role"
                            value={createForm.data.role}
                            onChange={(e) => createForm.setData('role', e.target.value)}
                            className="w-full mt-1 p-2 rounded-lg border border-input bg-background text-sm font-bold"
                            required
                        >
                            <option value="admin">مدير النظام (Admin)</option>
                            <option value="reception">موظف استقبال (Reception)</option>
                            <option value="doctor">طبيب (Doctor)</option>
                            <option value="pharmacy">كاشير الصيدلية (Pharmacy)</option>
                            <option value="lab">فني المختبر (Lab)</option>
                            <option value="user">موظف عام (Employee)</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={createForm.processing} className="bg-primary font-bold">
                            حفظ الحساب
                        </Button>
                    </div>
                </form>
            </Dialog>

            {/* Modal: Edit User */}
            <Dialog
                open={!!editingUser}
                onClose={() => setEditingUser(null)}
                title={`تعديل حساب: ${editingUser?.name}`}
                description="تعديل اسم المستخدم، البريد، الصلاحية، أو تغيير كلمة المرور"
            >
                {editingUser && (
                    <form onSubmit={handleEditSubmit} className="space-y-4 text-right" dir="rtl">
                        <div>
                            <Label htmlFor="edit-name">الاسم الكامل *</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-email">البريد الإلكتروني *</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-password">كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={editForm.data.password}
                                onChange={(e) => editForm.setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <Label htmlFor="edit-role">الصلاحية / الرتبة *</Label>
                            <select
                                id="edit-role"
                                value={editForm.data.role}
                                onChange={(e) => editForm.setData('role', e.target.value)}
                                className="w-full mt-1 p-2 rounded-lg border border-input bg-background text-sm font-bold"
                                required
                            >
                                <option value="admin">مدير النظام (Admin)</option>
                                <option value="reception">موظف استقبال (Reception)</option>
                                <option value="doctor">طبيب (Doctor)</option>
                                <option value="pharmacy">كاشير الصيدلية (Pharmacy)</option>
                                <option value="lab">فني المختبر (Lab)</option>
                                <option value="user">موظف عام (Employee)</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={editForm.processing} className="bg-primary font-bold">
                                حفظ التعديلات
                            </Button>
                        </div>
                    </form>
                )}
            </Dialog>
        </AuthenticatedLayout>
    );
}
