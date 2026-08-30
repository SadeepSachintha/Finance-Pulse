<?php

require_once __DIR__ . '/app/Services/ReconciliationEngine.php';
require_once __DIR__ . '/app/Services/FraudEngine.php';

use App\Services\ReconciliationEngine;

echo "=== FinancePulse Reconciliation & Vendor Self-Learning Test Suite ===\n\n";

$reconcileEngine = new ReconciliationEngine();

$vendorAliases = [
    [
        'vendor_id' => 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'extracted_description' => 'High Perf Server Chassis 42U', // Abbreviated text extracted by OCR!
        'mapped_po_description' => 'High Performance Server Rack 42U' // Master PO description
    ]
];

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
        ]
    ]
];

$invoiceWithAbbreviation = [
    'invoice_number' => 'INV-2026-004',
    'vendor_name' => 'Acme Industrial Supplies',
    'total_amount' => 3000.00,
    'items' => [
        [
            'description' => 'High Perf Server Chassis 42U', // Extracted OCR text with abbreviation
            'quantity' => 2.00,
            'unit_price' => 1500.00,
            'total_price' => 3000.00
        ]
    ]
];

echo "Test 1: Running Match using Vendor Self-Learning Memory (INV-2026-004)...\n";
$res = $reconcileEngine->reconcile($invoiceWithAbbreviation, $po, [], [], $vendorAliases);

echo "Final Status: " . $res['status'] . "\n";
echo "Item Status: " . $res['items'][0]['reconciliation_status'] . "\n";
echo "Is Learned Alias: " . ($res['items'][0]['is_learned_alias'] ? 'YES (100% Learned Memory Match)' : 'NO') . "\n";

echo "\n=== Test Suite Complete ===\n";
