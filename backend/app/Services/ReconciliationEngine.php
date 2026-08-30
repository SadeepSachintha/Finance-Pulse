<?php

namespace App\Services;

require_once __DIR__ . '/FraudEngine.php';
require_once __DIR__ . '/CurrencyConverter.php';

use App\Services\FraudEngine;
use App\Services\CurrencyConverter;

class ReconciliationEngine
{
    protected float $priceTolerancePercent = 1.0;
    protected FraudEngine $fraudEngine;
    protected CurrencyConverter $currencyConverter;

    public function __construct()
    {
        $this->fraudEngine = new FraudEngine();
        $this->currencyConverter = new CurrencyConverter();
    }

    /**
     * Allocate lump-sum header fees (Freight, Tax) proportionally across line items.
     */
    public function allocateHeaderFees(array $items, float $freightAmount = 0.0, float $taxAmount = 0.0): array
    {
        $subtotal = 0.0;
        foreach ($items as $item) {
            $subtotal += (float)($item['total_price'] ?? 0.0);
        }

        return array_map(function ($item) use ($subtotal, $freightAmount, $taxAmount) {
            $lineTotal = (float)($item['total_price'] ?? 0.0);
            $qty = (float)($item['quantity'] ?? 1.0);
            $unitPrice = (float)($item['unit_price'] ?? 0.0);

            $weight = $subtotal > 0 ? ($lineTotal / $subtotal) : (1.0 / count($items));
            $allocatedFreight = $freightAmount * $weight;
            $allocatedTax = $taxAmount * $weight;
            $landedTotal = $lineTotal + $allocatedFreight + $allocatedTax;
            $landedUnitPrice = $qty > 0 ? ($landedTotal / $qty) : $unitPrice;

            $item['weight_ratio'] = round($weight * 100, 2);
            $item['allocated_freight'] = round($allocatedFreight, 2);
            $item['allocated_tax'] = round($allocatedTax, 2);
            $item['landed_unit_cost'] = round($landedUnitPrice, 2);
            $item['landed_total_cost'] = round($landedTotal, 2);

            return $item;
        }, $items);
    }

    /**
     * Run 3-Way Match with Multi-Currency Forex Conversion.
     */
    public function reconcile3Way(
        $invoice, 
        $po, 
        $grn, 
        array $existingInvoices = [], 
        array $approvedBanks = [], 
        array $vendorAliases = [], 
        float $freightAmount = 0.0, 
        float $taxAmount = 0.0,
        string $invoiceCurrency = 'USD',
        float $exchangeRate = 1.0000
    ): array {
        $discrepancies = [];
        $rawInvoiceItems = is_array($invoice['items']) ? $invoice['items'] : [];
        $poItems = is_array($po['items']) ? $po['items'] : [];
        $grnItems = is_array($grn['items']) ? $grn['items'] : [];

        $invoiceItems = $this->allocateHeaderFees($rawInvoiceItems, $freightAmount, $taxAmount);

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
            $invRawPrice = (float)($invItem['unit_price'] ?? 0);

            // Forex conversion if non-USD currency
            $invPriceUsd = $this->currencyConverter->convertToBaseCurrency($invRawPrice, $invoiceCurrency, $exchangeRate);
            $invItem['unit_price_usd'] = $invPriceUsd;
            $invItem['currency'] = $invoiceCurrency;
            $invItem['exchange_rate'] = $exchangeRate;

            $matchResult = $this->findBestMatchingPoItem($itemDesc, $poItems, $vendorAliases);
            $matchedPoItem = $matchResult['po_item'] ?? null;
            $isLearnedAlias = $matchResult['is_learned_alias'] ?? false;

            if (!$matchedPoItem) {
                $invItem['reconciliation_status'] = 'UNMATCHED_ITEM';
                $discrepancies[] = "Item '{$itemDesc}' not found on PO {$po['po_number']}.";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            $poQty = (float)($matchedPoItem['quantity'] ?? 0);
            $poPriceUsd = (float)($matchedPoItem['unit_price'] ?? 0);

            $matchedGrnItem = $this->findBestMatchingGrnItem($matchedPoItem['id'] ?? '', $itemDesc, $grnItems);
            $grnAcceptedQty = $matchedGrnItem ? (float)($matchedGrnItem['accepted_quantity'] ?? $matchedGrnItem['received_quantity'] ?? 0) : 0;

            if ($invQty > $grnAcceptedQty) {
                $invItem['reconciliation_status'] = 'GRN_MISMATCH';
                $invItem['grn_received_qty'] = $grnAcceptedQty;
                $invItem['is_learned_alias'] = $isLearnedAlias;
                $discrepancies[] = "3-WAY ALERT: Item '{$itemDesc}' billed quantity ({$invQty}) exceeds physical warehouse receipt ({$grnAcceptedQty} on {$grn['grn_number']}). Short-shipment detected!";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            if ($invQty > $poQty) {
                $invItem['reconciliation_status'] = 'QTY_EXCEEDED';
                $invItem['grn_received_qty'] = $grnAcceptedQty;
                $invItem['is_learned_alias'] = $isLearnedAlias;
                $discrepancies[] = "Item '{$itemDesc}' exceeds PO quantity ({$invQty} vs {$poQty}).";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            $priceDiffPercent = $poPriceUsd > 0 ? abs(($invPriceUsd - $poPriceUsd) / $poPriceUsd) * 100 : 0;
            if ($priceDiffPercent > $this->priceTolerancePercent) {
                $invItem['reconciliation_status'] = 'PRICE_MISMATCH';
                $invItem['grn_received_qty'] = $grnAcceptedQty;
                $invItem['is_learned_alias'] = $isLearnedAlias;
                $discrepancies[] = "Item '{$itemDesc}' price variance exceeds limit (\${$invPriceUsd} USD vs \${$poPriceUsd} USD PO, " . round($priceDiffPercent, 1) . "% diff).";
                $allMatched = false;
                $updatedItems[] = $invItem;
                continue;
            }

            $invItem['reconciliation_status'] = $isLearnedAlias ? 'LEARNED_ALIAS_MATCH' : 'MATCHED';
            $invItem['grn_received_qty'] = $grnAcceptedQty;
            $invItem['is_learned_alias'] = $isLearnedAlias;
            $updatedItems[] = $invItem;
        }

        $finalStatus = (count($invoiceItems) > 0 && $allMatched) ? 'MATCHED' : 'DISCREPANCY';

        return [
            'mode' => '3-Way',
            'status' => $finalStatus,
            'currency' => $invoiceCurrency,
            'exchange_rate' => $exchangeRate,
            'freight_amount' => $freightAmount,
            'tax_amount' => $taxAmount,
            'fraud_assessment' => $fraudAssessment,
            'discrepancies' => $discrepancies,
            'items' => $updatedItems,
            'matched_po_id' => $po['id'] ?? null,
            'po_number' => $po['po_number'] ?? null,
            'matched_grn_id' => $grn['id'] ?? null,
            'grn_number' => $grn['grn_number'] ?? null
        ];
    }

    public function findBestMatchingPoItem(string $description, array $poItems, array $vendorAliases = [])
    {
        foreach ($vendorAliases as $alias) {
            $extractedAlias = $alias['extracted_description'] ?? '';
            $mappedPoDesc = $alias['mapped_po_description'] ?? '';

            if (strtolower(trim($description)) === strtolower(trim($extractedAlias)) || str_contains(strtolower($description), strtolower($extractedAlias))) {
                foreach ($poItems as $pItem) {
                    $poDesc = $pItem['item_description'] ?? $pItem['description'] ?? '';
                    if (strtolower(trim($poDesc)) === strtolower(trim($mappedPoDesc)) || str_contains(strtolower($poDesc), strtolower($mappedPoDesc))) {
                        return ['po_item' => $pItem, 'is_learned_alias' => true];
                    }
                }
            }
        }

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

        return ['po_item' => $bestMatch, 'is_learned_alias' => false];
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
