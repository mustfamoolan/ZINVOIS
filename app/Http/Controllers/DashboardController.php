<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $companyId = session('active_company', 'dijlah');

        $totalSalesAmount = Invoice::where('company_id', $companyId)
            ->where('type', 'sale')
            ->where('status', '!=', 'returned')
            ->sum('total_amount');

        $totalPurchasesAmount = Invoice::where('company_id', $companyId)
            ->where('type', 'purchase')
            ->where('status', '!=', 'returned')
            ->sum('total_amount');

        $invoicesCount = Invoice::where('company_id', $companyId)->count();
        $customersCount = Customer::where('company_id', $companyId)->count();

        // Fetch products collection to access virtual Eloquent attributes safely
        $products = Product::where('company_id', $companyId)->get();

        $productsCount = $products->count();
        $totalStockBoxes = $products->sum('boxes_count');
        $totalStockPieces = $products->sum('total_pieces');

        // Recent Invoices with customer relationship
        $recentInvoices = Invoice::where('company_id', $companyId)
            ->with('customer')
            ->latest()
            ->take(5)
            ->get();

        // Low stock products alert (boxes_count <= 5)
        $lowStockProducts = $products->filter(function ($p) {
            return $p->boxes_count <= 5;
        })->sortBy('boxes_count')->values()->take(5);

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalSalesAmount' => (float) $totalSalesAmount,
                'totalPurchasesAmount' => (float) $totalPurchasesAmount,
                'invoicesCount' => (int) $invoicesCount,
                'customersCount' => (int) $customersCount,
                'productsCount' => (int) $productsCount,
                'totalStockBoxes' => (int) $totalStockBoxes,
                'totalStockPieces' => (int) $totalStockPieces,
            ],
            'recentInvoices' => $recentInvoices,
            'lowStockProducts' => $lowStockProducts,
        ]);
    }
}
