<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\ProductMovement;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. إنشاء حساب الأدمن الافتراضي
        $admin = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'المدير العام',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
            ]
        );

        // 2. بذر العملاء للشركتين
        $dijlahCustomers = [
            ['name' => 'أسواق دجلة الخير', 'address' => 'بغداد - الكرادة'],
            ['name' => 'شركة النور للمواد الغذائية', 'address' => 'الجميلة - شارع السوق'],
            ['name' => 'مجمع الفرات الاستهلاكي', 'address' => 'بغداد - زيونة'],
            ['name' => 'أسواق السلام التجارية', 'address' => 'البصرة - شارع الجزائر'],
        ];

        $miskCustomers = [
            ['name' => 'مركز الملكة للعطور والتجميل', 'address' => 'بغداد - المنصور'],
            ['name' => 'مؤسسة مسك الشرق التجميلية', 'address' => 'أربيل - شارع 60'],
            ['name' => 'صيدلية ومذركير الأمل', 'address' => 'النجف الأشرف - شارع الروان'],
            ['name' => 'بوتيك الياسمين', 'address' => 'بغداد - الحارثية'],
        ];

        $dijlahCustomerModels = [];
        foreach ($dijlahCustomers as $c) {
            $dijlahCustomerModels[] = Customer::create([
                'company_id' => 'dijlah',
                'name' => $c['name'],
                'address' => $c['address'],
            ]);
        }

        $miskCustomerModels = [];
        foreach ($miskCustomers as $c) {
            $miskCustomerModels[] = Customer::create([
                'company_id' => 'misk',
                'name' => $c['name'],
                'address' => $c['address'],
            ]);
        }

        // 3. قائمة 20 منتج لمخزن شركة (دلال دجلة - مواد غذائية واستهلاكية)
        $dijlahProducts = [
            ['name' => 'زيت دجلة الصافي 1 لتر', 'units_per_box' => 12, 'boxes' => 25, 'pieces' => 4, 'purchase_price' => 18000, 'sale_price' => 22000],
            ['name' => 'أرز الياسمين الفاخر 5 كغم', 'units_per_box' => 4, 'boxes' => 40, 'pieces' => 0, 'purchase_price' => 45000, 'sale_price' => 52000],
            ['name' => 'معجون طماطم دجلة 800 غم', 'units_per_box' => 24, 'boxes' => 20, 'pieces' => 8, 'purchase_price' => 24000, 'sale_price' => 30000],
            ['name' => 'سكر ناصع الممتاز 10 كغم', 'units_per_box' => 2, 'boxes' => 50, 'pieces' => 0, 'purchase_price' => 28000, 'sale_price' => 33000],
            ['name' => 'شاي دجلة الخدر 500 غم', 'units_per_box' => 20, 'boxes' => 15, 'pieces' => 5, 'purchase_price' => 60000, 'sale_price' => 72000],
            ['name' => 'حليب مكثف دجلة 397 غم', 'units_per_box' => 48, 'boxes' => 10, 'pieces' => 12, 'purchase_price' => 48000, 'sale_price' => 60000],
            ['name' => 'زيت زيتون بكر ممتاز 750 مل', 'units_per_box' => 12, 'boxes' => 18, 'pieces' => 0, 'purchase_price' => 75000, 'sale_price' => 90000],
            ['name' => 'طحين فاخر درجة أولى 25 كغم', 'units_per_box' => 1, 'boxes' => 60, 'pieces' => 0, 'purchase_price' => 32000, 'sale_price' => 38000],
            ['name' => 'ملح طعام يودي 1 كغم', 'units_per_box' => 30, 'boxes' => 15, 'pieces' => 10, 'purchase_price' => 6000, 'sale_price' => 9000],
            ['name' => 'معكرونة دجلة ممتازة 400 غم', 'units_per_box' => 20, 'boxes' => 30, 'pieces' => 0, 'purchase_price' => 10000, 'sale_price' => 14000],
            ['name' => 'شعرية دجلة الذهبية 400 غم', 'units_per_box' => 20, 'boxes' => 25, 'pieces' => 5, 'purchase_price' => 9000, 'sale_price' => 13000],
            ['name' => 'عدس أحمر مجروش 1 كغم', 'units_per_box' => 12, 'boxes' => 20, 'pieces' => 0, 'purchase_price' => 18000, 'sale_price' => 23000],
            ['name' => 'حمص حب فاخر 1 كغم', 'units_per_box' => 12, 'boxes' => 15, 'pieces' => 4, 'purchase_price' => 16000, 'sale_price' => 21000],
            ['name' => 'فاصوليا بيضاء ممتازة 1 كغم', 'units_per_box' => 12, 'boxes' => 14, 'pieces' => 0, 'purchase_price' => 20000, 'sale_price' => 26000],
            ['name' => 'برغل أبيض ناعم 1 كغم', 'units_per_box' => 12, 'boxes' => 16, 'pieces' => 2, 'purchase_price' => 12000, 'sale_price' => 16000],
            ['name' => 'بهارات بهار مشكل هندي 250 غم', 'units_per_box' => 24, 'boxes' => 10, 'pieces' => 0, 'purchase_price' => 36000, 'sale_price' => 45000],
            ['name' => 'ماء ورد طبيعي 500 مل', 'units_per_box' => 12, 'boxes' => 12, 'pieces' => 6, 'purchase_price' => 15000, 'sale_price' => 20000],
            ['name' => 'خل أبيض نقي 1 لتر', 'units_per_box' => 12, 'boxes' => 22, 'pieces' => 0, 'purchase_price' => 9000, 'sale_price' => 13000],
            ['name' => 'دبس رمان طبيعي 500 مل', 'units_per_box' => 12, 'boxes' => 14, 'pieces' => 3, 'purchase_price' => 30000, 'sale_price' => 38000],
            ['name' => 'طحينة سمسم صافية 800 غم', 'units_per_box' => 12, 'boxes' => 10, 'pieces' => 0, 'purchase_price' => 42000, 'sale_price' => 52000],
        ];

        // 4. قائمة 20 منتج لمخزن شركة (دلال المسك - عطور ومستحضرات تجميل)
        $miskProducts = [
            ['name' => 'عطر مسك الختام الملكي 100 مل', 'units_per_box' => 12, 'boxes' => 15, 'pieces' => 2, 'purchase_price' => 150000, 'sale_price' => 210000],
            ['name' => 'صابون المسك المعطر 150 غم', 'units_per_box' => 36, 'boxes' => 20, 'pieces' => 0, 'purchase_price' => 250000, 'sale_price' => 350000],
            ['name' => 'شامبو المسك للتحكم بالتساقط 400 مل', 'units_per_box' => 12, 'boxes' => 25, 'pieces' => 4, 'purchase_price' => 400000, 'sale_price' => 550000],
            ['name' => 'بلسم المسك المغذي للشعر 400 مل', 'units_per_box' => 12, 'boxes' => 18, 'pieces' => 0, 'purchase_price' => 380000, 'sale_price' => 520000],
            ['name' => 'لوشن جسم بعبير المسك 250 مل', 'units_per_box' => 24, 'boxes' => 14, 'pieces' => 6, 'purchase_price' => 600000, 'sale_price' => 850000],
            ['name' => 'غسول وجه طبيعي بالمسك 150 مل', 'units_per_box' => 24, 'boxes' => 12, 'pieces' => 0, 'purchase_price' => 480000, 'sale_price' => 680000],
            ['name' => 'معطر جو المسك النقي 300 مل', 'units_per_box' => 12, 'boxes' => 30, 'pieces' => 0, 'purchase_price' => 300000, 'sale_price' => 420000],
            ['name' => 'بخور المسك الفاخر 100 غم', 'units_per_box' => 20, 'boxes' => 16, 'pieces' => 5, 'purchase_price' => 700000, 'sale_price' => 950000],
            ['name' => 'دهن عود ومسك ملكي 12 مل', 'units_per_box' => 50, 'boxes' => 8, 'pieces' => 10, 'purchase_price' => 1800000, 'sale_price' => 2500000],
            ['name' => 'كريم ترطيب اليدين بالمسك 100 غم', 'units_per_box' => 24, 'boxes' => 15, 'pieces' => 0, 'purchase_price' => 220000, 'sale_price' => 320000],
            ['name' => 'معجون أسنان المسك وانتعاش 125 مل', 'units_per_box' => 36, 'boxes' => 12, 'pieces' => 8, 'purchase_price' => 180000, 'sale_price' => 260000],
            ['name' => 'زيت مساج بعبير المسك 200 مل', 'units_per_box' => 12, 'boxes' => 10, 'pieces' => 0, 'purchase_price' => 550000, 'sale_price' => 780000],
            ['name' => 'مناديل مبللة برائحة المسك', 'units_per_box' => 48, 'boxes' => 18, 'pieces' => 12, 'purchase_price' => 150000, 'sale_price' => 220000],
            ['name' => 'مسك طهارة أصلي 6 مل', 'units_per_box' => 50, 'boxes' => 10, 'pieces' => 0, 'purchase_price' => 900000, 'sale_price' => 1300000],
            ['name' => 'معطر سيارة بعبير المسك', 'units_per_box' => 50, 'boxes' => 12, 'pieces' => 15, 'purchase_price' => 120000, 'sale_price' => 180000],
            ['name' => 'بودرة جسم معطرة بالمسك 200 غم', 'units_per_box' => 24, 'boxes' => 10, 'pieces' => 0, 'purchase_price' => 320000, 'sale_price' => 450000],
            ['name' => 'سكراب تقشير بالمسك والسكر 350 غم', 'units_per_box' => 12, 'boxes' => 14, 'pieces' => 2, 'purchase_price' => 500000, 'sale_price' => 720000],
            ['name' => 'ملح استجمام معطر بالمسك 500 غم', 'units_per_box' => 12, 'boxes' => 10, 'pieces' => 0, 'purchase_price' => 280000, 'sale_price' => 400000],
            ['name' => 'شمعة معطرة بعبير المسك 250 غم', 'units_per_box' => 12, 'boxes' => 15, 'pieces' => 4, 'purchase_price' => 450000, 'sale_price' => 650000],
            ['name' => 'زيت شعر بالمسك والأرجان 100 مل', 'units_per_box' => 24, 'boxes' => 12, 'pieces' => 0, 'purchase_price' => 650000, 'sale_price' => 920000],
        ];

        // بذر منتجات دلال دجلة
        $dijlahProductModels = [];
        foreach ($dijlahProducts as $item) {
            $totalPieces = ($item['boxes'] * $item['units_per_box']) + $item['pieces'];

            $product = Product::create([
                'company_id' => 'dijlah',
                'name' => $item['name'],
                'units_per_box' => $item['units_per_box'],
                'total_pieces' => $totalPieces,
                'purchase_price' => $item['purchase_price'],
                'sale_price' => $item['sale_price'],
            ]);

            $dijlahProductModels[] = $product;

            ProductMovement::create([
                'product_id' => $product->id,
                'company_id' => 'dijlah',
                'user_id' => $admin->id,
                'user_name' => $admin->name,
                'type' => 'initial',
                'boxes_changed' => $item['boxes'],
                'pieces_changed' => $item['pieces'],
                'total_pieces_changed' => $totalPieces,
                'total_pieces_after' => $totalPieces,
                'notes' => 'الشحنة الأولى للمخزن - دلال دجلة',
            ]);
        }

        // بذر منتجات دلال المسك
        $miskProductModels = [];
        foreach ($miskProducts as $item) {
            $totalPieces = ($item['boxes'] * $item['units_per_box']) + $item['pieces'];

            $product = Product::create([
                'company_id' => 'misk',
                'name' => $item['name'],
                'units_per_box' => $item['units_per_box'],
                'total_pieces' => $totalPieces,
                'purchase_price' => $item['purchase_price'],
                'sale_price' => $item['sale_price'],
            ]);

            $miskProductModels[] = $product;

            ProductMovement::create([
                'product_id' => $product->id,
                'company_id' => 'misk',
                'user_id' => $admin->id,
                'user_name' => $admin->name,
                'type' => 'initial',
                'boxes_changed' => $item['boxes'],
                'pieces_changed' => $item['pieces'],
                'total_pieces_changed' => $totalPieces,
                'total_pieces_after' => $totalPieces,
                'notes' => 'الشحنة الأولى للمخزن - دلال المسك',
            ]);
        }

        // 5. بذر فواتير بيع وشراء عينة لشركة دلال دجلة
        $inv1 = Invoice::create([
            'company_id' => 'dijlah',
            'customer_id' => $dijlahCustomerModels[0]->id,
            'customer_name' => $dijlahCustomerModels[0]->name,
            'customer_address' => $dijlahCustomerModels[0]->address,
            'invoice_number' => 'DJ-1001',
            'type' => 'sale',
            'invoice_date' => date('Y-m-d'),
            'total_amount' => 528000,
            'user_name' => $admin->name,
        ]);

        InvoiceItem::create([
            'invoice_id' => $inv1->id,
            'product_id' => $dijlahProductModels[0]->id,
            'product_name' => $dijlahProductModels[0]->name,
            'boxes' => 2,
            'units_per_box' => 12,
            'total_pieces' => 24,
            'box_price' => 264000,
            'total_price' => 528000,
        ]);

        // 6. بذر فواتير بيع وشراء عينة لشركة دلال المسك
        $inv2 = Invoice::create([
            'company_id' => 'misk',
            'customer_id' => $miskCustomerModels[0]->id,
            'customer_name' => $miskCustomerModels[0]->name,
            'customer_address' => $miskCustomerModels[0]->address,
            'invoice_number' => 'MS-1001',
            'type' => 'sale',
            'invoice_date' => date('Y-m-d'),
            'total_amount' => 2520000,
            'user_name' => $admin->name,
        ]);

        InvoiceItem::create([
            'invoice_id' => $inv2->id,
            'product_id' => $miskProductModels[0]->id,
            'product_name' => $miskProductModels[0]->name,
            'boxes' => 1,
            'units_per_box' => 12,
            'total_pieces' => 12,
            'box_price' => 2520000,
            'total_price' => 2520000,
        ]);
    }
}
