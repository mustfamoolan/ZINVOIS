<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * قائمة المستخدمين مع فلترة وترقيم
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $query = User::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * إضافة مستخدم جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,employee,user',
        ]);

        $roleLabel = $validated['role'] === 'admin' ? 'أدمن' : 'موظف';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        ActivityLog::record(
            'create_user',
            "تم إنشاء حساب مستخدم جديد باسم ({$user->name}) ورتبة ({$roleLabel})"
        );

        return redirect()->back()->with('success', "تم إنشاء حساب المستخدم {$user->name} بنجاح");
    }

    /**
     * تعديل بيانات مستخدم
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|in:admin,employee,user',
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        ActivityLog::record(
            'update_user',
            "تم تحديث بيانات حساب المستخدم ({$user->name})"
        );

        return redirect()->back()->with('success', "تم تحديث حساب المستخدم {$user->name} بنجاح");
    }

    /**
     * حذف مستخدم
     */
    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()?->id) {
            return redirect()->back()->with('error', 'لا يمكنك حذف حسابك الحالي');
        }

        $userName = $user->name;
        $user->delete();

        ActivityLog::record(
            'delete_user',
            "تم حذف حساب المستخدم ({$userName})"
        );

        return redirect()->back()->with('success', "تم حذف حساب المستخدم {$userName} بنجاح");
    }
}
