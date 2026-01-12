
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { useStore } from '../store';

export const PermissionsOverlay: React.FC = () => {
  const { hasPermissions } = useStore();

  return (
    <AnimatePresence>
      {!hasPermissions && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-zinc-900 w-full max-w-md rounded-[3rem] p-10 border border-white/5 shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-500">
              <Mic className="w-10 h-10 animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Accès Micro Requis</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Pour que <span className="text-white font-bold">Abdelmajid</span> puisse vous entendre et vous conseiller, nous avons besoin d'activer votre microphone.
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">Confidentialité Totale</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <Lock className="w-5 h-5 text-blue-500" />
                <span className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">SSL Sécurisé</span>
              </div>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4" /> Autoriser le Micro
            </button>
            
            <p className="mt-6 text-[8px] text-zinc-600 font-black uppercase tracking-widest">
              T.T.A Distribution Tunis - Manager Bridge v3.2
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
