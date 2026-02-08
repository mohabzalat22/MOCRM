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
        Schema::table('tasks', function (Blueprint $table) {
            $table->boolean('is_milestone')->default(false)->after('completed_at');
            $table->foreignId('parent_id')->nullable()->after('is_milestone')->constrained('tasks')->onDelete('set null');
            $table->date('start_date')->nullable()->after('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['is_milestone', 'parent_id', 'start_date']);
        });
    }
};
