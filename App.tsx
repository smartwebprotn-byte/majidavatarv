
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoAvatar } from './components/VideoAvatar';
import { ConfigPanel } from './components/ConfigPanel';
import ReloadPrompt from './components/ReloadPrompt';
import { PermissionsOverlay } from './components/PermissionsOverlay';
import { useStore } from './store';
import { stopVoiceSession } from './services/voice-session';
import { Globe, Bell, Info, Key, AlertTriangle, Moon, Phone, PhoneOff } from 'lucide-react';

const App: React.FC = () => {
  const {
    loadStoredData,
    transcription,
    isLive,
    setPermissions,
    groundingChunks,
    showReportToast,
    leads,
    config,
    toggleConfig,
    isTransparent
  } = useStore();

  // Flag pour désactiver l'overlay de clé API durant le développement
  const DEV_MODE_DISABLE_KEY_CHECK = true;
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [checkingKey, setCheckingKey] = useState(!DEV_MODE_DISABLE_KEY_CHECK);

  useEffect(() => {
    loadStoredData();

    const checkKey = async () => {
      if (DEV_MODE_DISABLE_KEY_CHECK) return;
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
      setCheckingKey(false);
    };

    const requestMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setPermissions(true);
      } catch (err) {
        console.warn("Permission micro refusée.");
        setPermissions(false);
      }
    };

    checkKey();
    requestMic();

    return () => {
      stopVoiceSession();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        toggleConfig();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleConfig]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const latestLead = leads[0];

  if (checkingKey) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden ${isTransparent ? 'bg-transparent' : 'bg-[#050505]'}`}>

      {/* Background Ambience */}
      {!isTransparent && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-900/20 blur-[150px] rounded-full" />
        </div>
      )}

      <PermissionsOverlay />

      {/* Maintenance Overlay */}
      <AnimatePresence>
        {config.isMaintenanceMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-6 max-w-sm text-center px-10">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                <Moon className="w-10 h-10 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 block mb-4">Mode Maintenance Actif</span>
                <p className="text-zinc-200 text-lg font-bold leading-relaxed">{config.maintenanceMessage}</p>
                <div className="mt-8 flex items-center justify-center gap-2 text-zinc-500 text-[8px] font-black uppercase tracking-widest">
                  <Info className="w-3 h-3" /> Retour prévu dans quelques instants
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sales Lead Notification */}
      <AnimatePresence>
        {showReportToast && latestLead && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-10 left-1/2 z-[200] pointer-events-auto"
          >
            <div className={`px-8 py-5 rounded-3xl backdrop-blur-3xl border flex items-center gap-6 shadow-2xl ${latestLead.priority === 'urgent' ? 'bg-red-600/20 border-red-500/40' : 'bg-blue-600/20 border-blue-500/40'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${latestLead.priority === 'urgent' ? 'bg-red-600' : 'bg-blue-600'}`}>
                <Bell className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <h4 className="text-white font-black text-sm uppercase tracking-wider">Prospect Détecté !</h4>
                <p className="text-zinc-300 text-xs font-bold uppercase">{latestLead.customerName} : {latestLead.interestedProducts}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays (Transcription/Grounding) */}
      <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-full max-w-xl px-10 z-50 flex flex-col gap-4">
        <AnimatePresence>
          {groundingChunks.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-wrap justify-center gap-2 mb-2">
              {groundingChunks.filter(chunk => chunk.web && chunk.web.uri).map((chunk, i) => (
                <button key={i} onClick={() => window.open(chunk.web!.uri, '_blank')} className="pointer-events-auto flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-3 py-1.5 rounded-full backdrop-blur-md hover:bg-blue-600/20 transition-all group">
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-300 max-w-[120px] truncate">{chunk.web!.title || 'Lien'}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isLive && (transcription.user || transcription.ai) && (
            <motion.div key={transcription.ai ? 'ai' : 'user'} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
              <div className={`relative px-8 py-6 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl border ${transcription.ai ? 'bg-zinc-900/80 text-white border-white/10' : 'bg-red-600/30 text-red-50 border-red-500/20 italic'}`}>
                {transcription.ai && (
                  <div className="absolute -top-3 left-8 px-3 py-1 bg-red-600 rounded-full flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">Expert Abdelmajid</span>
                  </div>
                )}
                <p className={`text-base font-bold leading-relaxed text-center ${transcription.ai ? '' : 'text-sm opacity-80'}`}>
                  {transcription.ai || transcription.user}
                </p>
              </div>
              <div className={`w-6 h-6 rotate-45 -mt-3 border-r border-b ${transcription.ai ? 'bg-zinc-900/80 border-white/10' : 'bg-red-600/30 border-red-500/20'}`} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-auto">
        <ConfigPanel />
      </div>

      <div className="pointer-events-auto">
        <VideoAvatar />
        <ReloadPrompt />
      </div>
    </div>
  );
};

export default App;
