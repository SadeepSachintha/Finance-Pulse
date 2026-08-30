<?php

require_once __DIR__ . '/app/Services/ReconciliationEngine.php';
require_once __DIR__ . '/app/Services/FraudEngine.php';

use App\Services\ReconciliationEngine;

echo "=== FinancePulse Reconciliation, Vendor Memory & Freight/Tax Splitter Test Suite ===\n\n";

$reconcileEngine = new ReconciliationEngine();

$items = [
    [
        'description' => 'High Performance Server Rack 42U',
        'quantity' => 2.00,
        'unit_price' => 1500.00,
        'total_price' => 3000.00
    ],
    [
        'description' => 'Cat6A Shielded Ethernet Cable 100m',
        'quantity' => 10.00,
        'unit_price' => 125.00,
        'total_price' => 1250.00
    ]
];

$freightAmount = 150.00;
$taxAmount = 240.00;

echo "Test 1: Testing Proportional Header Fee Allocation (Freight \$150, Tax \$240)...\n";
$allocatedItems = $reconcileEngine->allocateHeaderFees($items, $freightAmount, $taxAmount);

foreach ($allocatedItems as $idx => $it) {
    echo "Item " . ($idx + 1) . ": " . $it['description'] . "\n";
    echo "  Weight Ratio: " . $it['weight_ratio'] . "%\n";
    echo "  Allocated Freight: \$" . $it['allocated_freight'] . "\n";
    echo "  Allocated Tax: \$" . $it['allocated_tax'] . "\n";
    echo "  Base Unit Price: \$" . $it['unit_price'] . "\n";
    echo "  Landed Unit Cost: \$" . $it['landed_unit_cost'] . "\n\n";
}

echo "=== Test Suite Complete ===\n";
