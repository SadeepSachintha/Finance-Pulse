import React from 'react';
import { Database, CheckCircle2, ArrowRight, ShieldCheck, Download, Server } from 'lucide-react';

export default function ERPAuditLog() {
  const syncLogs = [
    {
      id: 'SYNC-8891A20F',
      invoice: 'INV-2026-001',
      vendor: 'Acme Industrial Supplies',
      platform: 'QuickBooks Online',
      amount: '$4,250.00',
      timestamp: '2026-08-30 09:12:44',
      status: 'SUCCESS'
    },
    {
      id: 'SYNC-7740B11E',
      invoice: 'INV-2026-004',
      vendor: 'Global Freight Services',
      platform: 'Xero Accounting',
      amount: '$3,120.00',
      timestamp: '2026-08-29 16:45:10',
      status: 'SUCCESS'
    },
    {
      id: 'SYNC-9921C44D',
      invoice: 'INV-2026-000',
      vendor: 'Apex Electronics Tech',
      platform: 'QuickBooks Online',
      amount: '$12,400.00',
      timestamp: '2026-08-28 11:20:05',
      status: 'SUCCESS'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Accounting ERP Sync & Audit Log
            </h3>
            <p className="text-xs text-slate-400">Immutable ledger history of reconciled invoices pushed to QuickBooks, Xero, or exported.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs rounded-lg flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              ERP Integrations Active
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 font-mono border-b border-slate-800 uppercase">
                <th className="py-3 px-4">Sync ID</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Target ERP Platform</th>
                <th className="py-3 px-4 text-right">Ledger Amount</th>
                <th className="py-3 px-4 text-center">Timestamp</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {syncLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/20">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-300">{log.id}</td>
                  <td className="py-3 px-4 font-mono text-indigo-300 font-bold">{log.invoice}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">{log.vendor}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                      {log.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-right font-bold text-emerald-400">{log.amount}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">{log.timestamp}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full badge-matched font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      SYNCED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
