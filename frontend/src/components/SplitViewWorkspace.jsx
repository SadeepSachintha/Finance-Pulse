import React, { useState } from 'react';
import DocumentViewer from './DocumentViewer';
import ReconciliationTable from './ReconciliationTable';
import { 
  Building2, 
  FileCheck2, 
  RefreshCw, 
  Download, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  Search,
  Upload,
  PackageCheck,
  Layers
} from 'lucide-react';

export default function SplitViewWorkspace({ 
  purchaseOrders, 
  selectedPoId, 
  setSelectedPoId, 
  invoiceData, 
  setInvoiceData,
  onRunReconcile,
  onSyncErp,
  onUploadNewInvoice
}) {
  const [activeHoverItem, setActiveHoverItem] = useState(null);
  const [isReconciling, setIsReconciling] = useState(false);
  const [erpSyncing, setErpSyncing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [matchMode, setMatchMode] = useState('3way'); // '2way' | '3way'

  const currentPo = purchaseOrders.find(p => p.id === selectedPoId || p.po_number === selectedPoId) || purchaseOrders[0];

  const handleUpdateLineItem = (index, field, value) => {
    const updatedItems = [...(invoiceData.items || [])];
    if (updatedItems[index]) {
      updatedItems[index][field] = value;
      if (field === 'quantity' || field === 'unit_price') {
        updatedItems[index]['total_price'] = (updatedItems[index]['quantity'] || 0) * (updatedItems[index]['unit_price'] || 0);
      }
      
      const newTotal = updatedItems.reduce((acc, it) => acc + (it.total_price || 0), 0);
      setInvoiceData({
        ...invoiceData,
        items: updatedItems,
        total_amount: newTotal
      });
    }
  };

  const handleReconcileClick = async () => {
    setIsReconciling(true);
    await onRunReconcile(selectedPoId, matchMode);
    setIsReconciling(false);
    showNotification(`${matchMode === '3way' ? '3-Way GRN' : '2-Way PO'} Reconciliation complete against ${currentPo?.po_number || 'PO'}!`);
  };

  const handleErpSyncClick = async () => {
    setErpSyncing(true);
    await onSyncErp(invoiceData);
    setErpSyncing(false);
    showNotification('Reconciled entry pushed to QuickBooks / Xero API!');
  };

  const handleExportCsv = () => {
    const headers = ["InvoiceNumber", "Vendor", "PO", "Description", "BilledQty", "POQty", "GRNQty", "UnitPrice", "TotalPrice", "Status"];
    const rows = (invoiceData.items || []).map(it => [
      invoiceData.invoice_number,
      invoiceData.vendor_name,
      currentPo?.po_number,
      `"${it.description}"`,
      it.quantity,
      currentPo?.items[0]?.quantity || 0,
      it.grn_received_qty !== undefined ? it.grn_received_qty : (currentPo?.items[0]?.quantity || 0),
      it.unit_price,
      it.total_price,
      it.reconciliation_status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reconciliation_${invoiceData.invoice_number}_${matchMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Exported Reconciliation CSV!');
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const totalPoAmount = currentPo?.total_amount || 0;
  const invTotalAmount = invoiceData.total_amount || 0;
  const netVariance = invTotalAmount - totalPoAmount;

  return (
    <div className="flex flex-col gap-4">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-950 border border-emerald-500/40 text-emerald-200 rounded-xl shadow-2xl backdrop-blur">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Split Workspace Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Document Canvas */}
        <div className="lg:col-span-6 h-[780px]">
          <DocumentViewer 
            invoiceData={invoiceData}
            activeHoverItem={activeHoverItem}
            setActiveHoverItem={setActiveHoverItem}
          />
        </div>

        {/* Right Column: 3-Way Match & Extraction Control Workspace */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Target PO Selector & 2-Way / 3-Way Toggle */}
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{invoiceData.vendor_name || 'Acme Industrial Supplies'}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tax ID: US-99882211</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400 font-medium">Vendor Verified</span>
                  </div>
                </div>
              </div>

              {/* Match Mode Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => {
                    setMatchMode('2way');
                    onRunReconcile(selectedPoId, '2way');
                  }}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    matchMode === '2way' 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  2-Way (PO Only)
                </button>

                <button
                  onClick={() => {
                    setMatchMode('3way');
                    onRunReconcile(selectedPoId, '3way');
                  }}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition ${
                    matchMode === '3way' 
                      ? 'bg-purple-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PackageCheck className="w-3.5 h-3.5 text-purple-300" />
                  3-Way (PO + GRN)
                </button>
              </div>
            </div>

            {/* Target PO & GRN Selector Controls */}
            <div className="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-slate-800">
              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 mb-1 block">Target Purchase Order</label>
                <select
                  value={selectedPoId}
                  onChange={(e) => setSelectedPoId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-indigo-300 font-mono text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {purchaseOrders.map(po => (
                    <option key={po.id} value={po.id}>
                      {po.po_number} - ${po.total_amount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 mb-1 block">Warehouse Receipt (GRN)</label>
                <div className="bg-slate-950 border border-slate-700 text-purple-300 font-mono text-xs font-bold rounded-lg px-3 py-1.5 flex items-center justify-between">
                  <span>GRN-{currentPo?.po_number?.replace('PO-', '')}-A</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Verified Receipt</span>
                </div>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <p className="text-[11px] text-slate-400 font-mono">Invoice Billed Total</p>
                <p className="text-lg font-bold font-mono text-slate-100">${invTotalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <p className="text-[11px] text-slate-400 font-mono">PO Target ({currentPo?.po_number})</p>
                <p className="text-lg font-bold font-mono text-indigo-300">${totalPoAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
              </div>

              <div className={`p-3 rounded-lg border ${
                netVariance === 0 
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}>
                <p className="text-[11px] opacity-80 font-mono">Net Variance</p>
                <p className="text-lg font-bold font-mono">
                  {netVariance > 0 ? `+$${netVariance.toFixed(2)}` : `$${netVariance.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-3 p-3 glass-panel">
            <div className="flex items-center gap-2">
              <button
                onClick={onUploadNewInvoice}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                Intake Document
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                Export CSV
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReconcileClick}
                disabled={isReconciling}
                className={`flex items-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-lg shadow-lg transition disabled:opacity-50 ${
                  matchMode === '3way' 
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30' 
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
                Run {matchMode === '3way' ? '3-Way Match' : '2-Way Match'}
              </button>

              <button
                onClick={handleErpSyncClick}
                disabled={erpSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Approve & Sync ERP
              </button>
            </div>
          </div>

          {/* Itemized Reconciliation Table */}
          <ReconciliationTable
            invoiceItems={invoiceData.items || []}
            poItems={currentPo?.items || []}
            matchMode={matchMode}
            onUpdateItem={handleUpdateLineItem}
            activeHoverItem={activeHoverItem}
            setActiveHoverItem={setActiveHoverItem}
          />
        </div>
      </div>
    </div>
  );
}
