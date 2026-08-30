import React, { useState } from 'react';
import SplitViewWorkspace from './components/SplitViewWorkspace';
import DashboardOverview from './components/DashboardOverview';
import PORegistryView from './components/PORegistryView';
import ERPAuditLog from './components/ERPAuditLog';
import { 
  Zap, 
  Layers, 
  BarChart3, 
  Package, 
  Database, 
  ShieldCheck, 
  FileText, 
  ChevronRight,
  Globe,
  Sparkles,
  Sliders,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

const MOCK_POS = [
  {
    id: 'po-99201-uuid',
    po_number: 'PO-99201',
    vendor_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    vendor_name: 'Acme Industrial Supplies',
    status: 'OPEN',
    total_amount: 4250.00,
    currency: 'USD',
    issued_at: '2026-08-01',
    items: [
      {
        id: 'poi-1',
        item_description: 'High Performance Server Rack 42U',
        quantity: 2.00,
        unit_price: 1500.00,
        total_price: 3000.00
      },
      {
        id: 'poi-2',
        item_description: 'Cat6A Shielded Ethernet Cable 100m',
        quantity: 10.00,
        unit_price: 125.00,
        total_price: 1250.00
      }
    ]
  },
  {
    id: 'po-88410-uuid',
    po_number: 'PO-88410',
    vendor_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    vendor_name: 'Apex Electronics Tech',
    status: 'OPEN',
    total_amount: 8700.00,
    currency: 'USD',
    issued_at: '2026-08-10',
    items: [
      {
        id: 'poi-3',
        item_description: 'Industrial Microcontroller Unit (MCU)',
        quantity: 50.00,
        unit_price: 150.00,
        total_price: 7500.00
      },
      {
        id: 'poi-4',
        item_description: 'Precision Heat Sink Module',
        quantity: 40.00,
        unit_price: 30.00,
        total_price: 1200.00
      }
    ]
  }
];

const SAMPLE_INVOICES = {
  'INV-2026-001': {
    invoice_number: 'INV-2026-001',
    vendor_name: 'Acme Industrial Supplies',
    vendor_tax_id: 'US-99882211',
    vendor_bank_account: 'ACCT-99201100',
    invoice_date: '2026-08-15',
    matched_po_id: 'po-99201-uuid',
    status: 'MATCHED',
    total_amount: 4250.00,
    is_fraud: false,
    items: [
      {
        description: 'High Performance Server Rack 42U',
        quantity: 2.00,
        unit_price: 1500.00,
        total_price: 3000.00,
        reconciliation_status: 'MATCHED',
        grn_received_qty: 2.00
      },
      {
        description: 'Cat6A Shielded Ethernet Cable 100m',
        quantity: 10.00,
        unit_price: 125.00,
        total_price: 1250.00,
        reconciliation_status: 'MATCHED',
        grn_received_qty: 10.00
      }
    ],
    raw_elements: [
      { field: 'vendor_name', text: 'Acme Industrial Supplies', confidence: 0.98, box: { x: 64, y: 80, w: 360, h: 50 } },
      { field: 'invoice_number', text: 'INVOICE #: INV-2026-001', confidence: 0.99, box: { x: 480, y: 80, w: 256, h: 50 } },
      { field: 'line_item_1', text: 'High Performance Server Rack 42U - Qty: 2 @ $1,500.00', confidence: 0.95, box: { x: 64, y: 380, w: 672, h: 60 } },
      { field: 'line_item_2', text: 'Cat6A Shielded Ethernet Cable 100m - Qty: 10 @ $125.00', confidence: 0.94, box: { x: 64, y: 460, w: 672, h: 60 } },
      { field: 'total_amount', text: 'TOTAL AMOUNT: $4,250.00', confidence: 0.99, box: { x: 440, y: 720, w: 296, h: 60 } }
    ]
  },
  'INV-2026-999': {
    invoice_number: 'INV-2026-999',
    vendor_name: 'Acme Industrial Supplies',
    vendor_tax_id: 'US-99882211',
    vendor_bank_account: 'SUSPICIOUS-FRAUD-BANK-99999', // Altered bank!
    invoice_date: '2026-08-25',
    matched_po_id: 'po-99201-uuid',
    status: 'DISCREPANCY',
    total_amount: 4250.00,
    is_fraud: true,
    fraud_assessment: {
      fraud_risk_score: 85.0,
      fraud_risk_level: 'CRITICAL',
      is_fraud_flagged: true,
      bank_verification: 'ALTERED_BANK_ALERT',
      fraud_flags: [
        "UNAPPROVED_BANK_ACCOUNT: Remittance account 'SUSPICIOUS-FRAUD-BANK-99999' does not match approved master records for Acme Industrial Supplies."
      ]
    },
    items: [
      {
        description: 'High Performance Server Rack 42U',
        quantity: 2.00,
        unit_price: 1500.00,
        total_price: 3000.00,
        reconciliation_status: 'MATCHED',
        grn_received_qty: 2.00
      },
      {
        description: 'Cat6A Shielded Ethernet Cable 100m',
        quantity: 10.00,
        unit_price: 125.00,
        total_price: 1250.00,
        reconciliation_status: 'MATCHED',
        grn_received_qty: 10.00
      }
    ],
    raw_elements: [
      { field: 'vendor_name', text: 'Acme Industrial Supplies', confidence: 0.98, box: { x: 64, y: 80, w: 360, h: 50 } },
      { field: 'invoice_number', text: 'INVOICE #: INV-2026-999', confidence: 0.99, box: { x: 480, y: 80, w: 256, h: 50 } },
      { field: 'total_amount', text: 'TOTAL AMOUNT: $4,250.00', confidence: 0.99, box: { x: 440, y: 720, w: 296, h: 60 } }
    ]
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('split');
  const [selectedPoId, setSelectedPoId] = useState('po-99201-uuid');
  const [currentInvoiceKey, setCurrentInvoiceKey] = useState('INV-2026-001');
  const [invoiceData, setInvoiceData] = useState(SAMPLE_INVOICES['INV-2026-001']);
  const [tenantName, setTenantName] = useState('Enterprise Corp Ledger (Tenant #001)');

  const handleSelectSampleInvoice = (invKey) => {
    if (SAMPLE_INVOICES[invKey]) {
      setCurrentInvoiceKey(invKey);
      setInvoiceData(SAMPLE_INVOICES[invKey]);
      setSelectedPoId(SAMPLE_INVOICES[invKey].matched_po_id);
    }
  };

  const runReconciliationService = async (poId, mode = '3way', freightAmount = 150.0, taxAmount = 240.0) => {
    const targetPo = MOCK_POS.find(p => p.id === poId || p.po_number === poId) || MOCK_POS[0];
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/reconcile-3way', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: invoiceData,
          po_id: targetPo.id,
          grn_id: `grn-${targetPo.po_number.replace('PO-', '')}-uuid`,
          freight_amount: freightAmount,
          tax_amount: taxAmount
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.reconciliation) {
          setInvoiceData({
            ...invoiceData,
            status: json.reconciliation.status,
            fraud_assessment: json.reconciliation.fraud_assessment,
            items: json.reconciliation.items
          });
          return;
        }
      }
    } catch (err) {
      // Fallback local calculations
    }

    // Local fallback calculation
    const updatedItems = (invoiceData.items || []).map(it => {
      const lineTotal = it.total_price || 0;
      const subtotal = invoiceData.total_amount || 4250.00;
      const weight = subtotal > 0 ? (lineTotal / subtotal) : (1 / (invoiceData.items?.length || 1));
      const allocFreight = freightAmount * weight;
      const allocTax = taxAmount * weight;
      const landedTotal = lineTotal + allocFreight + allocTax;
      const landedUnitPrice = (it.quantity || 1) > 0 ? (landedTotal / it.quantity) : it.unit_price;

      return {
        ...it,
        weight_ratio: Math.round(weight * 100 * 100) / 100,
        allocated_freight: Math.round(allocFreight * 100) / 100,
        allocated_tax: Math.round(allocTax * 100) / 100,
        landed_unit_cost: Math.round(landedUnitPrice * 100) / 100
      };
    });

    setInvoiceData({
      ...invoiceData,
      items: updatedItems
    });
  };

  const handleSyncErp = async (inv) => {
    // API POST mock to QuickBooks/Xero
    return new Promise(resolve => setTimeout(resolve, 800));
  };

  const handleUploadNewInvoice = () => {
    const mockNew = {
      invoice_number: `INV-2026-UPLOAD-${Math.floor(Math.random() * 900 + 100)}`,
      vendor_name: 'Acme Industrial Supplies',
      vendor_tax_id: 'US-99882211',
      vendor_bank_account: 'ACCT-99201100',
      invoice_date: new Date().toISOString().split('T')[0],
      matched_po_id: selectedPoId,
      status: 'MATCHED',
      total_amount: 4250.00,
      is_fraud: false,
      items: [
        {
          description: 'High Performance Server Rack 42U',
          quantity: 2.00,
          unit_price: 1500.00,
          total_price: 3000.00,
          reconciliation_status: 'MATCHED',
          grn_received_qty: 2.00
        },
        {
          description: 'Cat6A Shielded Ethernet Cable 100m',
          quantity: 10.00,
          unit_price: 125.00,
          total_price: 1250.00,
          reconciliation_status: 'MATCHED',
          grn_received_qty: 10.00
        }
      ],
      raw_elements: [
        { field: 'vendor_name', text: 'Acme Industrial Supplies', confidence: 0.98, box: { x: 64, y: 80, w: 360, h: 50 } },
        { field: 'invoice_number', text: 'INVOICE #: NEW-UPLOAD', confidence: 0.99, box: { x: 480, y: 80, w: 256, h: 50 } },
        { field: 'total_amount', text: 'TOTAL AMOUNT: $4,250.00', confidence: 0.99, box: { x: 440, y: 720, w: 296, h: 60 } }
      ]
    };
    setInvoiceData(mockNew);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-lg font-bold tracking-tight text-white">FinancePulse</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  v2.5 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Automated 3-Way Reconciliation • Landed Costing & Fraud Prevention</p>
            </div>
          </div>

          {/* Quick Invoice Tester & Tenant Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-2 font-mono text-[11px]">Quick Sample:</span>
              <button
                onClick={() => handleSelectSampleInvoice('INV-2026-001')}
                className={`px-2.5 py-1 rounded-lg font-mono transition ${
                  currentInvoiceKey === 'INV-2026-001'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                INV-001 (Valid)
              </button>
              <button
                onClick={() => handleSelectSampleInvoice('INV-2026-999')}
                className={`px-2.5 py-1 rounded-lg font-mono transition flex items-center gap-1 ${
                  currentInvoiceKey === 'INV-2026-999'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-900 text-rose-300 hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-rose-300 animate-pulse" />
                INV-999 (Fraud Security Alert)
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{tenantName}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('split')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'split'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Split Verification Workspace
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'dashboard'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Reconciliation Analytics
          </button>

          <button
            onClick={() => setActiveTab('po_registry')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'po_registry'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            PO & GRN Receiving Registry
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            ERP Sync & Audit Log
          </button>
        </div>
      </header>

      {/* Main Body View Controller */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'split' && (
          <SplitViewWorkspace
            purchaseOrders={MOCK_POS}
            selectedPoId={selectedPoId}
            setSelectedPoId={setSelectedPoId}
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
            onRunReconcile={runReconciliationService}
            onSyncErp={handleSyncErp}
            onUploadNewInvoice={handleUploadNewInvoice}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardOverview invoiceData={invoiceData} purchaseOrders={MOCK_POS} />
        )}

        {activeTab === 'po_registry' && (
          <PORegistryView purchaseOrders={MOCK_POS} />
        )}

        {activeTab === 'audit' && (
          <ERPAuditLog invoiceData={invoiceData} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center font-mono">
          <div>FinancePulse AP Intelligence Engine • 3-Way Match & Landed Costing</div>
          <div className="flex gap-4 text-[11px]">
            <a href="http://127.0.0.1:8000/" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
              Backend Admin Portal ↗
            </a>
            <a href="http://127.0.0.1:8001/docs" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
              FastAPI OCR Docs ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
