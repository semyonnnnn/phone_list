<?php

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
            // The default is for the upload: syncByName / resolveFileNames create
            // departments from a file's group names and don't pass a territory yet.
            // Without a default, MariaDB in strict mode rejects those inserts.
            // Keep it equal to Department::TERRITORIES[0].
            $table->string('territory')->default('ЕКБ')->collation('utf8mb4_unicode_ci');

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
