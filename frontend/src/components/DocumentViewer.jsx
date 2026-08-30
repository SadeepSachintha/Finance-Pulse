import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Eye, EyeOff, Layers, Sparkles, Target, LocateFixed } from 'lucide-react';

export default function DocumentViewer({ invoiceData, activeHoverItem, setActiveHoverItem, selectedFocusItem }) {
  const [zoom, setZoom] = useState(100);
  const [showOverlay, setShowOverlay] = useState(true);
  const scrollContainerRef = useRef(null);

  const rawElements = invoiceData?.raw_elements || [];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 60));

  // Auto-Pan & Zoom to Focused Bounding Box Coordinate
  useEffect(() => {
    if (!selectedFocusItem) return;

    const focusedElem = rawElements.find(e => e.field === selectedFocusItem);
    if (focusedElem && focusedElem.box && scrollContainerRef.current) {
      setZoom(135); // Auto zoom to 135% for clear inspection
      
      const box = focusedElem.box;
      const container = scrollContainerRef.current;
      
      // Calculate centered scroll position
      const scale = 1.35;
      const targetY = (box.y * scale) - (container.clientHeight / 2) + (box.h * scale / 2);
      const targetX = (box.x * scale) - (container.clientWidth / 2) + (box.w * scale / 2);
      
      container.scrollTo({
        top: Math.max(0, targetY),
        left: Math.max(0, targetX),
        behavior: 'smooth'
      });
    }
  }, [selectedFocusItem, invoiceData]);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Document Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse-glow" />
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Document Intake Canvas
          </h3>
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/20">
            {invoiceData?.invoice_number || 'INV-2026-001'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedFocusItem && (
            <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 animate-pulse">
              <LocateFixed className="w-3 h-3 text-sky-400" />
              Focus: {selectedFocusItem}
            </span>
          )}

          {/* Zoom Buttons */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
            <button 
              onClick={handleZoomOut} 
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-slate-400">{zoom}%</span>
            <button 
              onClick={handleZoomIn} 
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Overlay Toggle */}
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showOverlay 
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {showOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Bounding Boxes
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div 
        ref={scrollContainerRef}
        className="relative flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-6 min-h-[520px]"
      >
        <div 
          className="relative transition-all duration-300 shadow-2xl rounded-lg bg-white overflow-hidden border border-slate-700"
          style={{ 
            width: `${(800 * zoom) / 100}px`,
            height: `${(1000 * zoom) / 100}px`,
            maxHeight: 'none'
          }}
        >
          {/* Simulated Invoice Document Background */}
          <div className="absolute inset-0 p-8 text-slate-900 font-sans flex flex-col justify-between select-none bg-gradient-to-b from-white via-slate-50 to-slate-100">
            <div>
              {/* Header Info */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{invoiceData?.vendor_name || 'ACME INDUSTRIAL SUPPLIES'}</h1>
                  <p className="text-xs text-slate-600">100 Enterprise Way, Silicon Valley, CA</p>
                  <p className="text-xs text-slate-600">Tax ID: {invoiceData?.vendor_tax_id || 'US-99882211'} | ap@acmeindustrial.com</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded">
                    INVOICE
                  </span>
                  <p className="text-sm font-bold mt-2 font-mono">{invoiceData?.invoice_number || 'INV-2026-001'}</p>
                  <p className="text-xs text-slate-500">Date: {invoiceData?.invoice_date || '2026-08-15'}</p>
                </div>
              </div>

              {/* Bill To & Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-slate-100 p-3 rounded border border-slate-200 text-xs">
                  <p className="font-semibold text-slate-700 uppercase">Bill To</p>
                  <p className="font-bold text-slate-900 text-sm mt-1">FinancePulse Corporate HQ</p>
                  <p className="text-slate-600">742 Evergreen Terrace</p>
                  <p className="text-slate-600">Accounts Payable Department</p>
                </div>
                <div className="bg-slate-100 p-3 rounded border border-slate-200 text-xs flex flex-col justify-center">
                  <p><span className="text-slate-500">Reference PO:</span> <strong className="font-mono text-indigo-700">PO-99201</strong></p>
                  <p><span className="text-slate-500">Payment Terms:</span> Net 30 Days</p>
                  <p><span className="text-slate-500">Currency:</span> USD ($)</p>
                </div>
              </div>

              {/* Items Table Graphic */}
              <table className="w-full text-xs text-left border-collapse mb-8">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-slate-700 uppercase">
                    <th className="py-2 font-semibold">Item & Description</th>
                    <th className="py-2 font-semibold text-center">Qty</th>
                    <th className="py-2 font-semibold text-right">Unit Price</th>
                    <th className="py-2 font-semibold text-right">Total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoiceData?.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-medium">{it.description}</td>
                      <td className="py-3 text-center font-mono">{it.quantity?.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono">${it.unit_price?.toFixed(2)}</td>
                      <td className="py-3 text-right font-mono font-bold">${it.total_price?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal & Total */}
            <div className="border-t-2 border-slate-900 pt-4">
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-mono font-semibold">${invoiceData?.total_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-600">Tax Total (0%):</span>
                <span className="font-mono font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between text-base font-bold py-2 border-t border-slate-300 mt-2 text-slate-900">
                <span>Total Amount Payable:</span>
                <span className="font-mono text-indigo-900">${invoiceData?.total_amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* SVG Interactive Bounding Boxes Overlay */}
          {showOverlay && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none" 
              viewBox="0 0 800 1000"
              preserveAspectRatio="none"
            >
              {rawElements.map((elem, idx) => {
                const box = elem.box;
                if (!box) return null;
                const isHovered = activeHoverItem === elem.field || activeHoverItem === idx;
                const isFocused = selectedFocusItem === elem.field;

                let strokeColor = '#6366f1';
                let fillColor = 'rgba(99, 102, 241, 0.15)';
                
                if (elem.field?.includes('item_1') || elem.field?.includes('item_2')) {
                  strokeColor = '#10b981';
                  fillColor = 'rgba(16, 185, 129, 0.2)';
                } else if (elem.field === 'total_amount') {
                  strokeColor = '#38bdf8';
                  fillColor = 'rgba(56, 189, 248, 0.2)';
                }

                if (isHovered) {
                  strokeColor = '#f43f5e';
                  fillColor = 'rgba(244, 63, 94, 0.35)';
                }

                if (isFocused) {
                  strokeColor = '#38bdf8';
                  fillColor = 'rgba(56, 189, 248, 0.4)';
                }

                return (
                  <g key={idx} className="pointer-events-auto cursor-pointer"
                     onMouseEnter={() => setActiveHoverItem(elem.field || idx)}
                     onMouseLeave={() => setActiveHoverItem(null)}
                  >
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.w}
                      height={box.h}
                      rx={4}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isFocused ? 4 : (isHovered ? 3 : 2)}
                      strokeDasharray={isFocused ? 'none' : (isHovered ? 'none' : '4 2')}
                      className="transition-all duration-200"
                    />
                    {isFocused && (
                      <circle
                        cx={box.x + box.w / 2}
                        cy={box.y + box.h / 2}
                        r="18"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        className="animate-ping"
                      />
                    )}
                    {(isHovered || isFocused) && (
                      <g transform={`translate(${box.x}, ${Math.max(box.y - 24, 10)})`}>
                        <rect x="0" y="0" width="170" height="22" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                        <text x="8" y="15" fill="#f8fafc" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
                          {elem.text?.substring(0, 20) || elem.field} ({Math.round((elem.confidence || 0.95)*100)}%)
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Footer Info Bar */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Click-to-Zoom Canvas Auto-Pan Enabled</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Scale: 800x1000px</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px]">
            Confidence: 98.4%
          </span>
        </div>
      </div>
    </div>
  );
}
