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
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->string('product_name'); // اسم المنتج
            $table->integer('boxes')->default(1); // عدد الكراتين
            $table->integer('units_per_box')->default(1); // التعبئة (عدد القطع داخل الكرتون الواحد)
            $table->integer('total_pieces')->default(1); // العدد الكلي بالقطع
            $table->decimal('box_price', 12, 2)->default(0); // سعر الكرتون الواحد
            $table->decimal('total_price', 14, 2)->default(0); // إجمالي سعر الكراتين
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
