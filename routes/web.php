<?php

use App\Http\Controllers\CompanySelectController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WarehouseController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ActivityLogController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {
    // اختيار الشركة النشطة (دلال دجلة / دلال المسك)
    Route::get('/companies', [CompanySelectController::class, 'index'])->name('companies.index');
    Route::post('/companies/select', function (Request $request) {
        $request->validate([
            'company' => 'required|in:dijlah,misk',
        ]);
        session(['active_company' => $request->company]);
        return redirect()->route('dashboard');
    })->name('companies.select');

    // صفحة لوحة التحكم (داشبورد)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // إدارة المخزن والمنتجات وسجل التتبع
    Route::get('/warehouse', [WarehouseController::class, 'index'])->name('warehouse');
    Route::post('/products', [WarehouseController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [WarehouseController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [WarehouseController::class, 'destroy'])->name('products.destroy');
    Route::post('/products/{product}/add-stock', [WarehouseController::class, 'addStock'])->name('products.add-stock');
    Route::get('/products/{product}/movements', [WarehouseController::class, 'movements'])->name('products.movements');

    // إدارة العملاء وصفحة تتبع العميل
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    // إدارة الفواتير والاسترجاع
    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/create', [InvoiceController::class, 'create'])->name('invoices.create');
    Route::post('/invoices', [InvoiceController::class, 'store'])->name('invoices.store');
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
    Route::post('/invoices/{invoice}/return', [InvoiceController::class, 'returnFullInvoice'])->name('invoices.return-full');
    Route::post('/invoices/{invoice}/return-item', [InvoiceController::class, 'returnItem'])->name('invoices.return-item');
    Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');

    // إدارة المستخدمين والصلاحيات
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // سجل الحركات والأحداث الشامل
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');

    // الملف الشخصي
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
