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
        Schema::table('reminders', function (Blueprint $table) {
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_pattern')->nullable()->after('is_recurring'); // daily, weekly, monthly, quarterly, yearly, custom
            $table->integer('recurrence_interval')->nullable()->default(1)->after('recurrence_pattern');
            $table->date('recurrence_end_date')->nullable()->after('recurrence_interval');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reminders', function (Blueprint $table) {
            $table->dropColumn([
                'is_recurring',
                'recurrence_pattern',
                'recurrence_interval',
                'recurrence_end_date',
            ]);
        });
    }
};
