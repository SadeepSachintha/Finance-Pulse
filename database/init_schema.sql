-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Vendors Registry
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(64) UNIQUE,
    email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Approved Vendor Master Bank Accounts (Fraud Prevention)
CREATE TABLE IF NOT EXISTS vendor_approved_banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    routing_number VARCHAR(64) NOT NULL,
    account_number VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'APPROVED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(64) NOT NULL UNIQUE,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'PARTIALLY_MATCHED', 'CLOSED'
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    issued_at DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PO Line Items
CREATE TABLE IF NOT EXISTS po_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

-- 5. Goods Received Notes (GRN - 3-Way Match Warehouse Receipts)
CREATE TABLE IF NOT EXISTS goods_received_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number VARCHAR(64) NOT NULL UNIQUE,
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    received_at DATE NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GRN Physical Line Items
CREATE TABLE IF NOT EXISTS grn_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_id UUID NOT NULL REFERENCES goods_received_notes(id) ON DELETE CASCADE,
    po_item_id UUID NOT NULL REFERENCES po_items(id),
    received_quantity NUMERIC(10, 2) NOT NULL,
    accepted_quantity NUMERIC(10, 2) NOT NULL,
    notes TEXT
);

-- 7. Extracted Invoices Table (With Fraud Engine Columns)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matched_po_id UUID REFERENCES purchase_orders(id),
    matched_grn_id UUID REFERENCES goods_received_notes(id),
    vendor_id UUID REFERENCES vendors(id),
    invoice_number VARCHAR(64),
    invoice_hash VARCHAR(64) UNIQUE, -- SHA-256 Document Collision Hash
    vendor_bank_account VARCHAR(64),
    fraud_risk_score NUMERIC(5, 2) DEFAULT 0.00, -- 0-100% Risk Score
    fraud_flags JSONB, -- Array of risk flags: ["UNAPPROVED_BANK_ACCOUNT", "DUPLICATE_HASH"]
    file_path TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_OCR',
    ocr_confidence NUMERIC(5, 2),
    total_amount NUMERIC(12, 2),
    tax_amount NUMERIC(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    invoice_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Extracted Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT,
    quantity NUMERIC(10, 2),
    unit_price NUMERIC(12, 2),
    total_price NUMERIC(12, 2),
    bounding_box JSONB,
    reconciliation_status VARCHAR(32) DEFAULT 'UNMATCHED'
);

-- Sample Data Seeding
INSERT INTO vendors (id, name, tax_id, email) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Industrial Supplies', 'US-99882211', 'ap@acmeindustrial.com'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Apex Electronics Tech', 'US-44331100', 'billing@apexelectronics.com'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Nexus Logistics & Freight', 'US-77665544', 'invoices@nexuslogistics.com')
ON CONFLICT DO NOTHING;

-- Approved Vendor Master Banks
INSERT INTO vendor_approved_banks (id, vendor_id, bank_name, routing_number, account_number, status) VALUES
('vab-1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Chase Manhattan Bank', '121000358', 'ACCT-99201100', 'APPROVED'),
('vab-2', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Bank of America', '026009593', 'ACCT-44118822', 'APPROVED')
ON CONFLICT DO NOTHING;

INSERT INTO purchase_orders (id, po_number, vendor_id, status, total_amount, currency, issued_at) VALUES
('po-99201-uuid', 'PO-99201', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'OPEN', 4250.00, 'USD', '2026-08-01'),
('po-88410-uuid', 'PO-88410', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'OPEN', 8700.00, 'USD', '2026-08-10')
ON CONFLICT DO NOTHING;

INSERT INTO po_items (id, po_id, item_description, quantity, unit_price, total_price) VALUES
('poi-1', 'po-99201-uuid', 'High Performance Server Rack 42U', 2.00, 1500.00, 3000.00),
('poi-2', 'po-99201-uuid', 'Cat6A Shielded Ethernet Cable 100m', 10.00, 125.00, 1250.00),
('poi-3', 'po-88410-uuid', 'Industrial Microcontroller Unit (MCU)', 50.00, 150.00, 7500.00),
('poi-4', 'po-88410-uuid', 'Precision Heat Sink Module', 40.00, 30.00, 1200.00)
ON CONFLICT DO NOTHING;
