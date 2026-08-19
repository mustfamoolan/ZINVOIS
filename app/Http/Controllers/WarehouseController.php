<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    /**
     * عرض قائمة المنتجات الخاصة بالشركة الحالية مع الترقيم والبحث
     */
    public function index(Request $request): Response
    {
        $companyId = session('active_company', 'dijlah');
        $search = $request->query('search');

        $query = Product::where('company_id', $companyId);

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $products = $query->latest()->paginate(10)->withQueryString();

        // إحصائيات المخزن الشاملة للشركة
        $allCompanyProducts = Product::where('company_id', $companyId)->get();
        $totalProductsCount = $allCompanyProducts->count();
        $totalBoxesSum = $allCompanyProducts->sum(fn ($p) => $p->boxes_count);
        $totalPiecesSum = $allCompanyProducts->sum('total_pieces');
        $totalStockValue = $allCompanyProducts->sum(fn ($p) => $p->total_pieces * ($p->purchase_price ?: $p->sale_price));

        return Inertia::render('Warehouse', [
            'products' => $products,
            'filters' => [
                'search' => $search ?? '',
            ],
            'stats' => [
                'total_products' => $totalProductsCount,
                'total_boxes' => $totalBoxesSum,
                'total_pieces' => $totalPiecesSum,
                'total_stock_value' => $totalStockValue,
            ],
        ]);
    }

    /**
     * صفحة سجل حركة المنتج المستقلة
     */
    public function movements(Request $request, Product $product): Response
    {
        $companyId = session('active_company', 'dijlah');

        if ($product->company_id !== $companyId) {
            abort(403, 'غير مصرح للوصول إلى حركة هذا المنتج');
        }

        $movements = $product->movements()
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('ProductMovements', [
            'product' => $product,
            'movements' => $movements,
        ]);
    }

    /**
     * إضافة منتج جديد لمخزون الشركة الحالية
     */
    public function store(Request $request)
    {
        $companyId = session('active_company', 'dijlah');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'units_per_box' => 'required|integer|min:1',
            'initial_boxes' => 'nullable|integer|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
        ]);

        $initialBoxes = (int) ($validated['initial_boxes'] ?? 0);
        $unitsPerBox = (int) $validated['units_per_box'];

        $totalPieces = $initialBoxes * $unitsPerBox;

        $product = Product::create([
            'company_id' => $companyId,
            'name' => $validated['name'],
            'units_per_box' => $unitsPerBox,
            'total_pieces' => $totalPieces,
            'purchase_price' => $validated['purchase_price'] ?? null,
            'sale_price' => $validated['sale_price'],
        ]);

        // تسجيل حركة المخزون الأولى
        ProductMovement::create([
            'product_id' => $product->id,
            'company_id' => $companyId,
            'user_id' => $request->user()?->id,
            'user_name' => $request->user()?->name ?? 'مدير النظام',
            'type' => 'initial',
            'boxes_changed' => $initialBoxes,
            'pieces_changed' => 0,
            'total_pieces_changed' => $totalPieces,
            'total_pieces_after' => $totalPieces,
            'notes' => 'إضافة شحنة المنتج الأولى للمخزون',
        ]);

        return redirect()->back()->with('success', 'تم إضافة المنتج بنجاح');
    }

    /**
     * تعديل بيانات المنتج
     */
    public function update(Request $request, Product $product)
    {
        $companyId = session('active_company', 'dijlah');

        if ($product->company_id !== $companyId) {
            abort(403, 'غير مصرح للوصول إلى هذا المنتج');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'units_per_box' => 'required|integer|min:1',
            'purchase_price' => 'nullable|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
        ]);

        $product->update([
            'name' => $validated['name'],
            'units_per_box' => $validated['units_per_box'],
            'purchase_price' => $validated['purchase_price'] ?? null,
            'sale_price' => $validated['sale_price'],
        ]);

        return redirect()->back()->with('success', 'تم تحديث بيانات المنتج بنجاح');
    }

    /**
     * حذف منتج من المخزون
     */
    public function destroy(Product $product)
    {
        $companyId = session('active_company', 'dijlah');

        if ($product->company_id !== $companyId) {
            abort(403, 'غير مصرح للوصول إلى هذا المنتج');
        }

        $product->delete();

        return redirect()->back()->with('success', 'تم حذف المنتج بنجاح');
    }

    /**
     * إضافة كمية كراتين للمخزون حصراً دون الحاجة لطلب التعبئة مجدداً
     */
    public function addStock(Request $request, Product $product)
    {
        $companyId = session('active_company', 'dijlah');

        if ($product->company_id !== $companyId) {
            abort(403, 'غير مصرح للوصول إلى هذا المنتج');
        }

        $validated = $request->validate([
            'boxes' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:255',
        ]);

        $boxes = (int) $validated['boxes'];
        $addedPieces = $boxes * max($product->units_per_box, 1);

        $product->total_pieces += $addedPieces;
        $product->save();

        // تسجيل حركة المخزون
        ProductMovement::create([
            'product_id' => $product->id,
            'company_id' => $companyId,
            'user_id' => $request->user()?->id,
            'user_name' => $request->user()?->name ?? 'مدير النظام',
            'type' => 'add_stock',
            'boxes_changed' => $boxes,
            'pieces_changed' => 0,
            'total_pieces_changed' => $addedPieces,
            'total_pieces_after' => $product->total_pieces,
            'notes' => $validated['notes'] ?? 'إضافة شحنة كراتين للمخزون',
        ]);

        return redirect()->back()->with('success', 'تمت إضافة كمية الكراتين بنجاح وتسجيل الحركة');
    }
}
