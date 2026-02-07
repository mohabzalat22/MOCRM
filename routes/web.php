<?php

use App\Actions\Reminders\BulkActionReminder;
use App\Actions\Reminders\CompleteReminder;
use App\Actions\Reminders\MarkNotificationAsRead;
use App\Actions\Reminders\MarksAllNotificationsAsRead;
use App\Actions\Reminders\SnoozeReminder;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CustomFieldController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

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
    Route::put('/reminders/{reminder}/complete', [CompleteReminder::class, 'execute'])->name('reminders.complete');
    Route::put('/reminders/{reminder}/snooze', [SnoozeReminder::class, 'execute'])->name('reminders.snooze');
    Route::post('/reminders/bulk-action', [BulkActionReminder::class, 'execute'])->name('reminders.bulk-action');
    Route::resource('/reminders', ReminderController::class);

    // Project routes
    Route::resource('/projects', ProjectController::class)->except(['create', 'edit']);

    // Task routes
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::patch('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::put('/tasks/{task}/toggle-complete', [TaskController::class, 'toggleComplete'])->name('tasks.toggle-complete');
    Route::post('/tasks/reorder', [TaskController::class, 'reorder'])->name('tasks.reorder');
    Route::post('/tasks/bulk-complete', [TaskController::class, 'bulkComplete'])->name('tasks.bulk-complete');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    // Notifications actions
    Route::post('/notifications/mark-as-read', [MarksAllNotificationsAsRead::class, 'execute'])->name('notifications.mark-as-read');
    Route::post('/notifications/{id}/mark-as-read', [MarkNotificationAsRead::class, 'execute'])->name('notifications.mark-one-as-read');
});

require __DIR__.'/settings.php';
