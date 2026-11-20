<?php

use App\Enums\Territory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();

            $table->string('name')->collation('utf8mb4_unicode_ci');
            $table->enum('territory', Territory::keys())->default(Territory::ekb->name);

            $table->timestamps();

            $table->unique(['name', 'territory']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
