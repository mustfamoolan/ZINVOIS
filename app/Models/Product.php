<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['company_id', 'name', 'units_per_box', 'total_pieces', 'purchase_price', 'sale_price'])]
class Product extends Model
{
    use HasFactory;

    protected $appends = ['boxes_count', 'remaining_pieces'];

    public function getBoxesCountAttribute(): int
    {
        $units = max($this->units_per_box, 1);
        return (int) floor($this->total_pieces / $units);
    }

    public function getRemainingPiecesAttribute(): int
    {
        $units = max($this->units_per_box, 1);
        return (int) ($this->total_pieces % $units);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(ProductMovement::class)->latest();
    }
}
