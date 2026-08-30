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
  CheckCircle2
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
    invoice_date: '2026-08-15',
    matched_po_id: 'po-99201-uuid',
    status: 'MATCHED',
    total_amount: 4250.00,
    items: [
      {
        description: 'High Performance Server Rack 42U',
        quantity: 2.00,
        unit_price: 1500.00,
        total_price: 3000.00,
        reconciliation_status: 'MATCHED'
      },
      {
        description: 'Cat6A Shielded Ethernet Cable 100m',
        quantity: 10.00,
        unit_price: 125.00,
        total_price: 1250.00,
        reconciliation_status: 'MATCHED'
      }
    ],
    raw_elements: [
      { field: 'vendor_name', text: 'Acme Industrial Supplies', confidence: 0.98, box: { x: 64, y: 80, w: 360, h: 50 } },
      { field: 'tax_id', text: 'Tax ID: US-99882211', confidence: 0.96, box: { x: 64, y: 140, w: 240, h: 30 } },
      { field: 'invoice_number', text: 'INVOICE #: INV-2026-001', confidence: 0.99, box: { x: 480, y: 80, w: 256, h: 50 } },
      { field: 'line_item_1', text: 'High Performance Server Rack 42U - Qty: 2 @ $1,500.00', confidence: 0.95, box: { x: 64, y: 380, w: 672, h: 60 } },
      { field: 'line_item_2', text: 'Cat6A Shielded Ethernet Cable 100m - Qty: 10 @ $125.00', confidence: 0.94, box: { x: 64, y: 460, w: 672, h: 60 } },
      { field: 'total_amount', text: 'TOTAL AMOUNT: $4,250.00', confidence: 0.99, box: { x: 440, y: 720, w: 296, h: 60 } }
    ]
  },
  'INV-2026-002': {
    invoice_number: 'INV-2026-002',
    vendor_name: 'Apex Electronics Tech',
    vendor_tax_id: 'US-44331100',
    invoice_date: '2026-08-18',
    matched_po_id: 'po-88410-uuid',
    status: 'DISCREPANCY',
    total_amount: 9200.00,
    items: [
      {
        description: 'Industrial Microcontroller Unit (MCU)',
        quantity: 50.00,
        unit_price: 160.00, // $160 vs $150 -> Price Mismatch
        total_price: 8000.00,
        reconciliation_status: 'PRICE_MISMATCH'
      },
      {
        description: 'Precision Heat Sink Module',
        quantity: 40.00,
        unit_price: 30.00,
        total_price: 1200.00,
        reconciliation_status: 'MATCHED'
      }
    ],
    raw_elements: [
      { field: 'vendor_name', text: 'Apex Electronics Tech', confidence: 0.97, box: { x: 64, y: 80, w: 360, h: 50 } },
      { field: 'invoice_number', text: 'INVOICE #: INV-2026-002', confidence: 0.99, box: { x: 480, y: 80, w: 256, h: 50 } },
      { field: 'line_item_1', text: 'Industrial Microcontroller Unit (MCU) - Qty: 50 @ $160.00', confidence: 0.94, box: { x: 64, y: 380, w: 672, h: 60 } },
      { field: 'line_item_2', text: 'Precision Heat Sink Module - Qty: 40 @ $30.00', confidence: 0.96, box: { x: 64, y: 460, w: 672, h: 60 } },
      { field: 'total_amount', text: 'TOTAL AMOUNT: $9,200.00', confidence: 0.98, box: { x: 440, y: 720, w: 296, h: 60 } }
    ]
  },
  'INV-2026-003': {
    invoice_number: 'INV-2026-003',
    vendor_name: 'Acme Industrial Supplies',
    vendor_tax_id: 'US-99882211',
    invoice_date: '2026-08-20',
    matched_po_id: 'po-99201-uuid',
    status: 'DISCREPANCY',
    total_amount: 4875.00,
    items: [
      {
        description: 'High Performance Server Rack 42U',
        quantity: 2.00,
        unit_price: 1500.00,
        total_price: 3000.00,
        reconciliation_status: 'MATCHED'
      },
      {
        description: 'Cat6A Shielded Ethernet Cable 100m',
        quantity: 15.00, // 15 vs 10 PO -> Qty Exceeded
        unit_price: 125.00,
        total_price: 1875.00,
        reconciliation_status: 'QTY_EXCEEDED'
      }
    ],
    raw_elements: [
      { field: 'vendor_name', text: 'Acme Industrial Supplies', confidence: 0.98, box: { x: 64, y: 80, w: 360, h: 50 } },
      { field: 'invoice_number', text: 'INVOICE #: INV-2026-003', confidence: 0.99, box: { x: 480, y: 80, w: 256, h: 50 } },
      { field: 'line_item_1', text: 'High Performance Server Rack 42U - Qty: 2 @ $1,500.00', confidence: 0.95, box: { x: 64, y: 380, w: 672, h: 60 } },
      { field: 'line_item_2', text: 'Cat6A Shielded Ethernet Cable 100m - Qty: 15 @ $125.00', confidence: 0.92, box: { x: 64, y: 460, w: 672, h: 60 } },
      { field: 'total_amount', text: 'TOTAL AMOUNT: $4,875.00', confidence: 0.99, box: { x: 440, y: 720, w: 296, h: 60 } }
    ]
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('split'); // 'split' | 'dashboard' | 'po' | 'erp'
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

  const runReconciliationService = async (poId) => {
    const targetPo = MOCK_POS.find(p => p.id === poId || p.po_number === poId) || MOCK_POS[0];
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: invoiceData,
          po_id: targetPo.id
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.reconciliation) {
          setInvoiceData({
            ...invoiceData,
            status: json.reconciliation.status,
            items: json.reconciliation.items
          });
          return;
        }
      }
    } catch (err) {
      console.log("Local API server offline, running fallback ReconciliationEngine in memory.");
    }

    // Local client-side fallback matching logic
    const tolerance = 1.0;
    let allMatched = true;
    const updatedItems = (invoiceData.items || []).map(invItem => {
      const matchedPoItem = targetPo.items.find(p => p.item_description.toLowerCase().includes(invItem.description.toLowerCase().substring(0, 8)));
      if (!matchedPoItem) {
        allMatched = false;
        return { ...invItem, reconciliation_status: 'UNMATCHED_ITEM' };
      }
      if (invItem.quantity > matchedPoItem.quantity) {
        allMatched = false;
        return { ...invItem, reconciliation_status: 'QTY_EXCEEDED' };
      }
      const priceDiff = Math.abs((invItem.unit_price - matchedPoItem.unit_price) / matchedPoItem.unit_price) * 100;
      if (priceDiff > tolerance) {
        allMatched = false;
        return { ...invItem, reconciliation_status: 'PRICE_MISMATCH' };
      }
      return { ...invItem, reconciliation_status: 'MATCHED' };
    });

    setInvoiceData({
      ...invoiceData,
      status: allMatched ? 'MATCHED' : 'DISCREPANCY',
      items: updatedItems
    });
  };

  const handleSyncErp = async (inv) => {
    try {
      await fetch('http://127.0.0.1:8000/api/erp/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'QuickBooks Online',
          invoice_number: inv.invoice_number,
          total_amount: inv.total_amount
        })
      });
    } catch (e) {
      // handled
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg text-slate-100 tracking-tight">FinancePulse</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Laravel 12 Multi-Tenant
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">AI Invoice OCR & Real-Time 2-Way Reconciliation</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('split')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'split' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              Split Verification
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              AP Analytics
            </button>

            <button
              onClick={() => setActiveTab('po')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'po' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              PO Registry
            </button>

            <button
              onClick={() => setActiveTab('erp')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'erp' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              ERP Ledger Sync
            </button>
          </nav>

          {/* Sample Invoice Switcher & Multi-Tenancy Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-300 font-medium">{tenantName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Header: Demo Preset Document Selector */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">Quick Test Invoices:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectSampleInvoice('INV-2026-001')}
              className={`px-3 py-1 rounded-md font-mono text-xs border transition ${
                currentInvoiceKey === 'INV-2026-001'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              INV-2026-001 (100% Match)
            </button>

            <button
              onClick={() => handleSelectSampleInvoice('INV-2026-002')}
              className={`px-3 py-1 rounded-md font-mono text-xs border transition ${
                currentInvoiceKey === 'INV-2026-002'
                  ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              INV-2026-002 (Price Discrepancy)
            </button>

            <button
              onClick={() => handleSelectSampleInvoice('INV-2026-003')}
              className={`px-3 py-1 rounded-md font-mono text-xs border transition ${
                currentInvoiceKey === 'INV-2026-003'
                  ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              INV-2026-003 (Qty Exceeded)
            </button>
          </div>
        </div>
      </div>

      {/* Main App Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'split' && (
          <SplitViewWorkspace
            purchaseOrders={MOCK_POS}
            selectedPoId={selectedPoId}
            setSelectedPoId={setSelectedPoId}
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
            onRunReconcile={runReconciliationService}
            onSyncErp={handleSyncErp}
            onUploadNewInvoice={() => handleSelectSampleInvoice('INV-2026-002')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardOverview
            invoices={Object.values(SAMPLE_INVOICES)}
            purchaseOrders={MOCK_POS}
            onSelectInvoice={(invNo) => {
              handleSelectSampleInvoice(invNo);
              setActiveTab('split');
            }}
          />
        )}

        {activeTab === 'po' && (
          <PORegistryView purchaseOrders={MOCK_POS} />
        )}

        {activeTab === 'erp' && (
          <ERPAuditLog />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 text-center text-xs text-slate-500 font-mono">
        FinancePulse • AI Invoice OCR & 2-Way PO Reconciliation Engine • Multi-Tenant Architecture
      </footer>
    </div>
  );
}
