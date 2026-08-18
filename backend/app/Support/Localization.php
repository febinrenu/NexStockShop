<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Resolves the locale for a catalog/content request (§2.6 of the Person A
 * plan): Accept-Language header first, falling back to a ?lang= query
 * param for simple testing, defaulting to English.
 */
class Localization
{
    public const SUPPORTED = ['en', 'ar'];

    public static function resolve(Request $request): string
    {
        $lang = $request->query('lang');

        if (is_string($lang) && in_array($lang, self::SUPPORTED, true)) {
            return $lang;
        }

        $header = $request->getPreferredLanguage(self::SUPPORTED);

        return $header ?? 'en';
    }
}
