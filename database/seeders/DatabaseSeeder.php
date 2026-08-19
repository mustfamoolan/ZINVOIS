<?php

namespace Database\Seeders;

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
        // إنشاء حساب الأدمن الافتراضي فقط
        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'المدير العام',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
            ]
        );
    }
}
