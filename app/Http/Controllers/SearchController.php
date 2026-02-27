<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Client;
use App\Models\Project;
use App\Models\Tag;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'q' => 'nullable|string|max:255',
        ]);

        $query = $request->input('q');

        if (empty($query)) {
            return response()->json([
                'clients' => [],
                'projects' => [],
                'activities' => [],
                'tags' => [],
            ]);
        }

        $clients = Client::where('name', 'like', "%{$query}%")
            ->orWhere('company_name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'company_name']);

        $projects = Project::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name']);

        $activities = Activity::where('summary', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'summary']);

        $tags = Tag::where('name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'color']);

        return response()->json([
            'clients' => $clients,
            'projects' => $projects,
            'activities' => $activities,
            'tags' => $tags,
        ]);
    }
}
