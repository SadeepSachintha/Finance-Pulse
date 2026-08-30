import React from 'react';
import { FileCheck, AlertTriangle, CheckCircle2, DollarSign, TrendingUp, ShieldAlert, ArrowUpRight, Clock } from 'lucide-react';

export default function DashboardOverview({ invoices, purchaseOrders, onSelectInvoice }) {
  
  const totalProcessed = 142;
  const autoMatchRate = "94.2%";
  const activeDiscrepancies = 3;
  const totalReconciledSpend = "$184,500.00";

  return (
    <div className="flex flex-col gap-6">
      {/* Top Key Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400">Total Invoices Processed</p>
              <h3 className="text-2xl font-bold font-heading text-slate-100 mt-1">{totalProcessed}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 mt-3 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% this month</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400">Auto 2-Way Match Rate</p>
              <h3 className="text-2xl font-bold font-heading text-emerald-400 mt-1">{autoMatchRate}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Tolerance: 1.0% Price / 0 Qty Overage</p>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400">Active Discrepancies</p>
              <h3 className="text-2xl font-bold font-heading text-rose-400 mt-1">{activeDiscrepancies}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-rose-400 mt-3 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Requires AP Review</span>
          </p>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400">Total Spend Reconciled</p>
              <h3 className="text-2xl font-bold font-heading text-indigo-300 mt-1">{totalReconciledSpend}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Pushed to QuickBooks & Xero</p>
        </div>
      </div>

      {/* AP Recent Activity & Discrepancies Queue */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Live Accounts Payable Document Queue</h3>
            <p className="text-xs text-slate-400">Real-time status of scanned invoices, PO matches, and price/qty variance checks.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 uppercase font-mono border-b border-slate-800">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Target PO</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-center">OCR Confidence</th>
                <th className="py-3 px-4 text-center">Reconciliation Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-indigo-300">INV-2026-001</td>
                <td className="py-3 px-4 font-medium text-slate-200">Acme Industrial Supplies</td>
                <td className="py-3 px-4 font-mono text-slate-400">PO-99201</td>
                <td className="py-3 px-4 font-mono text-right font-semibold">$4,250.00</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">98.4%</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-full badge-matched font-semibold">MATCHED</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={() => onSelectInvoice('INV-2026-001')}
                    className="flex items-center gap-1 ml-auto text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-indigo-300">INV-2026-002</td>
                <td className="py-3 px-4 font-medium text-slate-200">Apex Electronics Tech</td>
                <td className="py-3 px-4 font-mono text-slate-400">PO-88410</td>
                <td className="py-3 px-4 font-mono text-right font-semibold">$5,175.00</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">95.1%</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-full badge-price-mismatch font-semibold">DISCREPANCY</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={() => onSelectInvoice('INV-2026-002')}
                    className="flex items-center gap-1 ml-auto text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-indigo-300">INV-2026-003</td>
                <td className="py-3 px-4 font-medium text-slate-200">Nexus Logistics & Freight</td>
                <td className="py-3 px-4 font-mono text-slate-400">PO-99201</td>
                <td className="py-3 px-4 font-mono text-right font-semibold">$1,850.00</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">97.8%</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-full badge-qty-exceeded font-semibold">QTY EXCEEDED</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={() => onSelectInvoice('INV-2026-003')}
                    className="flex items-center gap-1 ml-auto text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
