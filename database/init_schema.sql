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

-- 2. Purchase Orders Table
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

-- 3. PO Line Items
CREATE TABLE IF NOT EXISTS po_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

-- 4. Extracted Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matched_po_id UUID REFERENCES purchase_orders(id),
    vendor_id UUID REFERENCES vendors(id),
    invoice_number VARCHAR(64),
    file_path TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_OCR', -- 'PENDING_OCR', 'MATCHED', 'DISCREPANCY', 'APPROVED'
    ocr_confidence NUMERIC(5, 2),
    total_amount NUMERIC(12, 2),
    tax_amount NUMERIC(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    invoice_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Extracted Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT,
    quantity NUMERIC(10, 2),
    unit_price NUMERIC(12, 2),
    total_price NUMERIC(12, 2),
    bounding_box JSONB, -- Coordinates: {"x": 120, "y": 450, "w": 300, "h": 25}
    reconciliation_status VARCHAR(32) DEFAULT 'UNMATCHED' -- 'MATCHED', 'PRICE_MISMATCH', 'QTY_EXCEEDED', 'UNMATCHED_ITEM'
);

-- Sample Data Seeding
INSERT INTO vendors (id, name, tax_id, email) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Industrial Supplies', 'US-99882211', 'ap@acmeindustrial.com'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Apex Electronics Tech', 'US-44331100', 'billing@apexelectronics.com'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Nexus Logistics & Freight', 'US-77665544', 'invoices@nexuslogistics.com')
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
