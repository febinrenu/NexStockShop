<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryTranslation extends Model
{
    protected $fillable = ['category_id', 'locale', 'name', 'description'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
