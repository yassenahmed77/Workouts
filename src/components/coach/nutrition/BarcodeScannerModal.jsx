'use client';
import React, { useState, useEffect, useRef } from 'react';
import { VERIFIED_FOOD_DATABASE } from '@/lib/foodDatabase';
import { openFoodFactsService } from '@/services/openFoodFactsService';
import { X, Camera, Barcode, Search, Loader2, AlertCircle } from 'lucide-react';
export const BarcodeScannerModal = ({ isOpen, onClose, onFoodFound }) => {
    const [manualBarcode, setManualBarcode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    // Quick demo test barcodes
    const sampleBarcodes = [
        { label: 'ON Gold Standard Whey', code: '748927024104' },
        { label: 'Almarai Greek Yogurt 0%', code: '6281007010412' },
        { label: 'Rio Mare Canned Tuna', code: '8004030012015' },
        { label: 'Quaker Rolled Oats', code: '030000010402' }
    ];
    // Camera start / stop logic
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setErrorMessage(null);
            setManualBarcode('');
            return;
        }
        startCamera();
        return () => {
            stopCamera();
        };
    }, [isOpen]);
    const startCamera = async () => {
        setErrorMessage(null);
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsCameraActive(true);
                }
            }
        }
        catch (err) {
            console.warn('Camera stream not accessible or blocked:', err);
            setIsCameraActive(false);
        }
    };
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };
    const handleLookupBarcode = async (barcode) => {
        const clean = barcode.trim();
        if (!clean)
            return;
        setIsScanning(true);
        setErrorMessage(null);
        // 1. Search local verified database first
        const localMatch = VERIFIED_FOOD_DATABASE.find((f) => f.barcode === clean);
        if (localMatch) {
            setIsScanning(false);
            onFoodFound(localMatch);
            onClose();
            return;
        }
        // 2. Query Open Food Facts global database
        try {
            const liveMatch = await openFoodFactsService.fetchByBarcode(clean);
            if (liveMatch) {
                setIsScanning(false);
                onFoodFound(liveMatch);
                onClose();
                return;
            }
        }
        catch {
            // ignore
        }
        setIsScanning(false);
        setErrorMessage(`Barcode "${clean}" not found. You can add it as a Custom Food.`);
    };
    if (!isOpen)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-sans text-slate-100">
      <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-2xl space-y-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3 border-b border-[var(--card-border)] bg-[var(--card-subtle-bg)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--main-color)]/15 border border-[var(--main-color)]/30 flex items-center justify-center text-[var(--main-color)]">
              <Barcode className="w-4 h-4"/>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Barcode Scanner</h3>
              <p className="text-[11px] text-slate-400 font-mono">Scan package or type barcode</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* Camera Viewfinder or Simulated Scan Box */}
        <div className="px-4">
          <div className="relative aspect-video w-full rounded-xl bg-black border border-[var(--card-border)] overflow-hidden flex items-center justify-center">
            {isCameraActive ? (<video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>) : (<div className="text-center p-4 space-y-2">
                <Camera className="w-8 h-8 text-zinc-600 mx-auto animate-pulse"/>
                <p className="text-xs text-zinc-400">
                  Camera ready. Align packaging barcode in frame.
                </p>
              </div>)}

            {/* Glowing Laser Scan Bar */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-[var(--main-color)] shadow-[0_0_12px_var(--main-color)] animate-pulse"/>
            
            {/* Viewfinder Target Corners */}
            <div className="absolute inset-6 pointer-events-none border-2 border-dashed border-[var(--main-color)]/50 rounded-lg"/>
          </div>
        </div>

        {/* Manual Barcode Entry Form */}
        <div className="px-4 space-y-3 pb-2">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleLookupBarcode(manualBarcode);
        }} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2"/>
              <input type="text" placeholder="Enter UPC / Barcode (e.g. 748927024104)..." value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--main-color)] font-mono transition-colors"/>
            </div>
            <button type="submit" disabled={!manualBarcode.trim() || isScanning} className="gym-btn-primary text-xs inline-flex items-center gap-1.5 flex-shrink-0">
              {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Search className="w-3.5 h-3.5"/>}
              <span>Lookup</span>
            </button>
          </form>

          {/* Error Message */}
          {errorMessage && (<div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0"/>
              <span>{errorMessage}</span>
            </div>)}

          {/* Quick Demo Test Barcodes */}
          <div className="space-y-1.5 pb-2">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
              Quick Test Barcodes:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {sampleBarcodes.map((item) => (<button key={item.code} type="button" onClick={() => {
                setManualBarcode(item.code);
                handleLookupBarcode(item.code);
            }} className="p-2 rounded-lg bg-[var(--card-subtle-bg)] border border-[var(--card-border)] hover:border-[var(--main-color)]/40 text-left transition-all cursor-pointer group">
                  <span className="text-[11px] font-bold text-zinc-200 group-hover:text-[var(--main-color)] block truncate">
                    {item.label}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 block">
                    {item.code}
                  </span>
                </button>))}
            </div>
          </div>
        </div>
      </div>
    </div>);
};
