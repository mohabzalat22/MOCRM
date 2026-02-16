<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardPreferenceController extends Controller
{
    /**
     * Update the user's dashboard preferences.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'layout' => 'nullable|array',
            'date_range' => 'nullable|string',
        ]);

        $user = Auth::user();

        $user->dashboardPreference()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'layout' => $validated['layout'] ?? $user->dashboardPreference->layout ?? [],
                'date_range' => $validated['date_range'] ?? $user->dashboardPreference->date_range ?? '30d',
            ]
        );

        return redirect()->route('dashboard', ['date_range' => $validated['date_range'] ?? $user->dashboardPreference->date_range ?? '30d'])
            ->with('success', 'Dashboard preferences updated.');
    }
}
