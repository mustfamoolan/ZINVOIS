import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { FileText } from 'lucide-react';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="تسجيل الدخول" />
            <div
                className="min-h-screen flex flex-col items-center justify-center bg-background px-4"
                dir="rtl"
            >
                {/* Brand Header */}
                <div className="mb-8 flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-foreground text-background shadow-lg">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight">نظام الفواتير</h1>
                        <p className="text-sm text-muted-foreground mt-1">إدارة الفواتير والمخزون</p>
                    </div>
                </div>

                {/* Card */}
                <Card className="w-full max-w-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl text-center">تسجيل الدخول</CardTitle>
                        <CardDescription className="text-center">
                            أدخل بيانات حسابك للوصول إلى النظام
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {status && (
                            <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-sm text-green-700 text-right">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4 text-right">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@admin.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoComplete="username"
                                    dir="ltr"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">كلمة المرور</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                    dir="ltr"
                                    required
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive mt-1">{errors.password}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'جاري الدخول...' : 'تسجيل الدخول'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="mt-6 text-xs text-muted-foreground text-center">
                    نظام إدارة الفواتير والمخزون
                </p>
            </div>
        </>
    );
}
