<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Central\ModerationFlag;
use App\Models\Tenant\Review;
use Tests\TenantTestCase;

class ReviewTest extends TenantTestCase
{
    public function test_store_requires_customer_auth(): void
    {
        $seeded = $this->seedProduct();

        $response = $this->postJson($this->tenantUrl('/api/v1/reviews'), [
            'product_id' => $seeded['product']->id,
            'rating' => 5,
        ]);

        $response->assertUnauthorized();
    }

    public function test_store_validates_rating_range(): void
    {
        $seeded = $this->seedProduct();
        $customer = $this->makeCustomer();

        $response = $this->withToken($customer['token'])->postJson($this->tenantUrl('/api/v1/reviews'), [
            'product_id' => $seeded['product']->id,
            'rating' => 6,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('rating');
    }

    public function test_store_creates_a_pending_review_and_a_moderation_flag(): void
    {
        $seeded = $this->seedProduct();
        $customer = $this->makeCustomer();

        $response = $this->withToken($customer['token'])->postJson($this->tenantUrl('/api/v1/reviews'), [
            'product_id' => $seeded['product']->id,
            'rating' => 4,
            'title' => 'Pretty good',
            'body' => 'Solid product.',
        ]);

        $response->assertCreated();
        $this->assertSame('pending', $response->json('status'));

        $reviewId = $response->json('id');

        $flag = ModerationFlag::where('flaggable_type', Review::class)
            ->where('flaggable_id', (string) $reviewId)
            ->first();

        $this->assertNotNull($flag);
        $this->assertSame('pending', $flag->status);
        $this->assertSame($this->tenant->id, $flag->tenant_id);
    }
}
