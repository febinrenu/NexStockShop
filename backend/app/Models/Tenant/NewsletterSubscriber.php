<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    protected $fillable = ['email', 'status', 'subscribed_at', 'unsubscribed_at'];

    protected function casts(): array
    {
        return ['subscribed_at' => 'datetime', 'unsubscribed_at' => 'datetime'];
    }
}
