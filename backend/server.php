<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/app/Services/ReconciliationEngine.php';

use App\Services\ReconciliationEngine;

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Mock Database State
$vendors = [
    [
        'id' => 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'name' => 'Acme Industrial Supplies',
        'tax_id' => 'US-99882211',
        'email' => 'ap@acmeindustrial.com'
    ],
    [
        'id' => 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'name' => 'Apex Electronics Tech',
        'tax_id' => 'US-44331100',
        'email' => 'billing@apexelectronics.com'
    ],
    [
        'id' => 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'name' => 'Nexus Logistics & Freight',
        'tax_id' => 'US-77665544',
        'email' => 'invoices@nexuslogistics.com'
    ]
];

$purchaseOrders = [
    [
        'id' => 'po-99201-uuid',
        'po_number' => 'PO-99201',
        'vendor_id' => 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'vendor_name' => 'Acme Industrial Supplies',
        'status' => 'OPEN',
        'total_amount' => 4250.00,
        'currency' => 'USD',
        'issued_at' => '2026-08-01',
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
    ],
    [
        'id' => 'po-88410-uuid',
        'po_number' => 'PO-88410',
        'vendor_id' => 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'vendor_name' => 'Apex Electronics Tech',
        'status' => 'OPEN',
        'total_amount' => 8700.00,
        'currency' => 'USD',
        'issued_at' => '2026-08-10',
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
    ]
];

// Router logic
if ($uri === '/api/vendors') {
    echo json_encode(['status' => 'success', 'data' => $vendors]);
    exit;
}

if ($uri === '/api/purchase-orders') {
    echo json_encode(['status' => 'success', 'data' => $purchaseOrders]);
    exit;
}

if ($uri === '/api/reconcile' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $invoice = $input['invoice'] ?? null;
    $targetPoId = $input['po_id'] ?? null;

    if (!$invoice || !$targetPoId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing invoice or po_id parameter']);
        exit;
    }

    $targetPo = null;
    foreach ($purchaseOrders as $po) {
        if ($po['id'] === $targetPoId || $po['po_number'] === $targetPoId) {
            $targetPo = $po;
            break;
        }
    }

    if (!$targetPo) {
        http_response_code(444);
        echo json_encode(['error' => "Target PO {$targetPoId} not found."]);
        exit;
    }

    $engine = new ReconciliationEngine();
    $result = $engine->reconcile($invoice, $targetPo);

    echo json_encode([
        'status' => 'success',
        'reconciliation' => $result
    ]);
    exit;
}

if ($uri === '/api/erp/sync' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $platform = $input['platform'] ?? 'QuickBooks Online';
    $invoiceNumber = $input['invoice_number'] ?? 'INV-UNKNOWN';
    $totalAmount = $input['total_amount'] ?? 0.00;

    echo json_encode([
        'status' => 'success',
        'message' => "Invoice {$invoiceNumber} (\${$totalAmount}) successfully synced to {$platform} Ledger.",
        'sync_id' => 'SYNC-' . strtoupper(substr(md5(uniqid()), 0, 10)),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// Default Healthcheck
echo json_encode([
    'service' => 'FinancePulse Backend API',
    'version' => '1.0.0',
    'reconciliation_engine' => 'Active'
]);
