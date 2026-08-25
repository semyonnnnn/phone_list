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
            $table->string('fio');          // ФИО
            $table->string('phone');        // Телефон
            $table->string('extension');    // Добавочный
            $table->string('cabinet');      // Кабинет
            $table->string('ip');           // IP
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phones');
    }
};
