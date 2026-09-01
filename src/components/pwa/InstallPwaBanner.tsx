'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, Sparkles, Flame } from 'lucide-react';

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone app
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (standalone) {
      setIsStandalone(true);
      return;
    }

    // Check if user already saw or dismissed the banner once
    const alreadySeen = localStorage.getItem('pwa_install_banner_seen');
    if (alreadySeen) {
      return;
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Chrome/Android install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!localStorage.getItem('pwa_install_banner_seen')) {
        setShowBanner(true);
        localStorage.setItem('pwa_install_banner_seen', 'true');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // On iOS, show banner only once if not standalone and not seen
    if (isIosDevice && !standalone) {
      setShowBanner(true);
      localStorage.setItem('pwa_install_banner_seen', 'true');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    localStorage.setItem('pwa_install_banner_seen', 'true');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_install_banner_seen', 'true');
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-md bg-[#111218]/95 backdrop-blur-xl border border-[#ff6b00]/40 rounded-2xl p-3.5 shadow-2xl shadow-[#ff6b00]/10 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#171822] text-[#ff6b00] border border-[#2e303d] flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-white tracking-tight">
                Install WORKOUTS App
              </h4>
              <p className="text-[10px] text-zinc-400 truncate">
                Add to your phone home screen for instant access
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl btn-orange text-xs font-black cursor-pointer shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div 
            className="w-full max-w-sm bg-[#111218] border border-[#212330] rounded-3xl p-5 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-[#ff6b00]" />
              <h3 className="text-sm font-extrabold text-white">
                Install on iPhone / iPad
              </h3>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#09090b] border border-[#1e202c]">
                <div className="w-6 h-6 rounded-lg bg-[#171822] text-[#ff6b00] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </div>
                <p>
                  Tap the <strong className="text-white">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-sky-400" /> at the bottom of Safari.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#09090b] border border-[#1e202c]">
                <div className="w-6 h-6 rounded-lg bg-[#171822] text-[#ff6b00] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </div>
                <p>
                  Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#ff6b00]" />.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl btn-orange text-xs font-black cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
