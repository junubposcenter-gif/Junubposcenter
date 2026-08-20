import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Laptop, 
  X, 
  Download, 
  Check, 
  Info,
  ExternalLink,
  Share2
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstall: () => Promise<void>;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

type DeviceType = 'android' | 'ios' | 'desktop';

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstall,
  showNotification
}) => {
  const [device, setDevice] = useState<DeviceType>('android');
  const [installState, setInstallState] = useState<'idle' | 'installing' | 'completed'>('idle');
  const [inIframe, setInIframe] = useState<boolean>(false);

  // Detect user's current environment and platform
  useEffect(() => {
    if (!isOpen) return;

    // Detect Iframe
    try {
      setInIframe(window.self !== window.top);
    } catch (e) {
      setInIframe(true);
    }
    
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    if (/android/i.test(userAgent)) {
      setDevice('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDevice('ios');
    } else {
      setDevice('desktop');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerAutomaticInstall = async (targetDevice: DeviceType) => {
    setDevice(targetDevice);
    
    if (inIframe) {
      showNotification('Please launch the app in a new tab to bypass preview iframe security and allow direct install!', 'info');
      return;
    }

    if (!deferredPrompt) {
      if (targetDevice === 'ios') {
        showNotification('iOS Safari requires manual pinning. Follow quick steps below!', 'success');
      } else {
        showNotification('No active trigger. Please tap the three dots or browse via Safari/Chrome to trigger automatic download.', 'info');
      }
      return;
    }

    try {
      setInstallState('installing');
      await onInstall();
      setInstallState('completed');
      showNotification('Downloading and installing app...', 'success');
      onClose();
    } catch (err) {
      console.error('[PWA Install Prompt Error]:', err);
      setInstallState('idle');
      showNotification('Automatic install request completed.', 'info');
    }
  };

  const handleOpenSandboxNewTab = () => {
    const currentUrl = window.location.href;
    window.open(currentUrl, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/65 backdrop-blur-md"
          id="pwa-backdrop"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 z-10 flex flex-col font-sans"
          id="pwa-install-dialog"
        >
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white relative">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-5 h-5 text-red-500 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">
                Automatic Setup
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              PWA Application Download & Install
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Set up the dynamic Printing Manager system as a fully native app. Strictly online, zero storage lag, load instantly directly from the network.
            </p>
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
              aria-label="Close"
              id="pwa-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sandbox Warning for Iframes */}
          {inIframe && (
            <div className="bg-amber-50 border-b border-amber-100 p-4 text-amber-900 text-xs flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Iframe Preview Detected</p>
                <p className="mt-0.5 opacity-90">
                  Chrome blocks automatic screen installation inside sandbox developer frames. Tap the button below to open in your native browser and install instantly.
                </p>
                <button
                  onClick={handleOpenSandboxNewTab}
                  className="mt-3.5 flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-lg transition-colors cursor-pointer text-[10px] uppercase tracking-wider"
                  id="pwa-iframe-newtab-btn"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open App to Auto Install
                </button>
              </div>
            </div>
          )}

          {/* Choose Device Step */}
          <div className="p-6 flex-1 overflow-y-auto max-h-[420px]">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
              Select Your Device of Choice:
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Android Card */}
              <button
                onClick={() => triggerAutomaticInstall('android')}
                className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between h-32 ${
                  device === 'android' 
                    ? 'border-red-500 bg-red-50/25 shadow-md shadow-red-50' 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
                id="pwa-device-btn-android"
              >
                <div className="flex justify-between items-start w-full">
                  <Smartphone className={`w-6 h-6 ${device === 'android' ? 'text-red-500' : 'text-slate-400'}`} />
                  {device === 'android' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Android App</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automated downloader setup</p>
                </div>
              </button>

              {/* PC / Mac Card */}
              <button
                onClick={() => triggerAutomaticInstall('desktop')}
                className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between h-32 ${
                  device === 'desktop' 
                    ? 'border-red-500 bg-red-50/25 shadow-md shadow-red-50' 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
                id="pwa-device-btn-desktop"
              >
                <div className="flex justify-between items-start w-full">
                  <Laptop className={`w-6 h-6 ${device === 'desktop' ? 'text-red-500' : 'text-slate-400'}`} />
                  {device === 'desktop' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">PC & macOS</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Install on Desktop</p>
                </div>
              </button>

              {/* iOS Safari Card */}
              <button
                onClick={() => triggerAutomaticInstall('ios')}
                className={`col-span-2 p-4 rounded-2xl text-left border-2 transition-all cursor-pointer flex items-center gap-4 ${
                  device === 'ios'
                    ? 'border-red-500 bg-red-50/25 shadow-md shadow-red-50' 
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
                id="pwa-device-btn-ios"
              >
                <div className="p-2 bg-slate-100 rounded-xl">
                  <svg className="w-6 h-6 fill-slate-700" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.37-6.17-3.61-2.92-7.53-7.71-11.75-14.37-12.18-19.19-18.27-39.75-18.27-61.68 0-16.12 4.13-29.6 12.39-40.44 8.26-10.84 18.66-16.37 31.21-16.6h.44c4.12 0 9.01 1.25 14.63 3.75 5.62 2.49 9.17 3.74 10.65 3.74 1.34 0 4.83-1.25 10.48-3.74 5.65-2.49 10.36-3.69 14.13-3.6h.44c11.85.22 21.6 4.41 29.24 12.56-11.41 6.94-17 16.32-16.78 28.14.22 9.53 3.8 17.51 10.74 23.95 6.94 6.44 15.11 9.94 24.52 10.51-1.99 5.86-4.32 11.45-6.99 16.78zM119.53 19.34c0 7.91-2.9 15.19-8.71 21.84-5.81 6.64-12.71 10.66-20.72 12.06.11-1.33.17-2.61.17-3.83 0-7.39 2.8-14.44 8.4-21.14 5.61-6.7 12.44-10.92 20.48-12.65.23 1.22.38 2.46.38 3.72z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800">Apple iPhone / iPad</h4>
                  <p className="text-[10px] text-slate-400">Install via Safari Home Screen Pinning</p>
                </div>
                {device === 'ios' && <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>}
              </button>
            </div>

            {/* Android Manual Instruction in case trigger fails */}
            {device === 'android' && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Manual Method if required:</p>
                <div className="flex gap-3 items-start" id="android-alt-1">
                  <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-700 flex-shrink-0 mt-0.5">1</div>
                  <p className="text-slate-600 text-xs leading-normal">Open in <strong className="text-slate-800">Chrome</strong>, tap the <strong className="text-slate-800">three dots (⋮)</strong> symbol.</p>
                </div>
                <div className="flex gap-3 items-start" id="android-alt-2">
                  <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-700 flex-shrink-0 mt-0.5">2</div>
                  <p className="text-slate-600 text-xs leading-normal">Select <strong className="text-red-600 font-bold">"Install App"</strong> to start immediate layout setup.</p>
                </div>
              </div>
            )}

            {/* PC / Mac Manual instructions if prompt not caught */}
            {device === 'desktop' && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Manual Method if required:</p>
                <div className="flex gap-3 items-start" id="desktop-alt-1">
                  <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-700 flex-shrink-0 mt-0.5">1</div>
                  <p className="text-slate-600 text-xs leading-normal">Click the <strong className="text-slate-800">PC-with-down-arrow</strong> icon on the right side of Chrome URL / Search Bar.</p>
                </div>
                <div className="flex gap-3 items-start" id="desktop-alt-2">
                  <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-700 flex-shrink-0 mt-0.5">2</div>
                  <p className="text-slate-600 text-xs leading-normal">Select <strong className="text-red-600 font-bold">"Install"</strong> to register native app on your desktop.</p>
                </div>
              </div>
            )}

            {/* iOS Pinning Steps (Unavoidably manual) */}
            {device === 'ios' && (
              <div className="border-t border-slate-100 pt-4 space-y-3.5">
                <div className="flex gap-3 items-start" id="ios-manual-1">
                  <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-700 flex-shrink-0 mt-0.5">1</div>
                  <p className="text-slate-600 text-xs leading-normal">Open Safari on your device and tap the <strong className="text-slate-800">"Share"</strong> icon (box with up arrow).</p>
                </div>
                <div className="flex gap-3 items-start" id="ios-manual-2">
                  <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-700 flex-shrink-0 mt-0.5">2</div>
                  <p className="text-slate-600 text-xs leading-normal">Tap <strong className="text-red-500 font-bold">"Add to Home Screen"</strong> in the popup options.</p>
                </div>
                <div className="flex gap-3 items-start" id="ios-manual-3">
                  <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-700 flex-shrink-0 mt-0.5">3</div>
                  <p className="text-slate-600 text-xs leading-normal">Confirm by tapping <strong className="text-red-600">"Add"</strong> in the upper right. Done!</p>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 tracking-wider">
              ONLINE STRICT MODE
            </span>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              id="pwa-dismiss-btn"
            >
              Done
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
