<?php

declare(strict_types=1);

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\ModerationFlag;
use Illuminate\Http\Request;

/**
 * Workstream E — Content Moderation (brief §4.5). Manual flagging plus a
 * review queue ships first; auto-flagging rules are a fast-follow.
 */
class ModerationController extends Controller
{
    public function index(Request $request)
    {
        $flags = ModerationFlag::query()
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(25);

        return response()->json($flags);
    }

    public function action(Request $request, ModerationFlag $flag)
    {
        $data = $request->validate([
            'status' => ['required', 'in:actioned,dismissed'],
        ]);

        $flag->update([
            'status' => $data['status'],
            'actioned_by' => $request->user('platform')->id,
            'actioned_at' => now(),
        ]);

        return response()->json($flag);
    }
}
