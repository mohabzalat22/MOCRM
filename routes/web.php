<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\CustomFieldController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('/clients', ClientController::class);

    // Custom field routes
    Route::post('/clients/{client}/custom-fields', [CustomFieldController::class, 'update'])
        ->name('clients.custom-fields.update');
    Route::delete('/clients/{client}/custom-fields', [CustomFieldController::class, 'destroy'])
        ->name('clients.custom-fields.destroy');

    Route::post('/tags', [TagController::class, 'store'])->name('tags.store');
    Route::delete('/{taggableType}/{taggableId}/tags/{tag}', [TagController::class, 'destroy'])
        ->name('tags.destroy');
});

require __DIR__.'/settings.php';
