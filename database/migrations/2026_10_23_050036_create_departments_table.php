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

            // _ci means case is ignored, so "Отдел" and "отдел" count as the same name.
            $table->string('name')->collation('utf8mb4_unicode_ci');

            // Constrained strictly to the allowed enum values (ЕКБ or КРГ)
            // Allowed DB values come from the enum keys, so the DB enforces them too.
            $table->enum('territory', Territory::keys())
                // ->name, not ->value: the column holds keys, so the default must be a key.
                ->default(Territory::ekb->name);

            $table->timestamps();

            // One row per (name, territory) pair, not per name. Name goes first because
            // most lookups filter by name, and the index can serve those on its own.
            $table->unique(['name', 'territory']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
