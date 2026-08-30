<?php

namespace App\Services;

require_once __DIR__ . '/FraudEngine.php';

use App\Services\FraudEngine;

class ReconciliationEngine
{
    protected float $priceTolerancePercent = 1.0;
    protected FraudEngine $fraudEngine;

    public function __construct()
    {
        $this->fraudEngine = new FraudEngine();
    }

    /**
     * Run 2-Way Match between Invoice and Purchase Order.
     */
    public function reconcile($invoice, $po, array $existingInvoices = [], array $approvedBanks = []): array
    {
        $discrepancies = [];
        $invoiceItems = is_array($invoice['items']) ? $invoice['items'] : [];
        $poItems = is_array($po['items']) ? $po['items'] : [];

        // Run Fraud Risk Assessment
        $fraudAssessment = $this->fraudEngine->assessFraudRisk($invoice, $existingInvoices, $approvedBanks);
        if ($fraudAssessment['is_fraud_flagged']) {
            foreach ($fraudAssessment['fraud_flags'] as $flag) {
                $discrepancies[] = "SECURITY ALERT: " . $flag;
            }
        }

        $allMatched = !$fraudAssessment['is_fraud_flagged'];
        $updatedItems = [];

        foreach ($invoiceItems as $invItem) {
            $itemDesc = $invItem['description'] ?? '';
            $invQty = (float)($invItem['quantity'] ?? 0);
            $invPrice = (float)($invItem['unit_price'] ?? 0);

            $matchedPoItem = $this->findBestMatchingPoItem($itemDesc, $poItems);
            if (!$matchedPoItem) {
                $invItem['reconciliation_status'] = 'UNMATCHED_ITEM';
                $discrepancies[] = "Item '{$itemDesc}' not found on PO {$po['po_number']}.";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            $poQty = (float)($matchedPoItem['quantity'] ?? 0);
            $poPrice = (float)($matchedPoItem['unit_price'] ?? 0);

            if ($invQty > $poQty) {
                $invItem['reconciliation_status'] = 'QTY_EXCEEDED';
                $discrepancies[] = "Item '{$itemDesc}' exceeds PO quantity ({$invQty} vs {$poQty}).";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            $priceDiffPercent = $poPrice > 0 ? abs(($invPrice - $poPrice) / $poPrice) * 100 : 0;
            if ($priceDiffPercent > $this->priceTolerancePercent) {
                $invItem['reconciliation_status'] = 'PRICE_MISMATCH';
                $discrepancies[] = "Item '{$itemDesc}' price variance exceeds limit (\${$invPrice} vs \${$poPrice}, " . round($priceDiffPercent, 1) . "% diff).";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            $invItem['reconciliation_status'] = 'MATCHED';
            $updatedItems[] = $invItem;
        }

        $finalStatus = (count($invoiceItems) > 0 && $allMatched) ? 'MATCHED' : 'DISCREPANCY';

        return [
            'mode' => '2-Way',
            'status' => $finalStatus,
            'fraud_assessment' => $fraudAssessment,
            'discrepancies' => $discrepancies,
            'items' => $updatedItems,
            'matched_po_id' => $po['id'] ?? null,
            'po_number' => $po['po_number'] ?? null
        ];
    }

    /**
     * Run 3-Way Match between Invoice, Purchase Order, and Goods Received Note (GRN).
     */
    public function reconcile3Way($invoice, $po, $grn, array $existingInvoices = [], array $approvedBanks = []): array
    {
        $discrepancies = [];
        $invoiceItems = is_array($invoice['items']) ? $invoice['items'] : [];
        $poItems = is_array($po['items']) ? $po['items'] : [];
        $grnItems = is_array($grn['items']) ? $grn['items'] : [];

        // Run Fraud Risk Assessment
        $fraudAssessment = $this->fraudEngine->assessFraudRisk($invoice, $existingInvoices, $approvedBanks);
        if ($fraudAssessment['is_fraud_flagged']) {
            foreach ($fraudAssessment['fraud_flags'] as $flag) {
                $discrepancies[] = "SECURITY ALERT: " . $flag;
            }
        }

        $allMatched = !$fraudAssessment['is_fraud_flagged'];
        $updatedItems = [];

        foreach ($invoiceItems as $invItem) {
            $itemDesc = $invItem['description'] ?? '';
            $invQty = (float)($invItem['quantity'] ?? 0);
            $invPrice = (float)($invItem['unit_price'] ?? 0);

            $matchedPoItem = $this->findBestMatchingPoItem($itemDesc, $poItems);
            if (!$matchedPoItem) {
                $invItem['reconciliation_status'] = 'UNMATCHED_ITEM';
                $discrepancies[] = "Item '{$itemDesc}' not found on PO {$po['po_number']}.";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            $poQty = (float)($matchedPoItem['quantity'] ?? 0);
            $poPrice = (float)($matchedPoItem['unit_price'] ?? 0);

            $matchedGrnItem = $this->findBestMatchingGrnItem($matchedPoItem['id'] ?? '', $itemDesc, $grnItems);
            $grnAcceptedQty = $matchedGrnItem ? (float)($matchedGrnItem['accepted_quantity'] ?? $matchedGrnItem['received_quantity'] ?? 0) : 0;

            if ($invQty > $grnAcceptedQty) {
                $invItem['reconciliation_status'] = 'GRN_MISMATCH';
                $invItem['grn_received_qty'] = $grnAcceptedQty;
                $discrepancies[] = "3-WAY ALERT: Item '{$itemDesc}' billed quantity ({$invQty}) exceeds physical warehouse receipt ({$grnAcceptedQty} on {$grn['grn_number']}). Short-shipment detected!";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            if ($invQty > $poQty) {
                $invItem['reconciliation_status'] = 'QTY_EXCEEDED';
                $invItem['grn_received_qty'] = $grnAcceptedQty;
                $discrepancies[] = "Item '{$itemDesc}' exceeds PO quantity ({$invQty} vs {$poQty}).";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            $priceDiffPercent = $poPrice > 0 ? abs(($invPrice - $poPrice) / $poPrice) * 100 : 0;
            if ($priceDiffPercent > $this->priceTolerancePercent) {
                $invItem['reconciliation_status'] = 'PRICE_MISMATCH';
                $invItem['grn_received_qty'] = $grnAcceptedQty;
                $discrepancies[] = "Item '{$itemDesc}' price variance exceeds limit (\${$invPrice} vs \${$poPrice}, " . round($priceDiffPercent, 1) . "% diff).";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            $invItem['reconciliation_status'] = 'MATCHED';
            $invItem['grn_received_qty'] = $grnAcceptedQty;
            $updatedItems[] = $invItem;
        }

        $finalStatus = (count($invoiceItems) > 0 && $allMatched) ? 'MATCHED' : 'DISCREPANCY';

        return [
            'mode' => '3-Way',
            'status' => $finalStatus,
            'fraud_assessment' => $fraudAssessment,
            'discrepancies' => $discrepancies,
            'items' => $updatedItems,
            'matched_po_id' => $po['id'] ?? null,
            'po_number' => $po['po_number'] ?? null,
            'matched_grn_id' => $grn['id'] ?? null,
            'grn_number' => $grn['grn_number'] ?? null
        ];
    }

    public function findBestMatchingPoItem(string $description, array $poItems)
    {
        $bestMatch = null;
        $highestSimilarity = 0;

        foreach ($poItems as $item) {
            $poDesc = $item['item_description'] ?? $item['description'] ?? '';
            similar_text(strtolower($description), strtolower($poDesc), $percent);
            if ($percent > $highestSimilarity && $percent >= 60.0) {
                $highestSimilarity = $percent;
                $bestMatch = $item;
            }
        }

        return $bestMatch;
    }

    public function findBestMatchingGrnItem(string $poItemId, string $description, array $grnItems)
    {
        foreach ($grnItems as $gItem) {
            if (isset($gItem['po_item_id']) && $gItem['po_item_id'] === $poItemId) {
                return $gItem;
            }
        }

        foreach ($grnItems as $gItem) {
            $gDesc = $gItem['item_description'] ?? $gItem['notes'] ?? '';
            similar_text(strtolower($description), strtolower($gDesc), $percent);
            if ($percent >= 50.0) {
                return $gItem;
            }
        }

        return null;
    }
}
