<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/app/Services/ReconciliationEngine.php';
require_once __DIR__ . '/app/Services/FraudEngine.php';

use App\Services\ReconciliationEngine;
use App\Services\FraudEngine;

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
    ]
];

$approvedBanks = [
    [
        'id' => 'vab-1',
        'vendor_id' => 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'vendor_name' => 'Acme Industrial Supplies',
        'bank_name' => 'Chase Manhattan Bank',
        'routing_number' => '121000358',
        'account_number' => 'ACCT-99201100',
        'status' => 'APPROVED'
    ],
    [
        'id' => 'vab-2',
        'vendor_id' => 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'vendor_name' => 'Apex Electronics Tech',
        'bank_name' => 'Bank of America',
        'routing_number' => '026009593',
        'account_number' => 'ACCT-44118822',
        'status' => 'APPROVED'
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
    ]
];

$goodsReceivedNotes = [
    [
        'id' => 'grn-99201-uuid',
        'grn_number' => 'GRN-99201-A',
        'po_id' => 'po-99201-uuid',
        'po_number' => 'PO-99201',
        'vendor_name' => 'Acme Industrial Supplies',
        'received_at' => '2026-08-12',
        'receiver_name' => 'Warehouse Supervisor John',
        'status' => 'VERIFIED'
    ]
];

// JSON API Router
if ($uri === '/api/vendors') {
    header("Content-Type: application/json");
    echo json_encode(['status' => 'success', 'data' => $vendors]);
    exit;
}

if ($uri === '/api/approved-banks') {
    header("Content-Type: application/json");
    echo json_encode(['status' => 'success', 'data' => $approvedBanks]);
    exit;
}

if ($uri === '/api/check-fraud' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header("Content-Type: application/json");
    $input = json_decode(file_get_contents('php://input'), true);
    $invoice = $input['invoice'] ?? null;

    if (!$invoice) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing invoice parameter']);
        exit;
    }

    $fraudEngine = new FraudEngine();
    $result = $fraudEngine->assessFraudRisk($invoice, [], $approvedBanks);

    echo json_encode([
        'status' => 'success',
        'fraud_assessment' => $result
    ]);
    exit;
}

if ($uri === '/api/reconcile-3way' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header("Content-Type: application/json");
    $input = json_decode(file_get_contents('php://input'), true);
    $invoice = $input['invoice'] ?? null;
    $targetPoId = $input['po_id'] ?? null;
    $targetGrnId = $input['grn_id'] ?? null;

    $targetPo = $purchaseOrders[0];
    $targetGrn = $goodsReceivedNotes[0];

    $engine = new ReconciliationEngine();
    $result = $engine->reconcile3Way($invoice, $targetPo, $targetGrn, [], $approvedBanks);

    echo json_encode([
        'status' => 'success',
        'reconciliation' => $result
    ]);
    exit;
}

// Serve Interactive Backend Admin Web UI
header("Content-Type: text/html; charset=utf-8");
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <title>FinancePulse | Fraud Prevention & 3-Way Match Backend Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-950 text-slate-100 font-sans p-8 antialiased">
    <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-slate-800 pb-6">
            <div>
                <div class="flex items-center gap-3">
                    <span class="px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-mono font-bold">
                        Fraud Engine & SHA-256 Enabled
                    </span>
                    <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <h1 class="text-3xl font-extrabold font-heading text-slate-100 mt-2">FinancePulse Backend Security Portal</h1>
                <p class="text-sm text-slate-400 font-mono mt-1">SHA-256 Hashing • Approved Master Banks • Fraud Risk Inspector</p>
            </div>
            <a href="http://localhost:5173" target="_blank" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition">
                Open React SPA Workspace ↗
            </a>
        </div>

        <!-- Approved Vendor Banks Inspector -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 class="text-lg font-bold text-slate-200 mb-4 font-heading">Approved Vendor Master Bank Accounts (`vendor_approved_banks`)</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                    <thead>
                        <tr class="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                            <th class="p-3">Vendor Name</th>
                            <th class="p-3">Bank Name</th>
                            <th class="p-3">Routing Number</th>
                            <th class="p-3">Approved Account Number</th>
                            <th class="p-3">Security Verification</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800">
                        <?php foreach ($approvedBanks as $bank): ?>
                        <tr>
                            <td class="p-3 font-semibold text-slate-200"><?= $bank['vendor_name'] ?></td>
                            <td class="p-3 text-slate-300"><?= $bank['bank_name'] ?></td>
                            <td class="p-3 font-mono text-slate-400"><?= $bank['routing_number'] ?></td>
                            <td class="p-3 font-mono font-bold text-emerald-400"><?= $bank['account_number'] ?></td>
                            <td class="p-3 font-mono text-emerald-400 font-bold">VERIFIED_MASTER</td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- API Links -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex gap-4">
            <a href="/api/approved-banks" target="_blank" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-xs rounded-lg border border-slate-700">
                GET /api/approved-banks
            </a>
        </div>

    </div>
</body>
</html>
