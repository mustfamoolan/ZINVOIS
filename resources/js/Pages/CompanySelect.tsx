import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Building2, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

const companies = [
    {
        id: 'dijlah',
        name: 'دلال دجلة',
        subtitle: 'شركة دلال دجلة للتجارة والمقاولات العامة',
        description: 'إدارة الفواتير والمخزون والحسابات الخاصة بشركة دلال دجلة',
        color: 'from-blue-600 to-indigo-700',
        badge: 'نشط',
    },
    {
        id: 'misk',
        name: 'دلال المسك',
        subtitle: 'شركة دلال المسك للتجارة والخدمات العامة',
        description: 'إدارة الفواتير والمخزون والحسابات الخاصة بشركة دلال المسك',
        color: 'from-emerald-600 to-teal-700',
        badge: 'نشط',
    },
];

export default function CompanySelect() {
    const handleSelectCompany = (companyId: string) => {
        router.post('/companies/select', { company: companyId });
    };

    return (
        <>
            <Head title="اختيار الشركة" />
            <div
                className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-muted/30 to-background px-4 py-12"
                dir="rtl"
            >
                {/* Header Section */}
                <div className="mb-10 text-center max-w-md space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        مرحباً بك في نظام الفواتير
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                        اختر الشركة للمتابعة
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        قم باختيار الشركة التي ترغب بإدارة فواتيرها ومخزونها الآن
                    </p>
                </div>

                {/* Companies Grid */}
                <div className="grid gap-6 md:grid-cols-2 w-full max-w-3xl">
                    {companies.map((company) => (
                        <Card
                            key={company.id}
                            className="group relative overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer bg-card flex flex-col justify-between"
                            onClick={() => handleSelectCompany(company.id)}
                        >
                            {/* Decorative Colored Top Bar */}
                            <div className={`h-2.5 w-full bg-gradient-to-r ${company.color}`} />

                            <CardHeader className="pt-6 pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                                        {company.badge}
                                    </span>
                                </div>
                                <CardTitle className="text-2xl font-bold text-right group-hover:text-primary transition-colors">
                                    {company.name}
                                </CardTitle>
                                <CardDescription className="text-right text-xs mt-1">
                                    {company.subtitle}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-2">
                                <p className="text-sm text-muted-foreground text-right leading-relaxed">
                                    {company.description}
                                </p>

                                <div className="pt-2">
                                    <Button
                                        className="w-full justify-between gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                                        variant="outline"
                                    >
                                        <span>الدخول إلى النظام</span>
                                        <ArrowLeft className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Footer Security Note */}
                <div className="mt-12 flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>بيانات كل شركة منفصلة بالكامل ومحمية بنظام أمان مستقل</span>
                </div>
            </div>
        </>
    );
}
