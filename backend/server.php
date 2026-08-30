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
require_once __DIR__ . '/app/Services/CurrencyConverter.php';

use App\Services\ReconciliationEngine;
use App\Services\FraudEngine;
use App\Services\CurrencyConverter;

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

$vendorAliases = [
    [
        'id' => 'via-1',
        'vendor_id' => 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'vendor_name' => 'Acme Industrial Supplies',
        'extracted_description' => 'High Perf Server Chassis 42U',
        'mapped_po_description' => 'High Performance Server Rack 42U',
        'times_used' => 5
    ],
    [
        'id' => 'via-2',
        'vendor_id' => 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'vendor_name' => 'Apex Electronics Tech',
        'extracted_description' => 'MCU Microcontroller Chip',
        'mapped_po_description' => 'Industrial Microcontroller Unit (MCU)',
        'times_used' => 12
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

if ($uri === '/api/aliases') {
    header("Content-Type: application/json");
    echo json_encode(['status' => 'success', 'data' => $vendorAliases]);
    exit;
}

if ($uri === '/api/aliases/learn' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header("Content-Type: application/json");
    $input = json_decode(file_get_contents('php://input'), true);
    $extracted = $input['extracted_description'] ?? '';
    $mapped = $input['mapped_po_description'] ?? '';
    $vendorName = $input['vendor_name'] ?? 'Acme Industrial Supplies';

    $newAlias = [
        'id' => 'via-' . (count($vendorAliases) + 1),
        'vendor_id' => 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'vendor_name' => $vendorName,
        'extracted_description' => $extracted,
        'mapped_po_description' => $mapped,
        'times_used' => 1
    ];

    echo json_encode([
        'status' => 'success',
        'message' => "Learned mapping: '{$extracted}' => '{$mapped}' saved for {$vendorName}!",
        'alias' => $newAlias
    ]);
    exit;
}

if ($uri === '/api/reconcile-3way' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header("Content-Type: application/json");
    $input = json_decode(file_get_contents('php://input'), true);
    $invoice = $input['invoice'] ?? null;
    $targetPoId = $input['po_id'] ?? null;
    $freightAmount = (float)($input['freight_amount'] ?? 0.0);
    $taxAmount = (float)($input['tax_amount'] ?? 0.0);
    $currency = $input['currency'] ?? 'USD';
    $exchangeRate = (float)($input['exchange_rate'] ?? 1.0000);

    $targetPo = $purchaseOrders[0];
    $targetGrn = $goodsReceivedNotes[0];

    $engine = new ReconciliationEngine();
    $result = $engine->reconcile3Way(
        $invoice, 
        $targetPo, 
        $targetGrn, 
        [], 
        $approvedBanks, 
        $vendorAliases, 
        $freightAmount, 
        $taxAmount,
        $currency,
        $exchangeRate
    );

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
    <title>FinancePulse by SS Labz | Security & Multi-Currency Admin Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-950 text-slate-100 font-sans p-8 antialiased">
    <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-slate-800 pb-6">
            <div>
                <div class="flex items-center gap-3">
                    <span class="px-3 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-mono font-bold">
                        A Product of SS Labz
                    </span>
                    <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <h1 class="text-3xl font-extrabold font-heading text-slate-100 mt-2">FinancePulse Security Portal</h1>
                <p class="text-sm text-slate-400 font-mono mt-1">FinancePulse by SS Labz • Multi-Currency, Vendor Memory & Fraud Shield</p>
            </div>
            <a href="http://localhost:5173" target="_blank" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition">
                Open React SPA Workspace ↗
            </a>
        </div>

        <!-- Vendor Self-Learning Aliases Inspector -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 class="text-lg font-bold text-slate-200 mb-4 font-heading">Vendor Self-Learning Memory Aliases (`vendor_item_aliases` table)</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                    <thead>
                        <tr class="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                            <th class="p-3">Vendor Name</th>
                            <th class="p-3">Extracted OCR Text</th>
                            <th class="p-3">Mapped PO Description</th>
                            <th class="p-3 text-center">Times Re-Used</th>
                            <th class="p-3">Match Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800">
                        <?php foreach ($vendorAliases as $alias): ?>
                        <tr>
                            <td class="p-3 font-semibold text-slate-200"><?= $alias['vendor_name'] ?></td>
                            <td class="p-3 font-mono text-indigo-300"><?= $alias['extracted_description'] ?></td>
                            <td class="p-3 font-mono text-emerald-400"><?= $alias['mapped_po_description'] ?></td>
                            <td class="p-3 text-center font-mono font-bold text-sky-400"><?= $alias['times_used'] ?>x</td>
                            <td class="p-3 font-mono text-sky-400 font-bold">100% LEARNED MATCH</td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- API Links -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 flex gap-4">
            <a href="/api/aliases" target="_blank" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-xs rounded-lg border border-slate-700">
                GET /api/aliases (Learned Item Memory)
            </a>
            <a href="/api/approved-banks" target="_blank" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-xs rounded-lg border border-slate-700">
                GET /api/approved-banks
            </a>
        </div>

    </div>
</body>
</html>
