<?php

namespace App\Services;

class ReconciliationEngine
{
    protected float $priceTolerancePercent = 1.0; // Allowed 1% variance

    /**
     * Run 2-way match between an Invoice and a target Purchase Order array/object data.
     * Works seamlessly in Laravel Eloquent models or array structures.
     */
    public function reconcile($invoice, $po): array
    {
        $discrepancies = [];
        $invoiceItems = is_array($invoice['items']) ? $invoice['items'] : [];
        $poItems = is_array($po['items']) ? $po['items'] : [];

        $allMatched = true;
        $updatedItems = [];

        foreach ($invoiceItems as $invItem) {
            $itemDesc = $invItem['description'] ?? '';
            $invQty = (float)($invItem['quantity'] ?? 0);
            $invPrice = (float)($invItem['unit_price'] ?? 0);

            // Match PO item by description similarity
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

            // 1. Validate Quantity
            if ($invQty > $poQty) {
                $invItem['reconciliation_status'] = 'QTY_EXCEEDED';
                $discrepancies[] = "Item '{$itemDesc}' exceeds PO quantity ({$invQty} vs {$poQty}).";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            // 2. Validate Unit Price with Tolerance
            $priceDiffPercent = $poPrice > 0 ? abs(($invPrice - $poPrice) / $poPrice) * 100 : 0;
            if ($priceDiffPercent > $this->priceTolerancePercent) {
                $invItem['reconciliation_status'] = 'PRICE_MISMATCH';
                $discrepancies[] = "Item '{$itemDesc}' price variance exceeds limit (\${$invPrice} vs \${$poPrice}, " . round($priceDiffPercent, 1) . "% diff).";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            // Item Passed Check
            $invItem['reconciliation_status'] = 'MATCHED';
            $updatedItems[] = $invItem;
        }

        // Determine final invoice status
        $finalStatus = (count($invoiceItems) > 0 && $allMatched) ? 'MATCHED' : 'DISCREPANCY';

        return [
            'status' => $finalStatus,
            'discrepancies' => $discrepancies,
            'items' => $updatedItems,
            'matched_po_id' => $po['id'] ?? null,
            'po_number' => $po['po_number'] ?? null
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
}
