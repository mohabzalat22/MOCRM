<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CustomFieldController;
use App\Http\Controllers\ReminderController;
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
    Route::post('/clients/bulk-update', [ClientController::class, 'bulkUpdate'])->name('clients.bulk-update');

    // Custom field routes
    Route::post('/clients/{client}/custom-fields', [CustomFieldController::class, 'update'])
        ->name('clients.custom-fields.update');

    // Tags routes
    Route::post('/tags', [TagController::class, 'store'])->name('tags.store');
    Route::delete('/{taggableType}/{taggableId}/tags/{tag}', [TagController::class, 'destroy'])
        ->name('tags.destroy');

    // Activity routes
    Route::post(
        '/clients/{client}/activities',
        [ActivityController::class, 'store']
    )->name('clients.activities.store');
    Route::patch('/activities/{activity}', [ActivityController::class, 'update'])->name('activities.update');
    Route::delete('/activities/{activity}', [ActivityController::class, 'destroy'])->name('activities.destroy');

    // Reminder routes
    Route::resource('/reminders', ReminderController::class);
    Route::post('/notifications/mark-as-read', [ReminderController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::post('/notifications/{id}/mark-as-read', [ReminderController::class, 'markNotificationAsRead'])->name('notifications.mark-one-as-read');
});

require __DIR__.'/settings.php';
