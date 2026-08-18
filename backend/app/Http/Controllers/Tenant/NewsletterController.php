<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email']]);

        $subscriber = NewsletterSubscriber::updateOrCreate(
            ['email' => $data['email']],
            ['status' => 'subscribed', 'subscribed_at' => now(), 'unsubscribed_at' => null],
        );

        return response()->json($subscriber, 201);
    }

    public function unsubscribe(Request $request)
    {
        $data = $request->validate(['email' => ['required', 'email']]);

        $subscriber = NewsletterSubscriber::where('email', $data['email'])->first();
        $subscriber?->update(['status' => 'unsubscribed', 'unsubscribed_at' => now()]);

        return response()->json(['message' => 'Unsubscribed.']);
    }
}
