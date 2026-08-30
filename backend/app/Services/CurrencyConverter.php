<?php

namespace App\Services;

class CurrencyConverter
{
    protected array $exchangeRates = [
        'USD' => 1.0000,
        'EUR' => 1.0850, // 1 EUR = 1.0850 USD
        'GBP' => 1.2720, // 1 GBP = 1.2720 USD
        'JPY' => 0.0067, // 1 JPY = 0.0067 USD
        'CAD' => 0.7420, // 1 CAD = 0.7420 USD
        'AUD' => 0.6550  // 1 AUD = 0.6550 USD
    ];

    public function getRate(string $currency): float
    {
        $curr = strtoupper(trim($currency));
        return $this->exchangeRates[$curr] ?? 1.0000;
    }

    public function convertToBaseCurrency(float $amount, string $fromCurrency, float $customRate = null): float
    {
        $rate = $customRate !== null && $customRate > 0 ? $customRate : $this->getRate($fromCurrency);
        return round($amount * $rate, 2);
    }

    public function formatCurrency(float $amount, string $currency): string
    {
        $curr = strtoupper(trim($currency));
        $symbols = [
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'JPY' => '¥',
            'CAD' => 'CA$',
            'AUD' => 'A$'
        ];
        $symbol = $symbols[$curr] ?? '$';
        return $symbol . number_format($amount, 2);
    }
}
