import { useState, ReactNode, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { PageProps } from '@/types';
import {
    LayoutDashboard,
    Package,
    LogOut,
    Menu,
    X,
    FileText,
    ChevronRight,
    Building2,
    RefreshCw,
    Users,
    Receipt,
    Download,
    PhoneCall,
    Sparkles,
    UserCheck,
    History,
} from 'lucide-react';

interface AuthenticatedProps {
    children: ReactNode;
    header?: ReactNode;
    title?: string;
}

const navItems = [
    {
        label: 'لوحة التحكم',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'الفواتير',
        href: '/invoices',
        icon: Receipt,
    },
    {
        label: 'العملاء',
        href: '/customers',
        icon: Users,
    },
    {
        label: 'المخزن',
        href: '/warehouse',
        icon: Package,
    },
    {
        label: 'إدارة المستخدمين',
        href: '/users',
        icon: UserCheck,
    },
    {
        label: 'سجل الأحداث',
        href: '/activity-logs',
        icon: History,
    },
];

export default function AuthenticatedLayout({ children, header, title }: AuthenticatedProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { activeCompany } = usePage<PageProps>().props;

    const companyName = activeCompany?.name || 'دلال دجلة';

    // PWA Install Banner State
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if standalone PWA mode is active
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone;

        if (isStandalone) return;

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Listen for standard beforeinstallprompt (Android / Desktop Chrome / Edge)
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (!localStorage.getItem('pwa_install_dismissed')) {
                setShowInstallBanner(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS
        if (ios && !isStandalone && !localStorage.getItem('pwa_install_dismissed')) {
            setShowInstallBanner(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    setShowInstallBanner(false);
                }
                setDeferredPrompt(null);
            });
        }
    };

    const handleDismissPwa = () => {
        localStorage.setItem('pwa_install_dismissed', 'true');
        setShowInstallBanner(false);
    };

    const SidebarContent = () => (
        <>
            {/* Logo & Company Selector */}
            <div className="flex flex-col border-b border-border p-4 gap-3">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold shadow-sm">
                        <FileText className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm">نظام الفواتير والمخزن</span>
                </Link>

                {/* Active Company Badge */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/80 border border-border">
                    <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs font-bold text-foreground truncate">{companyName}</span>
                    </div>
                    <Link
                        href="/companies"
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        title="تغيير الشركة"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto">
                <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                    القائمة الرئيسية
                </p>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = typeof window !== 'undefined' && (
                        window.location.pathname === item.href ||
                        (item.href !== '/dashboard' && window.location.pathname.startsWith(item.href))
                    );
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                                isActive
                                    ? 'bg-secondary font-bold text-foreground'
                                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                            }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            {/* User footer */}
            <div className="border-t border-border p-3">
                <div className="flex items-center gap-3 rounded-md px-3 py-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                            {auth?.user?.name ? auth.user.name.charAt(0) : 'م'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-right">
                        <p className="text-sm font-bold truncate">{auth?.user?.name || 'المستخدم'}</p>
                        <p className="text-xs text-muted-foreground truncate">
                            {auth?.user?.role === 'admin' ? 'مدير النظام (أدمن)' : 'موظف'}
                        </p>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        title="تسجيل الخروج"
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                        <LogOut className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-background" dir="rtl">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:right-0 lg:w-60 border-l border-border bg-background z-20">
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed inset-y-0 right-0 z-40 w-64 flex flex-col border-l border-border bg-background transform transition-transform duration-200 ease-in-out lg:hidden ${
                    sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex h-14 items-center justify-between border-b border-border px-4">
                    <span className="font-semibold text-sm">القائمة</span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto">
                    {/* Active Company Badge Mobile */}
                    <div className="flex items-center justify-between p-2.5 mb-2 rounded-lg bg-secondary/80 border border-border">
                        <div className="flex items-center gap-2 min-w-0">
                            <Building2 className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-xs font-bold text-foreground truncate">{companyName}</span>
                        </div>
                        <Link
                            href="/companies"
                            className="text-muted-foreground hover:text-primary transition-colors p-1"
                            title="تغيير الشركة"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = typeof window !== 'undefined' && (
                            window.location.pathname === item.href ||
                            (item.href !== '/dashboard' && window.location.pathname.startsWith(item.href))
                        );
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                                    isActive
                                        ? 'bg-secondary font-bold text-foreground'
                                        : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                                }`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col min-w-0 lg:pr-60">
                {/* Top header */}
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden text-muted-foreground hover:text-foreground"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Breadcrumb */}
                    <div className="flex-1">
                        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground justify-start">
                            <span className="font-semibold text-foreground">{companyName}</span>
                            {title && (
                                <>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium text-foreground">{title}</span>
                                </>
                            )}
                        </nav>
                    </div>

                    {/* Active Company Quick Switcher & Logout */}
                    <div className="flex items-center gap-2">
                        <Link href="/companies">
                            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold">
                                <Building2 className="h-3.5 w-3.5 text-primary" />
                                <span className="hidden sm:inline">{companyName}</span>
                                <RefreshCw className="h-3 w-3 text-muted-foreground" />
                            </Button>
                        </Link>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            title="تسجيل الخروج"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors px-2.5 py-1.5 rounded-lg border border-border bg-card shadow-sm"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">تسجيل الخروج</span>
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
                    {header && (
                        <div className="mb-6">
                            {header}
                        </div>
                    )}
                    {children}
                </main>
            </div>

            {/* PWA Install Banner Modal */}
            {showInstallBanner && (
                <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-background/95 backdrop-blur-md border border-border rounded-xl p-4 shadow-2xl flex flex-col gap-3 text-right">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm text-foreground">تثبيت تطبيق الفواتير</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                        {isIOS
                                            ? 'أضف التطبيق لشاشتك الرئيسية للوصول السريع ومتابعة عملك'
                                            : 'تصفح أسرع، استهلاك أقل للبيانات، ووصول مباشر من الشاشة الرئيسية'
                                        }
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDismissPwa}
                                className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-full hover:bg-muted shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {isIOS ? (
                            <div className="bg-muted/50 rounded-lg p-2.5 text-xs text-muted-foreground border border-border">
                                <p className="font-semibold text-foreground mb-1">خطوات التثبيت على الآيفون:</p>
                                <ol className="list-decimal list-inside space-y-1 pr-1">
                                    <li>اضغط على زر المشاركة <span className="inline-block font-mono bg-background px-1.5 py-0.5 rounded border border-border text-[10px]">Share ⎙</span> أسفل المتصفح</li>
                                    <li>اختر <span className="font-semibold text-foreground">إضافة للشاشة الرئيسية (Add to Home Screen)</span></li>
                                </ol>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1 text-xs gap-1.5 font-bold h-8 bg-primary text-primary-foreground"
                                    onClick={handleInstallClick}
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    تثبيت التطبيق الآن
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 border-border"
                                    onClick={handleDismissPwa}
                                >
                                    لاحقاً
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
