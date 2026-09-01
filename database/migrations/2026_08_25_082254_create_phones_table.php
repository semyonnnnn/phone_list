<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phones', function (Blueprint $table) {
            $table->id();
            $table->string('person')->collation('utf8mb4_unicode_ci');          // ФИО (case-insensitive for Cyrillic)
            $table->string('group')->collation('utf8mb4_unicode_ci');           // Группа (case-insensitive for Cyrillic)
            $table->string('phone');            // Телефон
            $table->string('extension');        // Добавочный
            $table->string('cabinet')->nullable(); // Разрешить пустое значение
            $table->string('ip')->nullable();      // Разрешить пустое значение
            $table->string('file_id');
            $table->boolean('isBoss')->default(false);
            $table->boolean('isMiniBoss')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phones');
    }
};
