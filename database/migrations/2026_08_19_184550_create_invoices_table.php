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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('company_id')->index(); // 'dijlah' or 'misk'
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->string('customer_name'); // اسم العميل
            $table->string('customer_address')->nullable(); // عنوان العميل
            $table->string('invoice_number'); // رقم الفاتورة
            $table->string('type')->default('sale'); // 'sale' بيع أو 'purchase' شراء (Default: بيع)
            $table->date('invoice_date'); // تاريخ الفاتورة
            $table->decimal('total_amount', 14, 2)->default(0); // مبلغ القائمة إجمالي
            $table->string('user_name')->default('مدير النظام'); // المستخدم منشئ الفاتورة
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
