<?php

namespace App\Services;

class FraudEngine
{
    /**
     * Generate SHA-256 Hash of raw document content or structured data payload.
     */
    public function generateDocumentHash(string $content): string
    {
        return hash('sha256', trim($content));
    }

    /**
     * Assess Fraud Risk & Return Fraud Audit Profile
     */
    public function assessFraudRisk(array $invoice, array $existingInvoices = [], array $approvedBanks = []): array
    {
        $riskScore = 0.0;
        $flags = [];

        $invNumber = strtoupper(trim($invoice['invoice_number'] ?? ''));
        $vendorName = strtolower(trim($invoice['vendor_name'] ?? ''));
        $extractedBank = trim($invoice['vendor_bank_account'] ?? '');
        $docHash = $invoice['invoice_hash'] ?? $this->generateDocumentHash($invNumber . '|' . $vendorName . '|' . ($invoice['total_amount'] ?? 0));

        // 1. Check SHA-256 Duplicate Hash Collision
        foreach ($existingInvoices as $exist) {
            if (isset($exist['invoice_hash']) && $exist['invoice_hash'] === $docHash) {
                $riskScore += 90.0;
                $flags[] = "DUPLICATE_DOCUMENT_HASH: Exact SHA-256 collision detected with invoice {$exist['invoice_number']}.";
                break;
            }
        }

        // 2. Check Duplicate Invoice Number for Same Vendor
        foreach ($existingInvoices as $exist) {
            if (strtoupper(trim($exist['invoice_number'] ?? '')) === $invNumber && strtolower(trim($exist['vendor_name'] ?? '')) === $vendorName) {
                if (!in_array("DUPLICATE_DOCUMENT_HASH", $flags)) {
                    $riskScore += 75.0;
                    $flags[] = "DUPLICATE_INVOICE_NUMBER: Invoice #{$invNumber} was previously processed for vendor '{$invoice['vendor_name']}'.";
                }
                break;
            }
        }

        // 3. Check Unapproved Vendor Bank Account / Remittance Alteration
        if (!empty($extractedBank)) {
            $isBankApproved = false;
            foreach ($approvedBanks as $approved) {
                if (isset($approved['account_number']) && (str_contains($extractedBank, $approved['account_number']) || str_contains($approved['account_number'], $extractedBank))) {
                    $isBankApproved = true;
                    break;
                }
            }

            if (!$isBankApproved) {
                $riskScore += 85.0;
                $flags[] = "UNAPPROVED_BANK_ACCOUNT: Payment remittance account '{$extractedBank}' does not match approved master records for {$invoice['vendor_name']}. Potential Bank Remittance Fraud!";
            }
        }

        // Cap risk score at 100%
        $riskScore = min($riskScore, 100.0);

        $riskLevel = 'LOW';
        if ($riskScore >= 70.0) {
            $riskLevel = 'CRITICAL';
        } elseif ($riskScore >= 40.0) {
            $riskLevel = 'MEDIUM';
        }

        return [
            'invoice_hash' => $docHash,
            'fraud_risk_score' => round($riskScore, 1),
            'fraud_risk_level' => $riskLevel,
            'is_fraud_flagged' => $riskScore >= 40.0,
            'fraud_flags' => $flags,
            'bank_verification' => !empty($extractedBank) && $riskScore < 70 ? 'VERIFIED_MASTER_BANK' : ($riskScore >= 70 ? 'ALTERED_BANK_ALERT' : 'NO_BANK_PROVIDED')
        ];
    }
}
