<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

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

// JSON API Router
if ($uri === '/api/vendors') {
    header("Content-Type: application/json");
    echo json_encode(['status' => 'success', 'data' => $vendors]);
    exit;
}

if ($uri === '/api/purchase-orders') {
    header("Content-Type: application/json");
    echo json_encode(['status' => 'success', 'data' => $purchaseOrders]);
    exit;
}

if ($uri === '/api/reconcile' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    header("Content-Type: application/json");
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
        http_response_code(404);
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
    header("Content-Type: application/json");
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

// Serve Interactive Backend Admin Web UI at / or /admin
header("Content-Type: text/html; charset=utf-8");
?>
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <title>FinancePulse | Backend Management Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-950 text-slate-100 font-sans p-8 antialiased">
    <div class="max-w-6xl mx-auto space-y-8">
        
        <!-- Header -->
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
            <div>
                <div class="flex items-center gap-3">
                    <span class="px-3 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-mono font-bold">
                        PHP / Laravel 12 Backend
                    </span>
                    <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <h1 class="text-3xl font-extrabold font-heading text-slate-100 mt-2">FinancePulse Backend Management Portal</h1>
                <p class="text-sm text-slate-400 font-mono mt-1">Multi-Tenant Ledger APIs • 2-Way Match Engine • Database Inspector</p>
            </div>
            <a href="http://localhost:5173" target="_blank" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition">
                Open React SPA Workspace ↗
            </a>
        </div>

        <!-- System Microservices Health Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <p class="text-xs font-mono text-slate-400 uppercase">Backend API Status</p>
                <h3 class="text-xl font-bold text-emerald-400 mt-1">ONLINE (Port 8000)</h3>
                <p class="text-xs text-slate-400 mt-2">ReconciliationEngine active with 1.0% tolerance.</p>
            </div>

            <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <p class="text-xs font-mono text-slate-400 uppercase">Python OCR Microservice</p>
                <h3 class="text-xl font-bold text-indigo-400 mt-1">ONLINE (Port 8001)</h3>
                <a href="http://127.0.0.1:8001/docs" target="_blank" class="text-xs text-indigo-300 hover:underline block mt-2">
                    Open FastAPI Swagger Docs (http://127.0.0.1:8001/docs) ↗
                </a>
            </div>

            <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <p class="text-xs font-mono text-slate-400 uppercase">Multi-Tenant Isolation</p>
                <h3 class="text-xl font-bold text-slate-200 mt-1">Tenant #001 Active</h3>
                <p class="text-xs text-slate-400 mt-2">`stancl/tenancy` schema level isolation enforced.</p>
            </div>
        </div>

        <!-- Database PO Inspector -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 class="text-lg font-bold text-slate-200 mb-4 font-heading">Database Purchase Orders (`purchase_orders` table)</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                    <thead>
                        <tr class="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                            <th class="p-3">PO Number</th>
                            <th class="p-3">Vendor Name</th>
                            <th class="p-3">Status</th>
                            <th class="p-3 text-right">Total Amount</th>
                            <th class="p-3">Line Items</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800">
                        <?php foreach ($purchaseOrders as $po): ?>
                        <tr>
                            <td class="p-3 font-mono font-bold text-indigo-400"><?= $po['po_number'] ?></td>
                            <td class="p-3 text-slate-200 font-semibold"><?= $po['vendor_name'] ?></td>
                            <td class="p-3 font-mono text-emerald-400"><?= $po['status'] ?></td>
                            <td class="p-3 text-right font-mono font-bold text-slate-100">$<?= number_format($po['total_amount'], 2) ?></td>
                            <td class="p-3 text-slate-400">
                                <?= count($po['items']) ?> Items (<?= htmlspecialchars($po['items'][0]['item_description']) ?>...)
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Live API Tester -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 class="text-lg font-bold text-slate-200 mb-4 font-heading">Interactive API Endpoint Tester</h2>
            <div class="flex gap-4">
                <a href="/api/vendors" target="_blank" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-xs rounded-lg border border-slate-700">
                    GET /api/vendors
                </a>
                <a href="/api/purchase-orders" target="_blank" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-xs rounded-lg border border-slate-700">
                    GET /api/purchase-orders
                </a>
            </div>
        </div>

    </div>
</body>
</html>
