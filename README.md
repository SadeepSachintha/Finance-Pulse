# FinancePulse | Automated Financial Intelligence & Multi-Currency 3-Way Reconciliation Platform

FinancePulse is an enterprise-grade financial intelligence platform that automates Accounts Payable (AP) invoice processing, OCR document extraction, 3-way matching (Invoice + Purchase Order + Goods Received Note), fraud risk assessment, vendor self-learning memory, landed inventory costing, multi-currency Forex conversions, and ERP synchronization (QuickBooks & Xero).

![FinancePulse Platform Overview](file:///C:/Users/Sadeep/.gemini/antigravity-ide/brain/7f38397b-5029-494c-b9f5-4128384bbe00/reconciliation_results_eur_1788067042630.png)

---

## 🌟 Key Platform Features

1. **OCR Document Intake & SVG Bounding Box Canvas**: Interactive document viewer built with dynamic SVG bounding box overlays, smooth auto-scroll Y/X math, and animated focus rings.
2. **3-Way Matching Engine (Invoice + PO + GRN)**: Validates invoice line items against purchase orders and warehouse physical receipts (`goods_received_notes` & `grn_items`), flagging short-shipment quantities (`GRN SHORT-SHIPMENT`).
3. **Duplicate Hash & Fraud Risk Shield**: Computes SHA-256 document cryptographic hashes to detect duplicate submissions and verifies remittance bank accounts against approved master records (`vendor_approved_banks`).
4. **Interactive Bounding Box "Click-to-Zoom" Canvas Synchronization**: Clicking line items in the reconciliation table auto-pans and zooms the document canvas directly onto the targeted bounding box coordinates.
5. **Vendor Self-Learning Alias Engine (`vendor_item_aliases`)**: Remembers manual AP item corrections to automatically match future invoice line item abbreviations with 100% precision (`LEARNED ALIAS MATCH`).
6. **Line-Item Tax & Freight Allocation Splitter**: Proportionally distributes lump-sum shipping ($) and sales tax ($) fees across line items to compute exact **Landed Unit Costs** for ERP inventory accounting.
7. **Multi-Currency Forex Conversion Engine**: Real-time multi-currency conversions (EUR €, GBP £, JPY ¥, CAD CA$, AUD A$) converting foreign invoice amounts to base ledger currency (USD $) at spot exchange rates.

---

## 🛠️ Architecture & Microservices

```
                        ┌─────────────────────────────────────────┐
                        │      React 18 + Vite SPA Frontend       │
                        │        (http://localhost:5173/)         │
                        └────────────────────┬────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
                       ▼                                           ▼
       ┌───────────────────────────────┐           ┌───────────────────────────────┐
       │     FastAPI OCR Microservice  │           │      PHP REST API & Portal    │
       │    (http://127.0.0.1:8001/)    │           │    (http://127.0.0.1:8000/)    │
       └───────────────┬───────────────┘           └───────────────┬───────────────┘
                       │                                           │
                       ▼                                           ▼
       ┌───────────────────────────────┐           ┌───────────────────────────────┐
       │     PaddleOCR Vision Model    │           │   PostgreSQL / SQLite Schema  │
       │    Normalized Geometry BBoxes │           │ (3-Way, Fraud & Vendor Memory)│
       └───────────────────────────────┘           └───────────────────────────────┘
```

### Components:
- **Frontend SPA**: React 18, Vite, Tailwind CSS, Lucide Icons (`frontend/`).
- **Backend API**: PHP 8.x server with REST endpoints, 3-Way Match service, Fraud Engine, Currency Converter, and Admin Portal (`backend/`).
- **OCR Microservice**: Python FastAPI service with PaddleOCR and heuristic vision fallback (`ocr_service/`).
- **Database**: Full DDL schema with 3-Way GRN tables, approved master banks, and vendor self-learning memory (`database/init_schema.sql`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **PHP** (8.0+)
- **Python** (3.9+)

### Running Locally

1. **Start PHP API Server & Security Admin Portal**:
   ```bash
   php -S 127.0.0.1:8000 backend/server.php
   ```

2. **Start FastAPI OCR Microservice**:
   ```bash
   python -m uvicorn ocr_service.main:app --port 8001
   ```

3. **Start React Vite Dev Server**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Applications**:
   - **React SPA Workspace**: `http://localhost:5173/`
   - **Backend Security Portal**: `http://127.0.0.1:8000/`
   - **FastAPI OCR API Docs**: `http://127.0.0.1:8001/docs`

---

## 🧪 Automated Unit Test Suite

Run the PHP CLI test suite to verify 2-Way, 3-Way GRN, Fraud Engine, Vendor Self-Learning Memory, Landed Costing, and Multi-Currency Forex algorithms:

```bash
php backend/test_reconcile.php
```

Output:
```
=== FinancePulse Reconciliation & Multi-Currency Forex Test Suite ===

Test 1: Running 3-Way Match on EUR (€) Invoice converted to USD at 1.0850...
Final Status: MATCHED
Invoice Currency: EUR
Exchange Rate: 1 EUR = 1.085 USD
Billed Unit Price (EUR): €1382.49
Converted USD Price: $1500 USD
PO Target Unit Price: $1500 USD
Item Status: MATCHED

=== Test Suite Complete ===
```

---

## 📄 License
MIT License. Built for Enterprise Accounts Payable Intelligence.
