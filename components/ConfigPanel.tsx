
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   X, Monitor, FileVideo, UserCheck, ScrollText, ListChecks,
   Plus, CheckCircle, Circle, Trash2, LayoutGrid, Coffee, Sparkles,
   Info, ShoppingBag, Eye, Palette, Download, Image as ImageIcon,
   Activity, ShieldAlert, ShieldCheck, BarChart3, TrendingUp, History, UserPlus,
   RefreshCw, Package, Tag, ArrowRight, Bell, Cloud, Trash, Check, Upload, Save,
   Volume2, Settings2, Moon, Sun, Phone, Share2, FileJson, Terminal, Search, Filter,
   MoreVertical, Edit3, Heart, Layers, MessageSquareText, Sliders, Zap, ExternalLink,
   Mail, MessageCircle
} from 'lucide-react';
import { useStore } from '../store';
import { VideoFiles, TodoTask, Product, VoiceName, LogEntry, GeneratedImage, SalesLead, ActiveSession } from '../types';

type Tab = 'dashboard' | 'videos' | 'usage' | 'leads' | 'todos' | 'studio' | 'catalog' | 'logs' | 'sessions' | 'settings';

export const ConfigPanel: React.FC = () => {
   const {
      showConfig, toggleConfig, usage, leads, logs, catalog, generatedImages,
      updateProductStock, updateProduct, addProduct, removeProduct, syncData, isSyncing, setVideo, videoUrls,
      markLeadAsProcessed, removeLead, exportLeads, todos, addTodo, toggleTodo, removeTodo,
      config, updateConfig, clearLogs, removeGeneratedImage, systemInstruction, updateSystemInstruction,
      transcription, loadStoredData, isTransparent, activeSessions, updateSession, endSession
   } = useStore();

   const [activeTab, setActiveTab] = useState<Tab>('dashboard');
   const [logFilter, setLogFilter] = useState<LogEntry['type'] | 'all'>('all');
   const [logSearch, setLogSearch] = useState('');
   const [editingProductId, setEditingProductId] = useState<string | null>(null);
   const [showAddProduct, setShowAddProduct] = useState(false);
   const [newTodoText, setNewTodoText] = useState('');
   const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null);

   const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
      name: '', brand: '', category: 'Café', description: '', specs: [], stock: 0, price: 'Sur devis'
   });

   const scrollRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (scrollRef.current && activeTab === 'logs') {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
   }, [logs, activeTab]);

   const urgentLeadsCount = leads.filter(l => l.priority === 'urgent' && !l.processed).length;
   const pendingTodos = todos.filter(t => !t.completed).length;
   const quotaPercent = (usage.requestsToday / 1500) * 100;
   const isHighLoad = quotaPercent > 90;

   const filteredLogs = logs.filter(log => {
      const matchesFilter = logFilter === 'all' || log.type === logFilter;
      const matchesSearch = log.message.toLowerCase().includes(logSearch.toLowerCase());
      return matchesFilter && matchesSearch;
   });

   const handleFileUpload = async (key: keyof VideoFiles, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) await setVideo(key, file);
   };

   const downloadImage = (img: GeneratedImage) => {
      const link = document.createElement('a');
      link.href = img.url;
      link.download = `tta_marketing_${img.id}.png`;
      link.click();
   };

   const handleAddProduct = () => {
      if (!newProduct.name || !newProduct.brand) return;
      addProduct(newProduct);
      setShowAddProduct(false);
      setNewProduct({
         name: '', brand: '', category: 'Café', description: '', specs: [], stock: 0, price: 'Sur devis'
      });
   };

   return (
      <AnimatePresence>
         {showConfig && (
            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 ${isTransparent ? 'bg-transparent' : 'bg-black/95 backdrop-blur-2xl'}`}>
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#080809] w-full max-w-7xl h-full max-h-[92vh] rounded-[3.5rem] overflow-hidden flex flex-col border border-white/5 shadow-2xl relative">

                  {/* Header Navigation Area */}
                  <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-black/40 shrink-0">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/20">
                           <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <div>
                           <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-tight">T.T.A Control Tower</h2>
                           <div className="flex items-center gap-2">
                              <Cloud className={`w-3 h-3 ${isSyncing ? 'text-blue-400 animate-pulse' : 'text-emerald-500'}`} />
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">
                                 {isSyncing ? 'Sync Cloud en cours...' : 'Manager Bridge Connecté'}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 mr-4">
                           <div className="flex flex-col items-end">
                              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-tight">Gemini API Load</span>
                              <span className={`text-[10px] font-black font-mono leading-tight ${isHighLoad ? 'text-red-500' : 'text-white'}`}>{quotaPercent.toFixed(1)}%</span>
                           </div>
                           {isHighLoad ? <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                        </div>

                        <button onClick={syncData} disabled={isSyncing} className="hidden sm:flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-300 border border-white/5 transition-all active:scale-95">
                           <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                           {isSyncing ? 'Sauvegarde...' : 'Sync Cloud'}
                        </button>

                        <button onClick={toggleConfig} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all group active:scale-90">
                           <X className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                        </button>
                     </div>
                  </div>

                  <div className="flex-1 flex overflow-hidden">
                     {/* Main Sidebar */}
                     <div className="w-24 sm:w-64 border-r border-white/5 bg-black/20 flex flex-col py-8 overflow-y-auto shrink-0">
                        {[
                           { id: 'dashboard', icon: LayoutGrid, label: 'Vision 360' },
                           { id: 'leads', icon: UserPlus, label: 'Leads Clients', badge: urgentLeadsCount },
                           { id: 'todos', icon: ListChecks, label: 'Notes & Tâches', badge: pendingTodos },
                           { id: 'catalog', icon: Package, label: 'Stock Pro' },
                           { id: 'studio', icon: Palette, label: 'Marketing' },
                           { id: 'sessions', icon: Activity, label: 'Sessions Manager' },
                           { id: 'videos', icon: FileVideo, label: 'Avatar AI' },
                           { id: 'logs', icon: Terminal, label: 'Live Console' },
                           { id: 'usage', icon: BarChart3, label: 'Statistiques' },
                           { id: 'settings', icon: Settings2, label: 'Système' },
                        ].map((tab) => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as Tab)}
                              className={`flex items-center gap-4 px-8 py-5 transition-all relative group ${activeTab === tab.id ? 'text-blue-500 bg-blue-500/5 border-r-2 border-blue-500' : 'text-zinc-500 hover:text-white'}`}
                           >
                              <tab.icon className={`w-5 h-5 transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                              <span className="hidden sm:inline text-sm font-bold tracking-tight">{tab.label}</span>
                              {tab.badge ? (
                                 <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-red-900/40">
                                    {tab.badge}
                                 </span>
                              ) : null}
                           </button>
                        ))}
                     </div>

                     {/* Dynamic Content Area */}
                     <div className="flex-1 overflow-y-auto p-10 bg-[#080809] custom-scrollbar relative">
                        <AnimatePresence mode="wait">
                           {activeTab === 'dashboard' && (
                              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/[0.07] transition-all cursor-pointer group shadow-xl" onClick={() => setActiveTab('leads')}>
                                       <UserPlus className="w-6 h-6 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                                       <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Prospectus</h4>
                                       <p className="text-4xl font-black text-white mt-1">{leads.filter(l => !l.processed).length}</p>
                                    </div>
                                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/[0.07] transition-all cursor-pointer group shadow-xl" onClick={() => setActiveTab('todos')}>
                                       <ListChecks className="w-6 h-6 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                                       <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tâches</h4>
                                       <p className="text-4xl font-black text-white mt-1">{pendingTodos}</p>
                                    </div>
                                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/[0.07] transition-all cursor-pointer group shadow-xl" onClick={() => setActiveTab('usage')}>
                                       <Activity className="w-6 h-6 text-violet-500 mb-4 group-hover:scale-110 transition-transform" />
                                       <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sessions</h4>
                                       <p className="text-4xl font-black text-white mt-1">{usage.totalSessions}</p>
                                    </div>
                                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/[0.07] transition-all cursor-pointer group shadow-xl" onClick={() => setActiveTab('catalog')}>
                                       <Package className="w-6 h-6 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
                                       <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Catalogue</h4>
                                       <p className="text-4xl font-black text-white mt-1">{catalog.length}</p>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 bg-white/5 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
                                       <div className="flex items-center justify-between mb-8">
                                          <div>
                                             <h4 className="text-xl font-black text-white uppercase tracking-tight">Transcription Live</h4>
                                             <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Flux de conversation en temps réel</p>
                                          </div>
                                          <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500">
                                             <MessageSquareText className="w-5 h-5 animate-pulse" />
                                          </div>
                                       </div>

                                       <div className="space-y-6 h-64 overflow-y-auto custom-scrollbar-terminal pr-4">
                                          {transcription.user || transcription.ai ? (
                                             <>
                                                {transcription.user && (
                                                   <div className="bg-blue-600/10 p-5 rounded-2xl border border-blue-500/20 max-w-[80%]">
                                                      <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 block">Client</span>
                                                      <p className="text-sm font-bold text-blue-100 leading-relaxed italic">"{transcription.user}"</p>
                                                   </div>
                                                )}
                                                {transcription.ai && (
                                                   <div className="bg-zinc-800/40 p-5 rounded-2xl border border-white/5 max-w-[80%] ml-auto">
                                                      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block">Assistant Abdelmajid</span>
                                                      <p className="text-sm font-bold text-white leading-relaxed">"{transcription.ai}"</p>
                                                   </div>
                                                )}
                                             </>
                                          ) : (
                                             <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                                                <Activity className="w-12 h-12 mb-4" />
                                                <p className="text-xs font-black uppercase tracking-widest">Aucune activité vocale détectée</p>
                                             </div>
                                          )}
                                       </div>
                                    </div>

                                    <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                                       <h4 className="text-xl font-black text-white uppercase tracking-tight mb-8">Alertes Rapides</h4>
                                       <div className="space-y-4">
                                          {leads.filter(l => l.priority === 'urgent' && !l.processed).slice(0, 3).map(lead => (
                                             <div key={lead.id} onClick={() => { setSelectedLead(lead); setActiveTab('leads'); }} className="p-5 bg-red-600/10 border border-red-500/20 rounded-2xl cursor-pointer hover:bg-red-600/20 transition-all active:scale-95 shadow-lg">
                                                <h5 className="text-xs font-black text-red-500 uppercase mb-1">{lead.customerName}</h5>
                                                <p className="text-[10px] text-zinc-400 font-bold line-clamp-1 italic">{lead.interestedProducts}</p>
                                             </div>
                                          ))}
                                          {leads.filter(l => l.priority === 'urgent' && !l.processed).length === 0 && (
                                             <div className="text-center py-10 opacity-20"><ShieldCheck className="w-10 h-10 mx-auto" /></div>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              </motion.div>
                           )}

                           {activeTab === 'leads' && (
                              <motion.div key="leads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                 <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Registre Commercial</h3>
                                    <button onClick={exportLeads} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase text-zinc-300 border border-white/5 transition-all flex items-center gap-2 active:scale-95">
                                       <FileJson className="w-4 h-4 text-blue-500" /> Exporter Registre
                                    </button>
                                 </div>

                                 <div className="grid grid-cols-1 gap-4">
                                    {leads.map(lead => (
                                       <div key={lead.id} onClick={() => setSelectedLead(lead)} className={`p-8 rounded-[2.5rem] border flex items-center justify-between group transition-all cursor-pointer relative overflow-hidden ${lead.processed ? 'opacity-40 grayscale bg-black/40 border-white/5' : 'bg-white/5 border-white/5 hover:border-blue-500/30'}`}>
                                          <div className="flex-1">
                                             <div className="flex items-center gap-4 mb-3">
                                                <h4 className={`text-xl font-black uppercase ${lead.priority === 'urgent' && !lead.processed ? 'text-red-500' : 'text-blue-500'}`}>{lead.customerName}</h4>
                                                <span className="text-[8px] text-zinc-600 font-mono tracking-widest uppercase">{new Date(lead.timestamp).toLocaleDateString()} {new Date(lead.timestamp).toLocaleTimeString()}</span>
                                             </div>
                                             <div className="flex items-center gap-4">
                                                <span className="text-xs font-bold text-zinc-400">{lead.interestedProducts}</span>
                                                {lead.priority === 'urgent' && !lead.processed && <span className="px-2 py-0.5 bg-red-600 rounded text-[8px] font-black text-white uppercase tracking-widest animate-pulse">Urgent</span>}
                                             </div>
                                          </div>
                                          <div className="flex gap-2">
                                             {!lead.processed && (
                                                <button onClick={(e) => { e.stopPropagation(); markLeadAsProcessed(lead.id); }} className="p-3 bg-emerald-600/10 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-90"><Check className="w-4 h-4" /></button>
                                             )}
                                             <button onClick={(e) => { e.stopPropagation(); removeLead(lead.id); }} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90"><Trash className="w-4 h-4" /></button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>

                                 <AnimatePresence>
                                    {selectedLead && (
                                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                                          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#111112] w-full max-w-2xl rounded-[3rem] border border-white/10 p-12 shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-y-auto max-h-[90vh] custom-scrollbar">
                                             <div className="flex justify-between items-start mb-10">
                                                <div>
                                                   <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full mb-4 inline-block ${selectedLead.priority === 'urgent' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                                                      Lead {selectedLead.priority}
                                                   </span>
                                                   <h3 className="text-4xl font-black text-white uppercase tracking-tight leading-tight">{selectedLead.customerName}</h3>
                                                </div>
                                                <button onClick={() => setSelectedLead(null)} className="p-3 bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all active:scale-90"><X className="w-6 h-6" /></button>
                                             </div>

                                             <div className="grid grid-cols-2 gap-8 mb-10">
                                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                                   <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Contact Client</label>
                                                   <p className="text-xl font-bold text-white flex items-center gap-3">
                                                      <Phone className="w-5 h-5 text-blue-500" /> {selectedLead.customerPhone || 'Non spécifié'}
                                                   </p>
                                                </div>
                                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                                   <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Intérêt Produit</label>
                                                   <p className="text-xl font-bold text-white flex items-center gap-3">
                                                      <ShoppingBag className="w-5 h-5 text-emerald-500" /> {selectedLead.interestedProducts}
                                                   </p>
                                                </div>
                                             </div>

                                             <div className="space-y-8 mb-10">
                                                <div>
                                                   <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-3 block italic">Rapport de l'IA Abdelmajid</label>
                                                   <div className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-[2rem] text-blue-100/80 leading-relaxed text-sm italic shadow-inner">
                                                      "{selectedLead.summary}"
                                                   </div>
                                                </div>
                                             </div>

                                             <div className="flex gap-4">
                                                <button
                                                   onClick={() => {
                                                      const subject = encodeURIComponent(`Offre T.T.A - ${selectedLead.customerName}`);
                                                      const body = encodeURIComponent(`Bonjour ${selectedLead.customerName},\n\nSuite à votre intérêt pour ${selectedLead.interestedProducts}, nous revenons vers vous...`);
                                                      window.open(`mailto:ttadis@gnet.tn?subject=${subject}&body=${body}`);
                                                   }}
                                                   className="flex-1 py-2.5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                                                >
                                                   <Mail className="w-4 h-4" /> Envoyer Offre
                                                </button>
                                                <button
                                                   onClick={() => {
                                                      if (!selectedLead.customerPhone) return alert("Numéro de téléphone manquant");
                                                      const phone = selectedLead.customerPhone.replace(/\D/g, '');
                                                      const text = encodeURIComponent(`Bonjour ${selectedLead.customerName}, c'est l'équipe T.T.A Distribution.`);
                                                      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                                                   }}
                                                   className="flex-1 py-2.5 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 active:scale-95 transition-all"
                                                >
                                                   <MessageCircle className="w-4 h-4" /> WhatsApp Direct
                                                </button>
                                             </div>
                                          </motion.div>
                                       </motion.div>
                                    )}
                                 </AnimatePresence>
                              </motion.div>
                           )}

                           {activeTab === 'catalog' && (
                              <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
                                 <div className="flex justify-between items-center">
                                    <div>
                                       <h3 className="text-2xl font-black text-white uppercase tracking-tight">Stock Pro T.T.A</h3>
                                       <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Gestion de l'inventaire en temps réel</p>
                                    </div>
                                    <button onClick={() => setShowAddProduct(true)} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-2xl shadow-xl shadow-blue-900/20 flex items-center gap-3 transition-transform active:scale-95">
                                       <Plus className="w-4 h-4" /> Nouveau Produit
                                    </button>
                                 </div>

                                 <div className="grid grid-cols-1 gap-6">
                                    {catalog.map(product => (
                                       <div key={product.id} className="bg-white/5 border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 group hover:bg-white/[0.08] transition-all relative">
                                          <div className="w-28 h-28 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-inner">
                                             <Coffee className={`w-12 h-12 ${product.stock === 0 ? 'text-zinc-800' : 'text-blue-500'} group-hover:scale-110 transition-transform`} />
                                          </div>

                                          <div className="flex-1 text-center md:text-left">
                                             <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{product.brand}</span>
                                                <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{product.category}</span>
                                             </div>

                                             {editingProductId === product.id ? (
                                                <div className="flex items-center gap-4">
                                                   <input
                                                      autoFocus
                                                      defaultValue={product.name}
                                                      onBlur={(e) => { updateProduct(product.id, { name: (e.target as HTMLInputElement).value }); setEditingProductId(null); }}
                                                      onKeyDown={(e) => e.key === 'Enter' && (updateProduct(product.id, { name: (e.target as HTMLInputElement).value }), setEditingProductId(null))}
                                                      className="bg-black/60 border border-blue-500/50 rounded-xl px-4 py-2 text-2xl font-black text-white uppercase outline-none w-full"
                                                   />
                                                   <button onClick={() => setEditingProductId(null)} className="p-2 text-emerald-500"><Check className="w-6 h-6" /></button>
                                                </div>
                                             ) : (
                                                <div className="flex items-center justify-center md:justify-start gap-3">
                                                   <h4 className="text-2xl font-black text-white uppercase group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => setEditingProductId(product.id)}>
                                                      {product.name}
                                                   </h4>
                                                   <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity" />
                                                </div>
                                             )}
                                             <p className="text-zinc-500 text-sm mt-2 italic max-w-lg leading-relaxed line-clamp-2">"{product.description}"</p>
                                          </div>

                                          <div className="flex items-center gap-12 shrink-0 border-l border-white/5 pl-12 h-full">
                                             <div className="text-center">
                                                <span className="text-[10px] font-black text-zinc-600 uppercase block mb-3">En Stock</span>
                                                <div className="flex items-center gap-4 bg-black/40 rounded-2xl p-2 border border-white/5">
                                                   <button onClick={() => updateProductStock(product.id, Math.max(0, product.stock - 1))} className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-all font-black text-xl active:scale-90">-</button>
                                                   <span className={`text-2xl font-black w-12 text-center ${product.stock === 0 ? 'text-red-500' : 'text-white'}`}>{product.stock}</span>
                                                   <button onClick={() => updateProductStock(product.id, product.stock + 1)} className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-emerald-500 transition-all font-black text-xl active:scale-90">+</button>
                                                </div>
                                             </div>
                                             <div className="text-right w-40">
                                                <span className="text-[10px] font-black text-zinc-600 uppercase block mb-2">Prix Unitaire</span>
                                                <input
                                                   defaultValue={product.price}
                                                   onBlur={(e) => updateProduct(product.id, { price: (e.target as HTMLInputElement).value })}
                                                   className="bg-transparent border-none text-xl font-black text-blue-400 uppercase text-right outline-none w-full focus:text-white"
                                                />
                                             </div>
                                             <button onClick={() => removeProduct(product.id)} className="p-4 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all active:scale-90">
                                                <Trash2 className="w-5 h-5" />
                                             </button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>

                                 <AnimatePresence>
                                    {showAddProduct && (
                                       <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                                       >
                                          <motion.div
                                             initial={{ scale: 0.9, y: 20 }}
                                             animate={{ scale: 1, y: 0 }}
                                             exit={{ scale: 0.9, y: 20 }}
                                             className="bg-[#0f0f10] w-full max-w-xl rounded-[3.5rem] border border-white/10 p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                                          >
                                             <div className="flex justify-between items-center mb-10">
                                                <div>
                                                   <h4 className="text-2xl font-black text-white uppercase tracking-tight">Nouveau Matériel</h4>
                                                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Expansion du catalogue expert</p>
                                                </div>
                                                <button onClick={() => setShowAddProduct(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                                             </div>
                                             <div className="space-y-8">
                                                <div className="grid grid-cols-2 gap-6">
                                                   <div className="col-span-2">
                                                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Nom Complet</label>
                                                      <input
                                                         value={newProduct.name}
                                                         onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                                         placeholder="Astoria Storm Profiler..."
                                                         className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-blue-500 transition-all font-bold"
                                                      />
                                                   </div>
                                                   <div>
                                                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Marque</label>
                                                      <input
                                                         value={newProduct.brand}
                                                         onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                                         placeholder="Astoria, La Cimbali..."
                                                         className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-blue-500 font-bold"
                                                      />
                                                   </div>
                                                   <div>
                                                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Catégorie</label>
                                                      <select
                                                         value={newProduct.category}
                                                         onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as Product['category'] })}
                                                         className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-blue-500 cursor-pointer font-bold appearance-none"
                                                      >
                                                         <option value="Café">Café</option>
                                                         <option value="Glace">Glace</option>
                                                         <option value="Froid">Froid</option>
                                                         <option value="Vitrine">Vitrine</option>
                                                      </select>
                                                   </div>
                                                </div>
                                                <div>
                                                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Description Marketing</label>
                                                   <textarea
                                                      value={newProduct.description}
                                                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                                      placeholder="Description courte pour l'assistant..."
                                                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white h-32 outline-none focus:border-blue-500 resize-none font-medium leading-relaxed"
                                                   />
                                                </div>
                                                <div className="flex gap-4 mt-4">
                                                   <button onClick={() => setShowAddProduct(false)} className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-zinc-400 font-black uppercase text-[10px] rounded-2xl transition-all">Annuler</button>
                                                   <button onClick={handleAddProduct} className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl shadow-blue-900/40 transition-all flex items-center justify-center gap-3">
                                                      <Check className="w-4 h-4" /> Finaliser l'Ajout
                                                   </button>
                                                </div>
                                             </div>
                                          </motion.div>
                                       </motion.div>
                                    )}
                                 </AnimatePresence>
                              </motion.div>
                           )}

                           {activeTab === 'studio' && (
                              <motion.div key="studio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                 <div className="flex justify-between items-center">
                                    <div>
                                       <h3 className="text-2xl font-black text-white uppercase tracking-tight">Marketing Studio Pro</h3>
                                       <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Visuels de campagne générés par l'IA</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                       <Sparkles className="w-5 h-5 text-amber-500" />
                                       <span className="text-[10px] font-black text-white uppercase tracking-widest">{generatedImages.length} Actifs</span>
                                    </div>
                                 </div>

                                 {generatedImages.length === 0 ? (
                                    <div className="h-96 flex flex-col items-center justify-center bg-white/5 rounded-[4rem] border border-white/5 text-zinc-600 gap-6">
                                       <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                                          <Palette className="w-10 h-10 opacity-20" />
                                       </div>
                                       <div className="text-center">
                                          <p className="text-sm font-black uppercase tracking-[0.3em]">Studio Vide</p>
                                          <p className="text-xs text-zinc-700 font-bold uppercase mt-2">Demandez à Abdelmajid de générer des posters</p>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                       {generatedImages.map(img => (
                                          <motion.div
                                             key={img.id}
                                             initial={{ opacity: 0, scale: 0.9 }}
                                             animate={{ opacity: 1, scale: 1 }}
                                             className="group relative aspect-square bg-[#0c0c0d] rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl"
                                          >
                                             <img src={img.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={img.prompt} />
                                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-10 flex flex-col justify-end">
                                                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6 shadow-xl">
                                                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                      <Sparkles className="w-3 h-3" /> AI Content Engine
                                                   </p>
                                                   <p className="text-xs text-white font-bold italic line-clamp-3 leading-relaxed">"{img.prompt}"</p>
                                                </div>
                                                <div className="flex gap-3">
                                                   <button onClick={() => downloadImage(img)} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white text-[10px] font-black uppercase flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95">
                                                      <Download className="w-4 h-4" /> Download
                                                   </button>
                                                   <button onClick={() => removeGeneratedImage(img.id)} className="p-4 bg-red-600/20 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-90">
                                                      <Trash2 className="w-5 h-5" />
                                                   </button>
                                                </div>
                                             </div>
                                          </motion.div>
                                       ))}
                                    </div>
                                 )}
                              </motion.div>
                           )}

                           {activeTab === 'usage' && (
                              <motion.div key="usage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 flex flex-col gap-6 group hover:bg-white/[0.08] transition-all">
                                       <BarChart3 className="w-12 h-12 text-blue-500 group-hover:scale-110 transition-transform" />
                                       <div>
                                          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Requêtes Gemini</h4>
                                          <span className="text-5xl font-black text-white leading-none">{usage.requestsToday}</span>
                                          <span className="text-xs text-zinc-700 font-black tracking-widest ml-4 italic">/ 1.5K Jour</span>
                                       </div>
                                    </div>
                                    <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 flex flex-col gap-6 group hover:bg-white/[0.08] transition-all">
                                       <Activity className="w-12 h-12 text-emerald-500 group-hover:scale-110 transition-transform" />
                                       <div>
                                          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Sessions Manager</h4>
                                          <span className="text-5xl font-black text-white">{usage.totalSessions}</span>
                                          <span className="text-xs text-zinc-700 font-black tracking-widest ml-4 italic">Actif</span>
                                       </div>
                                    </div>
                                    <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/5 flex flex-col gap-6 group hover:bg-white/[0.08] transition-all">
                                       <ShieldCheck className="w-12 h-12 text-amber-500 group-hover:scale-110 transition-transform" />
                                       <div>
                                          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Système Core</h4>
                                          <span className="text-2xl font-black text-white uppercase italic">Optimal</span>
                                          <p className="text-[8px] text-zinc-600 font-black uppercase mt-2">v3.2.4 Final STABLE</p>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="bg-white/5 p-12 rounded-[4rem] border border-white/5 relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[120px] rounded-full" />
                                    <div className="flex justify-between items-end mb-12">
                                       <div>
                                          <h4 className="text-3xl font-black text-white uppercase tracking-tight">Activité Historique</h4>
                                          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2">Volume de transactions AI</p>
                                       </div>
                                       <div className="text-right">
                                          <span className={`text-6xl font-black font-mono leading-none ${isHighLoad ? 'text-red-500' : 'text-blue-500'}`}>{quotaPercent.toFixed(1)}%</span>
                                          <p className="text-[10px] font-black text-zinc-600 uppercase mt-2">Saturation Quota API</p>
                                       </div>
                                    </div>
                                    <div className="h-64 flex items-end gap-8 px-6">
                                       {usage.history.length === 0 ? (
                                          <div className="w-full h-full flex items-center justify-center border-t border-white/5 mt-10">
                                             <p className="text-zinc-700 italic text-sm uppercase tracking-widest font-black opacity-30">Données en synchronisation...</p>
                                          </div>
                                       ) : (
                                          usage.history.slice().reverse().map((h, i) => (
                                             <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                                <motion.div
                                                   initial={{ height: 0 }}
                                                   animate={{ height: `${Math.max(10, (h.count / 300) * 100)}%` }}
                                                   className={`w-full ${h.count > 250 ? 'bg-red-500/30 border-red-500' : 'bg-blue-600/20 border-blue-500'} border-t-4 rounded-t-2xl group-hover:bg-blue-600/40 transition-all relative shadow-xl`}
                                                >
                                                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-2xl border border-white/5">
                                                      {h.count} calls
                                                   </div>
                                                </motion.div>
                                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{h.date.split('-').slice(1).join('/')}</span>
                                             </div>
                                          ))
                                       )}
                                    </div>
                                 </div>
                              </motion.div>
                           )}

                           {activeTab === 'logs' && (
                              <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-8">
                                 <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg">
                                          <Terminal className="w-6 h-6" />
                                       </div>
                                       <div>
                                          <h3 className="text-2xl font-black text-white uppercase tracking-tight">Live Diagnostic Console</h3>
                                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Flux d'événements Manager Bridge</p>
                                       </div>
                                    </div>
                                    <div className="flex-1 max-w-sm mx-10">
                                       <div className="relative group">
                                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                                          <input
                                             value={logSearch}
                                             onChange={(e) => setLogSearch(e.target.value)}
                                             placeholder="Filtre diagnostic..."
                                             className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-zinc-300 focus:border-blue-500 outline-none transition-all"
                                          />
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
                                       {(['all', 'ai', 'user', 'error'] as const).map(f => (
                                          <button
                                             key={f}
                                             onClick={() => setLogFilter(f)}
                                             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${logFilter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                          >
                                             {f}
                                          </button>
                                       ))}
                                       <div className="w-[1px] h-6 bg-white/10 mx-2" />
                                       <button onClick={clearLogs} className="p-2 text-zinc-600 hover:text-red-500 transition-all active:scale-90"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                 </div>

                                 <div ref={scrollRef} className="flex-1 bg-black/60 border border-white/5 rounded-[3.5rem] p-10 font-mono text-sm overflow-y-auto custom-scrollbar-terminal shadow-inner relative">
                                    {filteredLogs.length === 0 ? (
                                       <div className="h-full flex items-center justify-center opacity-10">
                                          <p className="text-xl font-black uppercase tracking-[0.5em] italic">No Diagnostics Output</p>
                                       </div>
                                    ) : (
                                       filteredLogs.map((log, i) => (
                                          <div key={i} className="mb-4 flex gap-6 group hover:bg-white/[0.02] p-2 rounded-lg transition-colors border-b border-white/[0.02] last:border-0 pb-4">
                                             <span className="text-zinc-700 select-none font-bold tabular-nums">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                             <span className={`font-black uppercase text-[10px] mt-0.5 min-w-[60px] flex items-center gap-2 ${log.type === 'ai' ? 'text-blue-400' :
                                                log.type === 'user' ? 'text-emerald-400' :
                                                   log.type === 'error' ? 'text-red-400' : 'text-zinc-500'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${log.type === 'ai' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' :
                                                   log.type === 'user' ? 'bg-emerald-400' : 'bg-red-400'
                                                   }`} />
                                                {log.type}
                                             </span>
                                             <span className={`flex-1 leading-relaxed ${log.type === 'error' ? 'text-red-300 font-bold' : 'text-zinc-300'}`}>{log.message}</span>
                                          </div>
                                       ))
                                    )}
                                    <div className="h-10 w-full" />
                                 </div>
                              </motion.div>
                           )}

                           {activeTab === 'todos' && (
                              <motion.div key="todos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                 <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Post-it Manager Bridge</h3>
                                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 w-full max-w-md shadow-inner">
                                       <input
                                          value={newTodoText}
                                          onChange={(e) => setNewTodoText(e.target.value)}
                                          onKeyDown={(e) => e.key === 'Enter' && (addTodo(newTodoText), setNewTodoText(''))}
                                          placeholder="Action rapide..."
                                          className="bg-transparent border-none outline-none flex-1 px-4 text-zinc-300 font-bold"
                                       />
                                       <button
                                          onClick={() => { addTodo(newTodoText); setNewTodoText(''); }}
                                          className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-all active:scale-90"
                                       >
                                          <Plus className="w-5 h-5" />
                                       </button>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 gap-4">
                                    {todos.map(todo => (
                                       <div key={todo.id} className={`p-8 bg-white/5 rounded-[2.5rem] border flex items-center justify-between group transition-all ${todo.completed ? 'opacity-40 grayscale' : 'border-white/5 hover:border-blue-500/20 shadow-xl'}`}>
                                          <div className="flex items-center gap-6">
                                             <button onClick={() => toggleTodo(todo.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${todo.completed ? 'bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'border-zinc-700'}`}>
                                                {todo.completed && <Check className="w-5 h-5 text-white" />}
                                             </button>
                                             <div>
                                                <p className={`text-xl font-bold ${todo.completed ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>{todo.text}</p>
                                                <span className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">{new Date(todo.timestamp).toLocaleString()}</span>
                                             </div>
                                          </div>
                                          <button onClick={() => removeTodo(todo.id)} className="p-4 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 transition-all active:scale-90"><Trash2 className="w-5 h-5" /></button>
                                       </div>
                                    ))}
                                    {todos.length === 0 && (
                                       <div className="py-32 flex flex-col items-center justify-center opacity-10">
                                          <ListChecks className="w-20 h-20 mb-4" />
                                          <p className="text-xl font-black uppercase tracking-[0.3em]">Liste Vide</p>
                                       </div>
                                    )}
                                 </div>
                              </motion.div>
                           )}

                           {activeTab === 'videos' && (
                              <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                 <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Video Avatar Engine</h3>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Gérez les séquences cinématiques</p>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {(['intro', 'idle', 'talking'] as const).map(key => (
                                       <div key={key} className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 flex flex-col items-center gap-6 group hover:border-blue-500/40 transition-all shadow-xl">
                                          <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-blue-500 relative shadow-inner">
                                             <FileVideo className="w-12 h-12" />
                                             {videoUrls[key] && <CheckCircle className="w-6 h-6 text-emerald-500 absolute -top-1 -right-1 shadow-lg" />}
                                          </div>
                                          <div className="text-center">
                                             <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1">{key}</h4>
                                             <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest opacity-60 italic">{key === 'intro' ? 'Phase de boot' : key === 'idle' ? 'Mode attente' : 'Séquence parole'}</p>
                                          </div>
                                          <div className="w-full relative">
                                             <input type="file" accept="video/*" onChange={(e) => handleFileUpload(key, e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                             <div className="w-full py-4 bg-white/5 rounded-2xl flex items-center justify-center gap-3 border border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/40 transition-all shadow-md">
                                                <Upload className="w-4 h-4 text-zinc-400 group-hover:text-blue-400" />
                                                <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-blue-300">
                                                   {videoUrls[key] ? 'Changer Séquence' : 'Charger Vidéo'}
                                                </span>
                                             </div>
                                          </div>
                                          {videoUrls[key] && (
                                             <div className="w-full h-48 rounded-[2rem] overflow-hidden border border-white/5 relative bg-black shadow-inner">
                                                <video src={videoUrls[key]!} className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-80" muted loop autoPlay playsInline />
                                                <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/40 transition-all">
                                                   <button onClick={(e) => { e.stopPropagation(); setVideo(key, null); }} className="p-4 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-xl opacity-0 group-hover:opacity-100"><Trash2 className="w-6 h-6" /></button>
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                    ))}
                                 </div>
                                 <div className="bg-blue-600/10 p-10 rounded-[3rem] border border-blue-500/20 flex items-center gap-8 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                                    <div className="p-5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40"><Zap className="w-8 h-8 text-white" /></div>
                                    <div className="flex-1">
                                       <h5 className="text-lg font-black text-white uppercase tracking-tight mb-1">Optimisation des Transfères</h5>
                                       <p className="text-sm text-blue-200/50 leading-relaxed italic">Pour un rendu sans latence, privilégiez des formats MP4 encodés en H.264 avec un débit modéré. Les vidéos sont stockées localement sur votre appareil (IDB).</p>
                                    </div>
                                 </div>
                              </motion.div>
                           )}

                           {activeTab === 'sessions' && (
                              <motion.div key="sessions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                                 <div className="flex justify-between items-center">
                                    <div>
                                       <h3 className="text-2xl font-black text-white uppercase tracking-tight">Sessions Manager</h3>
                                       <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Gestion des sessions actives et utilisateurs</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                       <Activity className="w-5 h-5 text-emerald-500" />
                                       <span className="text-[10px] font-black text-white uppercase tracking-widest">{activeSessions.length} Actives</span>
                                    </div>
                                 </div>

                                 {activeSessions.length === 0 ? (
                                    <div className="h-96 flex flex-col items-center justify-center bg-white/5 rounded-[4rem] border border-white/5 text-zinc-600 gap-6">
                                       <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                                          <Activity className="w-10 h-10 opacity-20" />
                                       </div>
                                       <div className="text-center">
                                          <p className="text-sm font-black uppercase tracking-[0.3em]">Aucune Session Active</p>
                                          <p className="text-xs text-zinc-700 font-bold uppercase mt-2">Démarrez une conversation avec Abdelmajid</p>
                                       </div>
                                    </div>
                                 ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                       {activeSessions.map(session => (
                                          <div key={session.id} className="bg-white/5 border border-white/5 rounded-[3rem] p-8 hover:bg-white/[0.08] transition-all shadow-xl">
                                             <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                   <div className={`w-4 h-4 rounded-full ${session.isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                                                   <div>
                                                      <h4 className="text-lg font-black text-white uppercase tracking-tight">Session {session.id.slice(0, 8)}</h4>
                                                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest">
                                                         Démarrée {new Date(session.startTime).toLocaleString()} • {Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000)}s active
                                                      </p>
                                                   </div>
                                                </div>
                                                <button onClick={() => endSession(session.id)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90">
                                                   <Trash2 className="w-5 h-5" />
                                                </button>
                                             </div>

                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                                                   <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">État Actuel</label>
                                                   <p className="text-sm font-bold text-white flex items-center gap-2">
                                                      <Activity className={`w-4 h-4 ${session.currentMode === 'TALKING' ? 'text-blue-500' : session.currentMode === 'THINKING' ? 'text-amber-500' : 'text-emerald-500'}`} />
                                                      {session.currentMode}
                                                   </p>
                                                </div>
                                                <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                                                   <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Requêtes API</label>
                                                   <p className="text-sm font-bold text-white">{session.requestsCount}</p>
                                                </div>
                                                <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                                                   <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Niveau Audio</label>
                                                   <p className="text-sm font-bold text-white">{Math.round(session.audioLevel * 100)}%</p>
                                                </div>
                                             </div>

                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                                                   <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Informations Utilisateur</label>
                                                   <div className="space-y-2 text-sm">
                                                      <p className="text-zinc-400"><span className="text-zinc-500 font-bold">Navigateur:</span> {session.userAgent.split(' ').slice(0, 3).join(' ')}...</p>
                                                      <p className="text-zinc-400"><span className="text-zinc-500 font-bold">Langue:</span> {session.userLanguage || 'Non détectée'}</p>
                                                      <p className="text-zinc-400"><span className="text-zinc-500 font-bold">IP:</span> {session.userIP || 'Non détectée'}</p>
                                                      <p className="text-zinc-400"><span className="text-zinc-500 font-bold">Localisation:</span> {session.userLocation || 'Non détectée'}</p>
                                                   </div>
                                                </div>
                                                <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                                                   <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Transcription Active</label>
                                                   <div className="space-y-3 max-h-32 overflow-y-auto custom-scrollbar-terminal">
                                                      {session.transcription.user && (
                                                         <div className="bg-blue-600/10 p-3 rounded-lg border border-blue-500/20">
                                                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1 block">Client</span>
                                                            <p className="text-xs text-blue-100 italic line-clamp-2">"{session.transcription.user}"</p>
                                                         </div>
                                                      )}
                                                      {session.transcription.ai && (
                                                         <div className="bg-zinc-800/40 p-3 rounded-lg border border-white/5">
                                                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 block">Abdelmajid</span>
                                                            <p className="text-xs text-white line-clamp-2">"{session.transcription.ai}"</p>
                                                         </div>
                                                      )}
                                                      {!session.transcription.user && !session.transcription.ai && (
                                                         <p className="text-zinc-600 italic text-xs">Aucune activité récente</p>
                                                      )}
                                                   </div>
                                                </div>
                                             </div>

                                             <div className="flex justify-between items-center text-[8px] text-zinc-600 uppercase tracking-widest">
                                                <span>Dernière activité: {new Date(session.lastActivity).toLocaleTimeString()}</span>
                                                <span>Durée totale: {Math.floor(session.duration / 60)}min {session.duration % 60}s</span>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </motion.div>
                           )}

                           {activeTab === 'settings' && (
                              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-2xl mx-auto pb-20">
                                 {/* Interface & Layout */}
                                 <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 blur-3xl rounded-full" />
                                    <div className="flex items-center gap-4 mb-10">
                                       <Sliders className="w-6 h-6 text-blue-500" />
                                       <h4 className="text-xl font-black text-white uppercase tracking-tight">Réglages Interface</h4>
                                    </div>
                                    <div className="space-y-10">
                                       <div>
                                          <div className="flex justify-between items-center mb-4 px-2">
                                             <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Scale Avatar</label>
                                             <span className="text-sm font-black text-blue-500 tabular-nums">{(config.scale * 100).toFixed(0)}%</span>
                                          </div>
                                          <input type="range" min="0.5" max="2" step="0.1" value={config.scale} onChange={(e) => updateConfig({ scale: parseFloat(e.target.value) })} className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500 border border-white/5" />
                                       </div>
                                       <div className="grid grid-cols-2 gap-8">
                                          <div>
                                             <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 block px-2">Axe Horizontal (X)</label>
                                             <input type="number" value={config.posX} onChange={(e) => updateConfig({ posX: parseInt(e.target.value) })} className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white text-sm outline-none focus:border-blue-500 transition-all shadow-inner font-mono" />
                                          </div>
                                          <div>
                                             <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 block px-2">Axe Vertical (Y)</label>
                                             <input type="number" value={config.posY} onChange={(e) => updateConfig({ posY: parseInt(e.target.value) })} className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white text-sm outline-none focus:border-blue-500 transition-all shadow-inner font-mono" />
                                          </div>
                                       </div>
                                       <div>
                                          <div className="flex justify-between items-center mb-4 px-2">
                                             <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Taille Bouton Call</label>
                                             <span className="text-sm font-black text-blue-500 tabular-nums">{config.callButtonSize}px</span>
                                          </div>
                                          <input type="range" min="64" max="256" step="8" value={config.callButtonSize} onChange={(e) => updateConfig({ callButtonSize: parseInt(e.target.value) })} className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500 border border-white/5" />
                                       </div>
                                    </div>
                                 </div>

                                 {/* Voice Configuration */}
                                 <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 shadow-xl">
                                    <div className="flex items-center gap-4 mb-8">
                                       <Volume2 className="w-6 h-6 text-blue-500" />
                                       <h4 className="text-xl font-black text-white uppercase tracking-tight">Voice Core Engine</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                       {(['Fenrir', 'Charon', 'Puck', 'Kore', 'Zephyr'] as VoiceName[]).map(v => (
                                          <button key={v} onClick={() => updateConfig({ selectedVoice: v })} className={`p-6 rounded-2xl border flex items-center justify-between transition-all active:scale-95 shadow-md ${config.selectedVoice === v ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/30' : 'bg-black/40 border-white/5 text-zinc-400 hover:border-white/20'}`}>
                                             <span className="font-black uppercase tracking-[0.2em] text-[10px]">{v}</span>
                                             <Volume2 className={`w-4 h-4 ${config.selectedVoice === v ? 'opacity-100' : 'opacity-20'}`} />
                                          </button>
                                       ))}
                                    </div>
                                    <p className="text-[10px] text-zinc-600 mt-6 uppercase tracking-widest font-black italic border-t border-white/5 pt-6 flex items-center gap-2">
                                       <Info className="w-3 h-3" /> Note : Le changement de voix nécessite un reset de session Live.
                                    </p>
                                 </div>

                                 {/* System Instruction */}
                                 <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 shadow-xl">
                                    <div className="flex items-center gap-4 mb-8">
                                       <MessageSquareText className="w-6 h-6 text-emerald-500" />
                                       <h4 className="text-xl font-black text-white uppercase tracking-tight">Abdelmajid Personality Core</h4>
                                    </div>
                                    <textarea value={systemInstruction} onChange={(e) => updateSystemInstruction(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-[2.5rem] p-8 text-zinc-300 font-medium text-sm h-72 outline-none focus:border-emerald-500 transition-all custom-scrollbar-terminal resize-none shadow-inner leading-relaxed" placeholder="Définissez les règles de conduite de l'assistant..." />
                                    <div className="flex justify-end mt-6">
                                       <button onClick={syncData} className="px-10 py-4 bg-emerald-600/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-lg">Sauvegarder Instructions</button>
                                    </div>
                                 </div>

                                 {/* Clear / Reset */}
                                 <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 shadow-xl">
                                    <div className="flex items-center gap-4 mb-8">
                                       <Trash2 className="w-6 h-6 text-red-500" />
                                       <h4 className="text-xl font-black text-white uppercase tracking-tight">Réinitialisation d'Usine</h4>
                                    </div>
                                    <p className="text-zinc-500 text-xs mb-8 font-black uppercase tracking-widest leading-relaxed opacity-60">Attention : Cette action effacera définitivement tout le catalogue, les leads, les posters générés et les vidéos d'avatar stockées en local.</p>
                                    <button onClick={() => { if (confirm("Supprimer TOUTES les données ? Cette action est irréversible.")) useStore.getState().clearData(); }} className="w-full py-6 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all active:scale-95 shadow-lg">
                                       Wipe Control Tower Data
                                    </button>
                                 </div>

                                 {/* Save Config */}
                                 <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 shadow-xl">
                                    <div className="flex items-center gap-4 mb-8">
                                       <Save className="w-6 h-6 text-blue-500" />
                                       <h4 className="text-xl font-black text-white uppercase tracking-tight">Enregistrer la Configuration</h4>
                                    </div>
                                    <p className="text-zinc-500 text-xs mb-8 font-black uppercase tracking-widest leading-relaxed opacity-60">Sauvegardez les paramètres actuels comme valeurs par défaut de l'application.</p>
                                    <button onClick={() => { syncData(); }} className="w-full py-6 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white border border-blue-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all active:scale-95 shadow-lg">
                                       Enregistrer la Config
                                    </button>
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  </div>
               </motion.div>

               <style>{`
        .custom-scrollbar-terminal::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-terminal::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-terminal::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar-terminal::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
        @keyframes ring {
          0% { transform: rotate(0); }
          5% { transform: rotate(15deg); }
          10% { transform: rotate(-15deg); }
          15% { transform: rotate(10deg); }
          20% { transform: rotate(-10deg); }
          25% { transform: rotate(0); }
          100% { transform: rotate(0); }
        }
        .animate-ring {
          animation: ring 2s infinite;
        }
      `}</style>
            </div>
         )}
      </AnimatePresence>
   );
};
