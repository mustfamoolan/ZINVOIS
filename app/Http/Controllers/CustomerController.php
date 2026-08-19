<?php

namespace App\Http\Controllers;

use App\Models\Customer;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * قائمة العملاء الخاصة بالشركة الحالية
     */
    public function index(Request $request): Response
    {
        $companyId = session('active_company', 'dijlah');
        $search = $request->query('search');

        $query = Customer::where('company_id', $companyId)->withCount('invoices');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $customers = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Customers', [
            'customers' => $customers,
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * صفحة تفاصيل العميل وتتبع كافة فواتيره واسترجاعاتها
     */
    public function show(Request $request, Customer $customer): Response
    {
        $companyId = session('active_company', 'dijlah');

        if ($customer->company_id !== $companyId) {
            abort(403, 'غير مصرح للوصول إلى هذا العميل');
        }

        $search = $request->query('search');
        $type = $request->query('type', 'all');

        $invoicesQuery = $customer->invoices()->with('items');

        if ($type && $type !== 'all') {
            $invoicesQuery->where('type', $type);
        }

        if ($search) {
            $invoicesQuery->where('invoice_number', 'like', "%{$search}%");
        }

        $invoices = $invoicesQuery->latest()->paginate(10)->withQueryString();

        // إحصائيات العميل الحالية
        $allCustomerInvoices = $customer->invoices()->get();
        $totalInvoicesCount = $allCustomerInvoices->count();
        $totalSalesAmount = $allCustomerInvoices->where('type', 'sale')->sum('total_amount');
        $totalPurchasesAmount = $allCustomerInvoices->where('type', 'purchase')->sum('total_amount');
        $totalReturnedAmount = $allCustomerInvoices->sum('returned_amount');

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
            'invoices' => $invoices,
            'filters' => [
                'search' => $search ?? '',
                'type' => $type,
            ],
            'stats' => [
                'total_invoices_count' => $totalInvoicesCount,
                'total_sales_amount' => $totalSalesAmount,
                'total_purchases_amount' => $totalPurchasesAmount,
                'total_returned_amount' => $totalReturnedAmount,
                'net_sales_amount' => max(0, $totalSalesAmount - $totalReturnedAmount),
            ],
        ]);
    }

    /**
     * إضافة عميل جديد
     */
    public function store(Request $request)
    {
        $companyId = session('active_company', 'dijlah');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        Customer::create([
            'company_id' => $companyId,
            'name' => $validated['name'],
            'address' => $validated['address'] ?? null,
        ]);

        return redirect()->back()->with('success', 'تم إضافة العميل بنجاح');
    }

    /**
     * تحديث بيانات عميل
     */
    public function update(Request $request, Customer $customer)
    {
        $companyId = session('active_company', 'dijlah');

        if ($customer->company_id !== $companyId) {
            abort(403, 'غير مصرح للوصول إلى هذا العميل');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $customer->update([
            'name' => $validated['name'],
            'address' => $validated['address'] ?? null,
        ]);

        return redirect()->back()->with('success', 'تم تحديث بيانات العميل بنجاح');
    }

    /**
     * حذف عميل
     */
    public function destroy(Customer $customer)
    {
        $companyId = session('active_company', 'dijlah');

        if ($customer->company_id !== $customer->company_id) {
            abort(403, 'غير مصرح للوصول إلى هذا العميل');
        }

        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'تم حذف العميل بنجاح');
    }
}
