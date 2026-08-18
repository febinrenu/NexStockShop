<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Tenant\NewsletterSubscriber;
use Tests\TenantTestCase;

class NewsletterTest extends TenantTestCase
{
    public function test_subscribe_requires_a_valid_email(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/newsletter/subscribe'), ['email' => 'not-an-email']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    public function test_subscribe_creates_a_subscriber(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/newsletter/subscribe'), ['email' => 'shopper@example.com']);

        $response->assertCreated();
        $this->assertSame('subscribed', $response->json('status'));
    }

    public function test_subscribe_is_idempotent_for_the_same_email(): void
    {
        $this->postJson($this->tenantUrl('/api/v1/newsletter/subscribe'), ['email' => 'shopper@example.com'])->assertCreated();
        $this->postJson($this->tenantUrl('/api/v1/newsletter/subscribe'), ['email' => 'shopper@example.com'])->assertCreated();

        $this->inTenant(function () {
            $this->assertSame(1, NewsletterSubscriber::where('email', 'shopper@example.com')->count());
        });
    }

    public function test_unsubscribe_marks_the_subscriber_unsubscribed(): void
    {
        $this->postJson($this->tenantUrl('/api/v1/newsletter/subscribe'), ['email' => 'shopper@example.com'])->assertCreated();

        $response = $this->postJson($this->tenantUrl('/api/v1/newsletter/unsubscribe'), ['email' => 'shopper@example.com']);

        $response->assertOk();

        $this->inTenant(function () {
            $subscriber = NewsletterSubscriber::where('email', 'shopper@example.com')->first();
            $this->assertSame('unsubscribed', $subscriber->status);
        });
    }

    public function test_unsubscribe_is_safe_for_an_unknown_email(): void
    {
        $response = $this->postJson($this->tenantUrl('/api/v1/newsletter/unsubscribe'), ['email' => 'ghost@example.com']);

        $response->assertOk();
    }
}
