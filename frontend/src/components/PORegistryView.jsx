import React from 'react';
import { Package, FileText, Calendar, DollarSign, CheckCircle2, Clock } from 'lucide-react';

export default function PORegistryView({ purchaseOrders }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              Corporate Purchase Order Registry
            </h3>
            <p className="text-xs text-slate-400">Internal procurement records used for real-time 2-way invoice line item matching.</p>
          </div>
          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs rounded-lg font-semibold">
            {purchaseOrders.length} Active PO Records
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {purchaseOrders.map((po) => (
            <div key={po.id} className="glass-card p-5 border border-slate-800 rounded-xl">
              {/* PO Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl font-mono font-bold text-sm border border-indigo-500/30">
                    {po.po_number}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-100">{po.vendor_name}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Issued: {po.issued_at}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-indigo-400">Status: {po.status}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-mono">PO Total Amount</span>
                  <p className="text-xl font-bold font-mono text-emerald-400">${po.total_amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                </div>
              </div>

              {/* PO Line Items Grid */}
              <div className="mt-4">
                <h5 className="text-xs font-mono uppercase text-slate-400 mb-2">Approved PO Line Items</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-950/60 text-slate-400 font-mono">
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3 text-center">Approved Quantity</th>
                        <th className="py-2 px-3 text-right">Approved Unit Price</th>
                        <th className="py-2 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {po.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="py-2 px-3 font-medium text-slate-200">{item.item_description}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-300">{item.quantity.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-300">${item.unit_price.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-indigo-300">${item.total_price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
