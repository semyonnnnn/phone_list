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

            // Was unique(). Plain index now: the same file_id may exist once per territory,
            // and that uniqueness is enforced in PhoneRepository::sync(), since territory
            // lives on departments and an index can't span two tables.
            // I can't see your original line. I assumed nullable because sync() uses
            // whereNotNull('file_id'). Keep whatever modifiers you had, minus unique().
            $table->string('file_id')->nullable()->index();

            $table->string('person')->collation('utf8mb4_unicode_ci');
            $table->string('phone');
            $table->string('extension')->nullable();
            $table->string('cabinet')->nullable();
            $table->string('ip')->nullable();
            $table->boolean('isBoss')->default(false);
            $table->boolean('isMiniBoss')->default(false);
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        // A create migration is undone by dropping the table.
        Schema::dropIfExists('phones');
    }
};
