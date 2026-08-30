<?php

require_once __DIR__ . '/app/Services/ReconciliationEngine.php';
require_once __DIR__ . '/app/Services/CurrencyConverter.php';

use App\Services\ReconciliationEngine;
use App\Services\CurrencyConverter;

echo "=== FinancePulse Reconciliation & Multi-Currency Forex Test Suite ===\n\n";

$reconcileEngine = new ReconciliationEngine();
$converter = new CurrencyConverter();

$po = [
    'id' => 'po-99201-uuid',
    'po_number' => 'PO-99201',
    'items' => [
        [
            'id' => 'poi-1',
            'item_description' => 'High Performance Server Rack 42U',
            'quantity' => 2.00,
            'unit_price' => 1500.00, // $1500 USD
            'total_price' => 3000.00
        ]
    ]
];

$grn = [
    'id' => 'grn-99201-uuid',
    'grn_number' => 'GRN-99201-A',
    'items' => [
        [
            'po_item_id' => 'poi-1',
            'accepted_quantity' => 2.00
        ]
    ]
];

// Foreign Invoice in EUR (€1382.49 EUR @ 1.0850 = $1500 USD)
$invoiceEur = [
    'invoice_number' => 'INV-2026-EUR',
    'vendor_name' => 'Acme Industrial Supplies',
    'total_amount' => 2764.98,
    'items' => [
        [
            'description' => 'High Performance Server Rack 42U',
            'quantity' => 2.00,
            'unit_price' => 1382.49, // €1382.49 EUR
            'total_price' => 2764.98
        ]
    ]
];

echo "Test 1: Running 3-Way Match on EUR (€) Invoice converted to USD at 1.0850...\n";
$res = $reconcileEngine->reconcile3Way($invoiceEur, $po, $grn, [], [], [], 0, 0, 'EUR', 1.0850);

echo "Final Status: " . $res['status'] . "\n";
echo "Invoice Currency: " . $res['currency'] . "\n";
echo "Exchange Rate: 1 EUR = " . $res['exchange_rate'] . " USD\n";
echo "Billed Unit Price (EUR): €" . $res['items'][0]['unit_price'] . "\n";
echo "Converted USD Price: \$" . $res['items'][0]['unit_price_usd'] . " USD\n";
echo "PO Target Unit Price: \$" . $po['items'][0]['unit_price'] . " USD\n";
echo "Item Status: " . $res['items'][0]['reconciliation_status'] . "\n\n";

echo "=== Test Suite Complete ===\n";
