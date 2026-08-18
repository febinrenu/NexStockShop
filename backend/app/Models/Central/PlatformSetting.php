<?php

declare(strict_types=1);

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class PlatformSetting extends Model
{
    use CentralConnection;

    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'array'];
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return static::query()->where('key', $key)->value('value') ?? $default;
    }

    public static function set(string $key, mixed $value): self
    {
        return static::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
