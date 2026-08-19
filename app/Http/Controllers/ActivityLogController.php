<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * عرض سجل الحركات والأحداث بالتفصيل مع الترقيم والفلترة
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $userId = $request->query('user_id');
        $action = $request->query('action');

        $query = ActivityLog::with('user');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
            });
        }

        if ($userId && $userId !== 'all') {
            $query->where('user_id', $userId);
        }

        if ($action && $action !== 'all') {
            $query->where('action', $action);
        }

        $logs = $query->latest()->paginate(15)->withQueryString();

        // قائمة المستخدمين لفلتر البحث
        $users = User::select('id', 'name')->get();

        return Inertia::render('ActivityLogs/Index', [
            'logs' => $logs,
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'user_id' => $userId ?? 'all',
                'action' => $action ?? 'all',
            ],
        ]);
    }
}
