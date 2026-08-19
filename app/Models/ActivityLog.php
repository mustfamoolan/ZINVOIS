<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

#[Fillable(['user_id', 'user_name', 'company_id', 'action', 'description', 'ip_address'])]
class ActivityLog extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper Static Method to log activity instantly anywhere in application
     */
    public static function record(string $action, string $description, ?string $companyId = null): self
    {
        $user = Auth::user();
        $company = $companyId ?: session('active_company', 'dijlah');

        return self::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name ?? 'المدير العام',
            'company_id' => $company,
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
        ]);
    }
}
