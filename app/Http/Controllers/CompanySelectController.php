<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanySelectController extends Controller
{
    /**
     * عرض صفحة اختيار الشركة الحالية (دلال دجلة / دلال المسك)
     */
    public function index(Request $request): Response
    {
        return Inertia::render('CompanySelect');
    }
}
