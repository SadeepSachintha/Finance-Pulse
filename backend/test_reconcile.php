<?php

require_once __DIR__ . '/app/Services/ReconciliationEngine.php';

use App\Services\ReconciliationEngine;

echo "=== FinancePulse Reconciliation Engine Test Suite ===\n\n";

$engine = new ReconciliationEngine();

// Test PO Data
$po = [
    'id' => 'po-99201-uuid',
    'po_number' => 'PO-99201',
    'items' => [
        [
            'id' => 'poi-1',
            'item_description' => 'High Performance Server Rack 42U',
            'quantity' => 2.00,
            'unit_price' => 1500.00,
            'total_price' => 3000.00
        ],
        [
            'id' => 'poi-2',
            'item_description' => 'Cat6A Shielded Ethernet Cable 100m',
            'quantity' => 10.00,
            'unit_price' => 125.00,
            'total_price' => 1250.00
        ]
    ]
];

// Test Case 1: Perfectly Matched Invoice
$matchedInvoice = [
    'id' => 'inv-001',
    'invoice_number' => 'INV-2026-001',
    'items' => [
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
    ]
];

// Test Case 2: Invoice with Price Variance & Qty Exceeded
$discrepantInvoice = [
    'id' => 'inv-002',
    'invoice_number' => 'INV-2026-002',
    'items' => [
        [
            'description' => 'High Performance Server Rack 42U',
            'quantity' => 2.00,
            'unit_price' => 1650.00, // Price mismatch ($1650 vs $1500 -> 10% diff)
            'total_price' => 3300.00
        ],
        [
            'description' => 'Cat6A Shielded Ethernet Cable 100m',
            'quantity' => 15.00, // Qty exceeded (15 vs 10)
            'unit_price' => 125.00,
            'total_price' => 1875.00
        ]
    ]
];

echo "Test 1: Running 2-Way Match on Matched Invoice (INV-2026-001)...\n";
$res1 = $engine->reconcile($matchedInvoice, $po);
echo "Status: " . $res1['status'] . "\n";
echo "Discrepancies: " . count($res1['discrepancies']) . "\n";
foreach ($res1['items'] as $item) {
    echo " - Item: '{$item['description']}' => Status: {$item['reconciliation_status']}\n";
}

echo "\n--------------------------------------------------\n\n";

echo "Test 2: Running 2-Way Match on Discrepant Invoice (INV-2026-002)...\n";
$res2 = $engine->reconcile($discrepantInvoice, $po);
echo "Status: " . $res2['status'] . "\n";
echo "Discrepancies Found (" . count($res2['discrepancies']) . "):\n";
foreach ($res2['discrepancies'] as $d) {
    echo " [!] $d\n";
}
foreach ($res2['items'] as $item) {
    echo " - Item: '{$item['description']}' => Status: {$item['reconciliation_status']}\n";
}

echo "\n=== Test Suite Complete ===\n";
