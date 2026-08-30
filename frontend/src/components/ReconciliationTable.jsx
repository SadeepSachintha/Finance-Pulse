import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, Edit3, ArrowRight, PackageCheck, AlertOctagon, Target, BrainCircuit, Truck, DollarSign, Percent } from 'lucide-react';

export default function ReconciliationTable({ invoiceItems, poItems, matchMode, onUpdateItem, onLearnAlias, activeHoverItem, setActiveHoverItem, selectedFocusItem, setSelectedFocusItem }) {
  
  const getStatusBadge = (status, isLearned) => {
    if (isLearned || status === 'LEARNED_ALIAS_MATCH') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-500/40">
          <BrainCircuit className="w-3.5 h-3.5 text-sky-400" />
          LEARNED ALIAS MATCH
        </span>
      );
    }

    switch (status) {
      case 'MATCHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold badge-matched">
            <CheckCircle2 className="w-3.5 h-3.5" />
            MATCHED
          </span>
        );
      case 'GRN_MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/40">
            <AlertOctagon className="w-3.5 h-3.5 text-purple-400" />
            GRN SHORT-SHIPMENT
          </span>
        );
      case 'PRICE_MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold badge-price-mismatch">
            <AlertTriangle className="w-3.5 h-3.5" />
            PRICE MISMATCH
          </span>
        );
      case 'QTY_EXCEEDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold badge-qty-exceeded">
            <AlertCircle className="w-3.5 h-3.5" />
            QTY EXCEEDED
          </span>
        );
      case 'UNMATCHED_ITEM':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold badge-unmatched">
            <HelpCircle className="w-3.5 h-3.5" />
            UNMATCHED
          </span>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur">
      <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span>Itemized {matchMode === '3way' ? '3-Way (Invoice + PO + GRN)' : '2-Way (Invoice + PO)'} Grid</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
            {invoiceItems.length} Items Parsed
          </span>
        </h4>
        <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
          <Truck className="w-3.5 h-3.5" />
          Proportional Landed Inventory Costing Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase font-mono">
              <th className="py-3 px-4 font-medium">Extracted Description</th>
              <th className="py-3 px-3 font-medium text-center">Billed Qty</th>
              <th className="py-3 px-3 font-medium text-center">PO Qty</th>
              {matchMode === '3way' && (
                <th className="py-3 px-3 font-medium text-center text-purple-300">GRN Rec. Qty</th>
              )}
              <th className="py-3 px-3 font-medium text-right">Billed Price</th>
              <th className="py-3 px-3 font-medium text-right text-amber-300">Landed Unit Cost</th>
              <th className="py-3 px-3 font-medium text-right">PO Price</th>
              <th className="py-3 px-4 font-medium text-center">Reconciliation Status</th>
              <th className="py-3 px-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {invoiceItems.map((item, index) => {
              const fieldKey = `line_item_${index + 1}`;
              const isHovered = activeHoverItem === fieldKey || activeHoverItem === index;
              const isFocused = selectedFocusItem === fieldKey;
              const matchedPo = poItems.find(p => p.item_description?.toLowerCase().includes(item.description?.toLowerCase().substring(0, 8)));

              const landedUnitCost = item.landed_unit_cost !== undefined 
                ? item.landed_unit_cost 
                : item.unit_price;

              const allocFreight = item.allocated_freight || 0;
              const allocTax = item.allocated_tax || 0;

              return (
                <tr 
                  key={index}
                  onClick={() => setSelectedFocusItem(fieldKey)}
                  onMouseEnter={() => setActiveHoverItem(fieldKey)}
                  onMouseLeave={() => setActiveHoverItem(null)}
                  className={`transition-colors cursor-pointer ${
                    isFocused
                      ? 'bg-sky-950/50 border-l-4 border-sky-400 font-medium'
                      : (isHovered ? 'bg-indigo-950/40 border-l-4 border-indigo-500' : 'hover:bg-slate-800/40')
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>{item.description}</span>
                      {isFocused && <Target className="w-3.5 h-3.5 text-sky-400 animate-pulse" />}
                    </div>
                    {matchedPo && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <ArrowRight className="w-3 h-3 text-indigo-400" />
                        <span>PO Item: {matchedPo.item_description}</span>
                      </div>
                    )}
                  </td>

                  {/* Quantity Billed */}
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className={`w-16 px-1.5 py-1 rounded bg-slate-950 border text-center font-mono text-xs focus:outline-none focus:ring-1 ${
                        item.reconciliation_status === 'QTY_EXCEEDED' || item.reconciliation_status === 'GRN_MISMATCH'
                          ? 'border-purple-500 text-purple-300 font-bold bg-purple-950/30'
                          : 'border-slate-700 text-slate-200 focus:ring-indigo-500'
                      }`}
                    />
                  </td>

                  {/* PO Quantity */}
                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {matchedPo ? matchedPo.quantity.toFixed(2) : '-'}
                  </td>

                  {/* 3-Way GRN Physical Received Quantity */}
                  {matchMode === '3way' && (
                    <td className="py-3 px-3 text-center font-mono font-bold text-purple-300 bg-purple-950/10">
                      {item.grn_received_qty !== undefined ? item.grn_received_qty.toFixed(2) : (matchedPo ? matchedPo.quantity.toFixed(2) : '-')}
                    </td>
                  )}

                  {/* Unit Price Billed */}
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <span className="text-slate-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => onUpdateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className={`w-20 px-1.5 py-1 rounded bg-slate-950 border text-right font-mono text-xs focus:outline-none focus:ring-1 ${
                          item.reconciliation_status === 'PRICE_MISMATCH'
                            ? 'border-rose-500 text-rose-300 font-bold bg-rose-950/20'
                            : 'border-slate-700 text-slate-200 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                  </td>

                  {/* Landed Unit Cost (Base Price + Allocated Freight & Tax) */}
                  <td className="py-3 px-3 text-right bg-amber-950/10 font-mono font-bold text-amber-300">
                    <div title={`Allocated Freight: +$${allocFreight.toFixed(2)} | Allocated Tax: +$${allocTax.toFixed(2)}`}>
                      ${landedUnitCost.toFixed(2)}
                      {(allocFreight > 0 || allocTax > 0) && (
                        <div className="text-[10px] text-amber-400/80 font-normal">
                          (+${(allocFreight + allocTax).toFixed(2)})
                        </div>
                      )}
                    </div>
                  </td>

                  {/* PO Unit Price */}
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {matchedPo ? `$${matchedPo.unit_price.toFixed(2)}` : '-'}
                  </td>

                  {/* Reconciliation Status */}
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(item.reconciliation_status, item.is_learned_alias)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onLearnAlias && matchedPo) {
                            onLearnAlias(item.description, matchedPo.item_description);
                          }
                        }}
                        title="Save to Vendor Self-Learning Alias Memory"
                        className="p-1 rounded bg-slate-800 hover:bg-sky-600/30 text-slate-300 hover:text-sky-300 border border-slate-700 transition"
                      >
                        <BrainCircuit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFocusItem(fieldKey);
                        }}
                        title="Zoom canvas to target bounding box"
                        className="p-1 rounded bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700 transition"
                      >
                        <Target className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
