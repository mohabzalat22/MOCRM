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
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('email');
            $table->string('business_name')->nullable()->after('avatar_url');
            $table->string('business_logo_url')->nullable()->after('business_name');
            $table->string('timezone')->default('UTC')->after('business_logo_url');
            $table->string('date_format')->default('Y-m-d')->after('timezone');
            $table->string('currency')->default('USD')->after('date_format');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar_url',
                'business_name',
                'business_logo_url',
                'timezone',
                'date_format',
                'currency',
            ]);
        });
    }
};
