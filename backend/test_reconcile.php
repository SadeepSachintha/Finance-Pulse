<?php

require_once __DIR__ . '/app/Services/ReconciliationEngine.php';
require_once __DIR__ . '/app/Services/FraudEngine.php';

use App\Services\ReconciliationEngine;
use App\Services\FraudEngine;

echo "=== FinancePulse Reconciliation & Fraud Engine Test Suite ===\n\n";

$reconcileEngine = new ReconciliationEngine();
$fraudEngine = new FraudEngine();

$approvedBanks = [
    [
        'vendor_id' => 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'account_number' => 'ACCT-99201100'
    ]
];

// Test 1: Fraudulent Bank Account Remittance Detection
$fraudulentInvoice = [
    'invoice_number' => 'INV-2026-999',
    'vendor_name' => 'Acme Industrial Supplies',
    'vendor_bank_account' => 'SUSPICIOUS-FRAUD-BANK-99999', // Altered bank!
    'total_amount' => 4250.00,
    'items' => [
        [
            'description' => 'High Performance Server Rack 42U',
            'quantity' => 2.00,
            'unit_price' => 1500.00,
            'total_price' => 3000.00
        ]
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

echo "Test 1: Running Fraud Risk Assessment on Fraudulent Invoice (INV-2026-999)...\n";
$fraudResult = $fraudEngine->assessFraudRisk($fraudulentInvoice, [], $approvedBanks);

echo "Fraud Risk Score: " . $fraudResult['fraud_risk_score'] . "% (" . $fraudResult['fraud_risk_level'] . ")\n";
echo "Bank Verification: " . $fraudResult['bank_verification'] . "\n";
echo "Security Flags Found (" . count($fraudResult['fraud_flags']) . "):\n";
foreach ($fraudResult['fraud_flags'] as $flag) {
    echo " [!] $flag\n";
}

echo "\n--------------------------------------------------\n\n";

echo "Test 2: Running 2-Way Match with Fraud Assessment Integration...\n";
$reconcileRes = $reconcileEngine->reconcile($fraudulentInvoice, $po, [], $approvedBanks);
echo "Final Invoice Status: " . $reconcileRes['status'] . "\n";
echo "Discrepancies / Security Alerts (" . count($reconcileRes['discrepancies']) . "):\n";
foreach ($reconcileRes['discrepancies'] as $d) {
    echo " [!] $d\n";
}

echo "\n=== Test Suite Complete ===\n";
