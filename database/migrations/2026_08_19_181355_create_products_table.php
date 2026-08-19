<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('company_id')->index(); // 'dijlah' or 'misk'
            $table->string('name');
            $table->integer('units_per_box')->default(1); // عدد القطع داخل الكرتون الواحد
            $table->integer('total_pieces')->default(0); // إجمالي عدد القطع المتوفرة
            $table->decimal('purchase_price', 12, 2)->nullable(); // سعر الشراء (اختياري)
            $table->decimal('sale_price', 12, 2); // سعر البيع
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
