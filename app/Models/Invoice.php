<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'company_id',
    'customer_id',
    'customer_name',
    'customer_address',
    'invoice_number',
    'type',
    'status',
    'invoice_date',
    'total_amount',
    'returned_amount',
    'user_name',
])]
class Invoice extends Model
{
    use HasFactory;

    protected $casts = [
        'invoice_date' => 'date:Y-m-d',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('id', 'asc');
    }
}
