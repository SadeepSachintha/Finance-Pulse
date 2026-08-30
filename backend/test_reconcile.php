<?php

require_once __DIR__ . '/app/Services/ReconciliationEngine.php';

use App\Services\ReconciliationEngine;

echo "=== FinancePulse Reconciliation Engine Test Suite (2-Way & 3-Way) ===\n\n";

$engine = new ReconciliationEngine();

// Test Purchase Order
$po = [
    'id' => 'po-88410-uuid',
    'po_number' => 'PO-88410',
    'items' => [
        [
            'id' => 'poi-3',
            'item_description' => 'Industrial Microcontroller Unit (MCU)',
            'quantity' => 50.00,
            'unit_price' => 150.00,
            'total_price' => 7500.00
        ],
        [
            'id' => 'poi-4',
            'item_description' => 'Precision Heat Sink Module',
            'quantity' => 40.00,
            'unit_price' => 30.00,
            'total_price' => 1200.00
        ]
    ]
];

// Test Goods Received Note (GRN - Partial Shipment: only 35 MCU units physically arrived!)
$grn = [
    'id' => 'grn-88410-uuid',
    'grn_number' => 'GRN-88410-A',
    'po_id' => 'po-88410-uuid',
    'items' => [
        [
            'id' => 'grni-3',
            'po_item_id' => 'poi-3',
            'received_quantity' => 35.00,
            'accepted_quantity' => 35.00,
            'notes' => 'Partial shipment received'
        ],
        [
            'id' => 'grni-4',
            'po_item_id' => 'poi-4',
            'received_quantity' => 40.00,
            'accepted_quantity' => 40.00,
            'notes' => 'Full shipment'
        ]
    ]
];

// Invoice Billed for Full 50 MCU units (Vendor billing for 15 unreceived units!)
$invoice = [
    'id' => 'inv-002',
    'invoice_number' => 'INV-2026-002',
    'items' => [
        [
            'description' => 'Industrial Microcontroller Unit (MCU)',
            'quantity' => 50.00, // Vendor billed 50, but GRN shows only 35 arrived!
            'unit_price' => 150.00,
            'total_price' => 7500.00
        ],
        [
            'description' => 'Precision Heat Sink Module',
            'quantity' => 40.00,
            'unit_price' => 30.00,
            'total_price' => 1200.00
        ]
    ]
];

echo "Test 1: Running 2-Way Match (Invoice vs PO-88410)...\n";
$res2Way = $engine->reconcile($invoice, $po);
echo "Result Status: " . $res2Way['status'] . "\n";
echo "Discrepancies: " . count($res2Way['discrepancies']) . "\n";

echo "\n--------------------------------------------------\n\n";

echo "Test 2: Running 3-Way Match (Invoice vs PO-88410 vs Physical GRN-88410-A)...\n";
$res3Way = $engine->reconcile3Way($invoice, $po, $grn);
echo "Result Status: " . $res3Way['status'] . "\n";
echo "Discrepancies Found (" . count($res3Way['discrepancies']) . "):\n";
foreach ($res3Way['discrepancies'] as $d) {
    echo " [!] $d\n";
}
foreach ($res3Way['items'] as $item) {
    echo " - Item: '{$item['description']}' => Status: {$item['reconciliation_status']} (GRN Accepted Qty: " . ($item['grn_received_qty'] ?? 'N/A') . ")\n";
}

echo "\n=== Test Suite Complete ===\n";
