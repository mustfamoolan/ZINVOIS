<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\ProductMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    /**
     * عرض قائمة الفواتير الخاصة بالشركة الحالية
     */
    public function index(Request $request): Response
    {
        $companyId = session('active_company', 'dijlah');
        $search = $request->query('search');
        $type = $request->query('type', 'all');

        $query = Invoice::where('company_id', $companyId)->with('items');

        if ($type && $type !== 'all') {
            $query->where('type', $type);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_address', 'like', "%{$search}%");
            });
        }

        $invoices = $query->latest()->paginate(10)->withQueryString();

        // إحصائيات عامة
        $allInvoices = Invoice::where('company_id', $companyId)->get();
        $totalSalesCount = $allInvoices->where('type', 'sale')->count();
        $totalPurchasesCount = $allInvoices->where('type', 'purchase')->count();
        $totalSalesAmount = $allInvoices->where('type', 'sale')->sum('total_amount');
        $totalPurchasesAmount = $allInvoices->where('type', 'purchase')->sum('total_amount');

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $search ?? '',
                'type' => $type,
            ],
            'stats' => [
                'total_sales_count' => $totalSalesCount,
                'total_purchases_count' => $totalPurchasesCount,
                'total_sales_amount' => $totalSalesAmount,
                'total_purchases_amount' => $totalPurchasesAmount,
            ],
        ]);
    }

    /**
     * صفحة إنشاء فاتورة جديدة (بيع أو شراء)
     */
    public function create(): Response
    {
        $companyId = session('active_company', 'dijlah');

        $products = Product::where('company_id', $companyId)->get();
        $customers = Customer::where('company_id', $companyId)->get();

        // توليد رقم الفاتورة التسلسلي تلقائياً (مثال: DJ-1001)
        $lastInvoiceId = Invoice::where('company_id', $companyId)->max('id') ?? 0;
        $prefix = $companyId === 'dijlah' ? 'DJ' : 'MS';
        $nextInvoiceNumber = $prefix . '-' . str_pad($lastInvoiceId + 1001, 4, '0', STR_PAD_LEFT);

        return Inertia::render('Invoices/Create', [
            'products' => $products,
            'customers' => $customers,
            'suggestedInvoiceNumber' => $nextInvoiceNumber,
            'todayDate' => date('Y-m-d'),
        ]);
    }

    /**
     * حفظ الفاتورة وتحديث المخزن وتلقائياً إضافة/تحديث العميل
     */
    public function store(Request $request)
    {
        $companyId = session('active_company', 'dijlah');

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_address' => 'nullable|string|max:255',
            'invoice_number' => 'required|string|max:100',
            'type' => 'required|in:sale,purchase',
            'invoice_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.boxes' => 'required|integer|min:1',
            'items.*.box_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request, $validated, $companyId) {
            // 1. البحث عن العميل أو إنشائه تلقائياً إذا لم يكن موجوداً
            $customer = Customer::where('company_id', $companyId)
                ->where('name', trim($validated['customer_name']))
                ->first();

            if (!$customer) {
                $customer = Customer::create([
                    'company_id' => $companyId,
                    'name' => trim($validated['customer_name']),
                    'address' => $validated['customer_address'] ?? null,
                ]);
            } else if (!empty($validated['customer_address']) && empty($customer->address)) {
                $customer->update(['address' => $validated['customer_address']]);
            }

            // 2. إنشاء الفاتورة
            $invoice = Invoice::create([
                'company_id' => $companyId,
                'customer_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_address' => $validated['customer_address'] ?? $customer->address,
                'invoice_number' => $validated['invoice_number'],
                'type' => $validated['type'],
                'status' => 'active',
                'invoice_date' => $validated['invoice_date'],
                'total_amount' => 0,
                'user_name' => $request->user()?->name ?? 'مدير النظام',
            ]);

            $grandTotal = 0;

            // 3. إضافة المنتجات وحسم/إضافة المخزون
            foreach ($validated['items'] as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                $boxes = (int) $itemData['boxes'];
                $unitsPerBox = max($product->units_per_box, 1);
                $totalPieces = $boxes * $unitsPerBox;
                $boxPrice = (float) $itemData['box_price'];
                $totalPrice = $boxes * $boxPrice;
                $grandTotal += $totalPrice;

                // حفظ عنصر الفاتورة
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'boxes' => $boxes,
                    'units_per_box' => $unitsPerBox,
                    'total_pieces' => $totalPieces,
                    'box_price' => $boxPrice,
                    'total_price' => $totalPrice,
                ]);

                // تحديث المخزن وتتبع حركة المنتج
                if ($validated['type'] === 'sale') {
                    // حسم من المخزون في فاتورة البيع
                    $product->total_pieces = max(0, $product->total_pieces - $totalPieces);
                    $product->save();

                    ProductMovement::create([
                        'product_id' => $product->id,
                        'company_id' => $companyId,
                        'user_id' => $request->user()?->id,
                        'user_name' => $request->user()?->name ?? 'مدير النظام',
                        'type' => 'sale',
                        'boxes_changed' => -$boxes,
                        'pieces_changed' => 0,
                        'total_pieces_changed' => -$totalPieces,
                        'total_pieces_after' => $product->total_pieces,
                        'notes' => "فاتورة بيع رقم #{$invoice->invoice_number} (العميل: {$customer->name})",
                    ]);
                } else {
                    // إضافة للمخزون في فاتورة الشراء
                    $product->total_pieces += $totalPieces;
                    $product->save();

                    ProductMovement::create([
                        'product_id' => $product->id,
                        'company_id' => $companyId,
                        'user_id' => $request->user()?->id,
                        'user_name' => $request->user()?->name ?? 'مدير النظام',
                        'type' => 'add_stock',
                        'boxes_changed' => $boxes,
                        'pieces_changed' => 0,
                        'total_pieces_changed' => $totalPieces,
                        'total_pieces_after' => $product->total_pieces,
                        'notes' => "فاتورة شراء رقم #{$invoice->invoice_number} (المورد/العميل: {$customer->name})",
                    ]);
                }
            }

            // تحديث المبلغ الإجمالي للفاتورة
            $invoice->update(['total_amount' => $grandTotal]);

            if ($request->input('action') === 'save_and_new') {
                return redirect()->route('invoices.create')->with('success', "تم حفظ الفاتورة رقم #{$invoice->invoice_number} بنجاح، وتم تصفير وتجهيز نموذج الفاتورة التالية.");
            }

            if ($request->input('action') === 'save_and_print') {
                $invoice->load('items');
                return redirect()->route('invoices.create')->with([
                    'success' => "تم حفظ الفاتورة رقم #{$invoice->invoice_number} بنجاح، وجاري فتح نافذة الطباعة وتصفير النموذج للفاتورة التالية.",
                    'auto_print_invoice' => $invoice,
                ]);
            }

            return redirect()->route('invoices.show', $invoice->id)->with('success', 'تم حفظ الفاتورة وتحديث المخزن والعملاء بنجاح');
        });
    }

    /**
     * عرض الفاتورة وقراءتها وطباعتها
     */
    public function show(Invoice $invoice): Response
    {
        $companyId = session('active_company', 'dijlah');

        if ($invoice->company_id !== $companyId) {
            abort(403, 'غير مصرح للوصول إلى هذه الفاتورة');
        }

        $invoice->load('items.product', 'customer');

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * استرجاع الفاتورة بالكامل (إعادة البضاعة للمخزن وتحديث السجل)
     */
    public function returnFullInvoice(Request $request, Invoice $invoice)
    {
        $companyId = session('active_company', 'dijlah');

        if ($invoice->company_id !== $companyId) {
            abort(403, 'غير مصرح للوصول إلى هذه الفاتورة');
        }

        if ($invoice->status === 'returned') {
            return redirect()->back()->with('error', 'هذه الفاتورة مسترجعة بالفعل');
        }

        return DB::transaction(function () use ($request, $invoice, $companyId) {
            $invoice->load('items');

            foreach ($invoice->items as $item) {
                if ($item->product_id) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        if ($invoice->type === 'sale') {
                            // إعادة البضاعة للمخزن في حالة فاتورة البيع (+ مخزون)
                            $product->total_pieces += $item->total_pieces;
                            $product->save();

                            ProductMovement::create([
                                'product_id' => $product->id,
                                'company_id' => $companyId,
                                'user_id' => $request->user()?->id,
                                'user_name' => $request->user()?->name ?? 'مدير النظام',
                                'type' => 'return',
                                'boxes_changed' => $item->boxes,
                                'pieces_changed' => 0,
                                'total_pieces_changed' => $item->total_pieces,
                                'total_pieces_after' => $product->total_pieces,
                                'notes' => "إعادة مرتجع بالكامل من الفاتورة رقم #{$invoice->invoice_number} (العميل: {$invoice->customer_name})",
                            ]);
                        } else {
                            // خصم البضاعة من المخزون في حالة إرجاع فاتورة الشراء (- مخزون)
                            $product->total_pieces = max(0, $product->total_pieces - $item->total_pieces);
                            $product->save();

                            ProductMovement::create([
                                'product_id' => $product->id,
                                'company_id' => $companyId,
                                'user_id' => $request->user()?->id,
                                'user_name' => $request->user()?->name ?? 'مدير النظام',
                                'type' => 'return',
                                'boxes_changed' => -$item->boxes,
                                'pieces_changed' => 0,
                                'total_pieces_changed' => -$item->total_pieces,
                                'total_pieces_after' => $product->total_pieces,
                                'notes' => "إرجاع شحنة مشتريات للمورد من الفاتورة رقم #{$invoice->invoice_number}",
                            ]);
                        }
                    }
                }
            }

            $invoice->update([
                'status' => 'returned',
                'returned_amount' => $invoice->total_amount,
            ]);

            return redirect()->back()->with('success', 'تم استرجاع الفاتورة بالكامل وإعادة كافة الكراتين والمنتجات إلى المخزن');
        });
    }

    /**
     * استرجاع مادة محددة / عدد كراتين محدد من الفاتورة
     */
    public function returnItem(Request $request, Invoice $invoice)
    {
        $companyId = session('active_company', 'dijlah');

        if ($invoice->company_id !== $companyId) {
            abort(403, 'غير مصرح للوصول إلى هذه الفاتورة');
        }

        $validated = $request->validate([
            'invoice_item_id' => 'required|exists:invoice_items,id',
            'boxes_to_return' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($request, $invoice, $validated, $companyId) {
            $item = InvoiceItem::where('invoice_id', $invoice->id)
                ->where('id', $validated['invoice_item_id'])
                ->firstOrFail();

            $boxesToReturn = min((int) $validated['boxes_to_return'], $item->boxes);
            $unitsPerBox = max($item->units_per_box, 1);
            $piecesToReturn = $boxesToReturn * $unitsPerBox;
            $returnItemPrice = $boxesToReturn * $item->box_price;

            // تحديث المخزن والتسجيل
            if ($item->product_id) {
                $product = Product::find($item->product_id);
                if ($product) {
                    if ($invoice->type === 'sale') {
                        $product->total_pieces += $piecesToReturn;
                        $product->save();

                        ProductMovement::create([
                            'product_id' => $product->id,
                            'company_id' => $companyId,
                            'user_id' => $request->user()?->id,
                            'user_name' => $request->user()?->name ?? 'مدير النظام',
                            'type' => 'return',
                            'boxes_changed' => $boxesToReturn,
                            'pieces_changed' => 0,
                            'total_pieces_changed' => $piecesToReturn,
                            'total_pieces_after' => $product->total_pieces,
                            'notes' => "استرجاع {$boxesToReturn} كرتون من مادة ({$product->name}) - فاتورة #{$invoice->invoice_number}",
                        ]);
                    } else {
                        $product->total_pieces = max(0, $product->total_pieces - $piecesToReturn);
                        $product->save();

                        ProductMovement::create([
                            'product_id' => $product->id,
                            'company_id' => $companyId,
                            'user_id' => $request->user()?->id,
                            'user_name' => $request->user()?->name ?? 'مدير النظام',
                            'type' => 'return',
                            'boxes_changed' => -$boxesToReturn,
                            'pieces_changed' => 0,
                            'total_pieces_changed' => -$piecesToReturn,
                            'total_pieces_after' => $product->total_pieces,
                            'notes' => "إرجاع جزئي {$boxesToReturn} كرتون للمورد من مادة ({$product->name}) - فاتورة #{$invoice->invoice_number}",
                        ]);
                    }
                }
            }

            // تحديث السطر بالفاتورة
            if ($boxesToReturn >= $item->boxes) {
                $item->delete();
            } else {
                $item->update([
                    'boxes' => $item->boxes - $boxesToReturn,
                    'total_pieces' => $item->total_pieces - $piecesToReturn,
                    'total_price' => $item->total_price - $returnItemPrice,
                ]);
            }

            // تحديث إجمالي الفاتورة ومبلغ الاسترجاع
            $newTotalAmount = max(0, $invoice->total_amount - $returnItemPrice);
            $newReturnedAmount = $invoice->returned_amount + $returnItemPrice;
            $newStatus = ($invoice->items()->count() === 0) ? 'returned' : 'partially_returned';

            $invoice->update([
                'total_amount' => $newTotalAmount,
                'returned_amount' => $newReturnedAmount,
                'status' => $newStatus,
            ]);

            return redirect()->back()->with('success', 'تم استرجاع الكمية المحددة بنجاح وتحديث رصيد المخزن والفاتورة');
        });
    }

    /**
     * حذف فاتورة
     */
    public function destroy(Invoice $invoice)
    {
        $companyId = session('active_company', 'dijlah');

        if ($invoice->company_id !== $companyId) {
            abort(403, 'غير مصرح للوصول إلى هذه الفاتورة');
        }

        $invoice->delete();

        return redirect()->route('invoices.index')->with('success', 'تم حذف الفاتورة بنجاح');
    }
}
