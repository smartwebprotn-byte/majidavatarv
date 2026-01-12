
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
  Mail, MessageCircle, AlertTriangle, Clock, PlayCircle, Loader2, MousePointer2
} from 'lucide-react';
import { useStore } from './store';
import { VideoFiles, TodoTask, Product, VoiceName, LogEntry, GeneratedImage, SalesLead, AssistantMode } from './types';
import { GoogleGenAI, Modality } from "@google/genai";
import { decodeAudio, decodeAudioData } from './services/audio-processor';

type Tab = 'dashboard' | 'videos' | 'usage' | 'leads' | 'todos' | 'studio' | 'catalog' | 'logs' | 'settings';

export const ConfigPanel: React.FC = () => {
  const { 
    showConfig, toggleConfig, usage, leads, logs, catalog, generatedImages, 
    updateProductStock, updateProduct, addProduct, removeProduct, syncData, isSyncing, setVideo, videoUrls, 
    markLeadAsProcessed, removeLead, exportLeads, todos, addTodo, toggleTodo, removeTodo, clearTodos,
    config, updateConfig, clearLogs, removeGeneratedImage, systemInstruction, updateSystemInstruction,
    transcription
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [logFilter, setLogFilter] = useState<LogEntry['type'] | 'all'>('all');
  const [logSearch, setLogSearch] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [todoPriority, setTodoPriority] = useState<TodoTask['priority']>('medium');
  const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null);
  const [selectedStudioImage, setSelectedStudioImage] = useState<GeneratedImage | null>(null);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '', brand: '', category: 'Café', description: '', specs: [], stock: 0, price: 'Sur devis'
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const todoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current && activeTab === 'logs') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (activeTab === 'todos') {
      todoInputRef.current?.focus();
    }
  }, [logs, activeTab]);

  if (!showConfig) return null;

  const urgentLeadsCount = leads.filter(l => l.priority === 'urgent' && !l.processed).length;
  const pendingTodos = todos.filter(t => !t.completed).length;
  const quotaPercent = (usage.requestsToday / 1500) * 100;
  const isHighLoad = quotaPercent > 90;

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    addTodo(newTodoText, todoPriority);
    setNewTodoText('');
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });

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

  const handleTestVoice = async () => {
    if (isTestingVoice) return;
    setIsTestingVoice(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Bonjour, je suis Abdelmajid de T.T.A Distribution. J'utilise actuellement la voix ${config.selectedVoice}.` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: config.selectedVoice },
              },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const buffer = await decodeAudioData(decodeAudio(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
        source.onended = () => setIsTestingVoice(false);
      } else {
        setIsTestingVoice(false);
      }
    } catch (e) {
      console.error(e);
      setIsTestingVoice(false);
    }
  };

  const MiniSparkline = ({ data }: { data: number[] }) => {
    if (data.length < 2) return null;
    const max = Math.max(...data, 10);
    const width = 100;
    const height = 30;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (val / max) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="opacity-40">
        <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
      </svg>
    );
  };

  const handleFileUpload = async (key: keyof VideoFiles, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await setVideo(key, file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 sm:p-8">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#080809] w-full max-w-7xl h-full max-h-[92vh] rounded-[3.5rem] overflow-hidden flex flex-col border border-white/5 shadow-2xl relative">
        
        {/* Top Header */}
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
              { id: 'videos', icon: FileVideo, label: 'Avatar AI' },
              { id: 'logs', icon: Terminal, label: 'Live Console' },
              { id: 'usage', icon: Activity, label: 'Statistiques' },
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
                      <div className="flex justify-between items-start mb-4">
                        <UserPlus className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                        <MiniSparkline data={usage.history.map(h => h.count)} />
                      </div>
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Prospectus</h4>
                      <p className="text-4xl font-black text-white mt-1">{leads.filter(l => !l.processed).length}</p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/[0.07] transition-all cursor-pointer group shadow-xl" onClick={() => setActiveTab('todos')}>
                      <div className="flex justify-between items-start mb-4">
                        <ListChecks className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <div className="w-10 h-2 bg-emerald-500/10 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500" style={{ width: `${(todos.filter(t => t.completed).length / (todos.length || 1)) * 100}%` }} />
                        </div>
                      </div>
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

              {activeTab === 'videos' && (
                <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                   <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Video Avatar Engine</h3>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ressources locales (/public/) ou personnalisées (IDB)</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {(['intro', 'idle', 'talking'] as const).map(key => (
                         <div key={key} className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 flex flex-col items-center gap-6 group hover:border-blue-500/40 transition-all shadow-xl">
                            <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-blue-500 relative shadow-inner">
                               <FileVideo className="w-12 h-12" />
                               {videoUrls[key] && <CheckCircle className="w-6 h-6 text-emerald-500 absolute -top-1 -right-1 shadow-lg" />}
                            </div>
                            <div className="text-center">
                               <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1">{key}</h4>
                               <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest opacity-60 italic max-w-[150px] truncate">{videoUrls[key]}</p>
                            </div>
                            <div className="w-full relative">
                               <input type="file" accept="video/*" onChange={(e) => handleFileUpload(key, e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                               <div className="w-full py-4 bg-white/5 rounded-2xl flex items-center justify-center gap-3 border border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/40 transition-all shadow-md">
                                  <Upload className="w-4 h-4 text-zinc-400 group-hover:text-blue-400" />
                                  <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-blue-300">
                                    Override Media
                                  </span>
                               </div>
                            </div>
                            {videoUrls[key] && (
                               <div className="w-full h-48 rounded-[2rem] overflow-hidden border border-white/5 relative bg-black shadow-inner">
                                  <video key={videoUrls[key]} src={videoUrls[key]!} className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-80" muted loop autoPlay playsInline />
                                  {videoUrls[key]!.startsWith('blob:') && (
                                    <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/40 transition-all">
                                       <button onClick={(e) => { e.stopPropagation(); setVideo(key, null); }} className="p-4 bg-red-600/20 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-xl opacity-0 group-hover:opacity-100"><Trash2 className="w-6 h-6" /></button>
                                    </div>
                                  )}
                               </div>
                            )}
                         </div>
                      ))}
                   </div>
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
                              layoutId={img.id}
                              initial={{ opacity: 0, scale: 0.9 }} 
                              animate={{ opacity: 1, scale: 1 }}
                              className="group relative aspect-square bg-[#0c0c0d] rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl cursor-zoom-in"
                              onClick={() => setSelectedStudioImage(img)}
                            >
                               <img src={img.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={img.prompt} />
                               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-10 flex flex-col justify-end">
                                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-6 shadow-xl">
                                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" /> AI Content Engine
                                     </p>
                                     <p className="text-xs text-white font-bold italic line-clamp-3 leading-relaxed">"{img.prompt}"</p>
                                  </div>
                               </div>
                            </motion.div>
                         ))}
                      </div>
                   )}

                   <AnimatePresence>
                     {selectedStudioImage && (
                       <motion.div 
                         initial={{ opacity: 0 }} 
                         animate={{ opacity: 1 }} 
                         exit={{ opacity: 0 }} 
                         className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 sm:p-20"
                         onClick={() => setSelectedStudioImage(null)}
                       >
                         <motion.div 
                           layoutId={selectedStudioImage.id}
                           className="max-w-5xl w-full bg-[#0c0c0d] rounded-[4rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col lg:flex-row"
                           onClick={(e) => e.stopPropagation()}
                         >
                           <div className="lg:w-2/3 aspect-square bg-black">
                             <img src={selectedStudioImage.url} className="w-full h-full object-contain" />
                           </div>
                           <div className="lg:w-1/3 p-12 flex flex-col justify-between">
                             <div>
                               <div className="flex justify-between items-start mb-10">
                                 <div>
                                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Marketing Masterpiece</h3>
                                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Généré le {new Date(selectedStudioImage.timestamp).toLocaleDateString()}</p>
                                 </div>
                                 <button onClick={() => setSelectedStudioImage(null)} className="p-3 bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"><X /></button>
                               </div>
                               <div className="bg-blue-600/5 p-8 rounded-3xl border border-blue-500/20 mb-8">
                                 <label className="text-[8px] font-black text-blue-400 uppercase tracking-widest block mb-4">Prompt Original</label>
                                 <p className="text-sm text-white font-bold italic leading-relaxed">"{selectedStudioImage.prompt}"</p>
                               </div>
                             </div>
                             <div className="space-y-4">
                               <button onClick={() => downloadImage(selectedStudioImage)} className="w-full py-5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-900/20">
                                 <Download className="w-4 h-4" /> Download HD
                               </button>
                               <button className="w-full py-5 bg-white/5 text-zinc-300 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/5">
                                 <Mail className="w-4 h-4" /> Envoyer à un prospect
                               </button>
                               <button onClick={() => { removeGeneratedImage(selectedStudioImage.id); setSelectedStudioImage(null); }} className="w-full py-5 bg-red-600/10 text-red-500 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all">
                                 <Trash2 className="w-4 h-4" /> Supprimer du studio
                               </button>
                             </div>
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
                          <div key={product.id} className="bg-white/5 border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-start gap-10 group hover:bg-white/[0.08] transition-all relative">
                             <div className="w-28 h-28 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-inner shrink-0">
                                <Coffee className={`w-12 h-12 ${product.stock === 0 ? 'text-zinc-800' : 'text-blue-500'} group-hover:scale-110 transition-transform`} />
                             </div>
                             
                             <div className="flex-1">
                                {editingProductId === product.id ? (
                                   <div className="space-y-4 w-full">
                                      <div className="flex gap-4">
                                        <input 
                                          autoFocus
                                          defaultValue={product.name}
                                          onBlur={(e) => updateProduct(product.id, { name: e.target.value })}
                                          placeholder="Nom de la machine"
                                          className="bg-black/60 border border-blue-500/50 rounded-xl px-4 py-2 text-xl font-black text-white uppercase outline-none flex-1"
                                        />
                                        <button onClick={() => setEditingProductId(null)} className="p-2 text-emerald-500"><CheckCircle className="w-8 h-8" /></button>
                                      </div>
                                      <input 
                                        defaultValue={product.brand}
                                        onBlur={(e) => updateProduct(product.id, { brand: e.target.value })}
                                        placeholder="Marque"
                                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-zinc-300 w-full outline-none"
                                      />
                                      <textarea 
                                        defaultValue={product.description}
                                        onBlur={(e) => updateProduct(product.id, { description: e.target.value })}
                                        placeholder="Description marketing"
                                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-400 w-full h-24 outline-none resize-none"
                                      />
                                      <div className="flex flex-wrap gap-2">
                                        {product.specs.map((spec, i) => (
                                          <div key={i} className="bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-2">
                                            {spec}
                                            <button onClick={() => {
                                              const newSpecs = [...product.specs];
                                              newSpecs.splice(i, 1);
                                              updateProduct(product.id, { specs: newSpecs });
                                            }}><X className="w-3 h-3" /></button>
                                          </div>
                                        ))}
                                        <button 
                                          onClick={() => {
                                            const s = prompt("Nouvelle caractéristique :");
                                            if (s) updateProduct(product.id, { specs: [...product.specs, s] });
                                          }}
                                          className="bg-white/5 text-zinc-500 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-white/10 hover:text-white"
                                        >
                                          + Ajouter Spec
                                        </button>
                                      </div>
                                   </div>
                                ) : (
                                   <>
                                      <div className="flex items-center gap-4 mb-2">
                                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{product.brand}</span>
                                         <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{product.category}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                         <h4 className="text-2xl font-black text-white uppercase group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => setEditingProductId(product.id)}>
                                            {product.name}
                                         </h4>
                                         <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-30 transition-opacity" />
                                      </div>
                                      <p className="text-zinc-500 text-sm mt-2 italic max-w-lg leading-relaxed line-clamp-2">"{product.description}"</p>
                                      <div className="flex flex-wrap gap-2 mt-4">
                                        {product.specs.map((spec, i) => (
                                          <span key={i} className="text-[8px] font-black uppercase text-zinc-600 border border-white/5 px-2 py-0.5 rounded-lg">{spec}</span>
                                        ))}
                                      </div>
                                   </>
                                )}
                             </div>

                             <div className="flex flex-col items-end gap-6 shrink-0 md:border-l border-white/5 md:pl-12 h-full justify-between">
                                <div className="text-right">
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
                                     onBlur={(e) => updateProduct(product.id, { price: e.target.value })}
                                     className="bg-transparent border-none text-xl font-black text-blue-400 uppercase text-right outline-none w-full focus:text-white"
                                   />
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => removeProduct(product.id)} className="p-4 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all active:scale-90">
                                     <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
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
                                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                          placeholder="Astoria Storm Profiler..." 
                                          className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-blue-500 transition-all font-bold" 
                                       />
                                    </div>
                                    <div>
                                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Marque</label>
                                       <input 
                                          value={newProduct.brand}
                                          onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                                          placeholder="Astoria, La Cimbali..." 
                                          className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-blue-500 font-bold" 
                                       />
                                    </div>
                                    <div>
                                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Catégorie</label>
                                       <select 
                                          value={newProduct.category}
                                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value as Product['category']})}
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
                                       onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
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

              {activeTab === 'todos' && (
                <motion.div key="todos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                         <h3 className="text-2xl font-black text-white uppercase tracking-tight">Registre des Actions</h3>
                         <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Gestion des rappels et priorités du manager</p>
                      </div>
                      <div className="flex gap-4">
                         {todos.some(t => t.completed) && (
                            <button onClick={() => clearTodos()} className="px-6 py-3 bg-white/5 hover:bg-red-600/10 text-zinc-500 hover:text-red-400 text-[10px] font-black uppercase rounded-xl border border-white/5 transition-all">
                               Nettoyer Archivés
                            </button>
                         )}
                      </div>
                   </div>

                   {/* Add Todo Input Area */}
                   <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                      <div className="flex flex-col md:flex-row gap-6">
                         <div className="flex-1 relative group">
                            <input 
                              ref={todoInputRef}
                              value={newTodoText}
                              onChange={(e) => setNewTodoText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                              placeholder="Action à effectuer (ex: Rappeler Client Astoria...)" 
                              className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-6 pr-14 text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-zinc-700"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                               <button 
                                 onClick={handleAddTodo}
                                 className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center text-white transition-all shadow-lg active:scale-90"
                               >
                                  <Plus className="w-5 h-5" />
                               </button>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/10 shrink-0">
                            {(['low', 'medium', 'high'] as TodoTask['priority'][]).map(p => (
                               <button 
                                 key={p} 
                                 onClick={() => setTodoPriority(p)} 
                                 className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${todoPriority === p ? (p === 'high' ? 'bg-red-600 text-white' : p === 'medium' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white') : 'text-zinc-600 hover:text-white'}`}
                               >
                                  <div className={`w-1.5 h-1.5 rounded-full ${p === 'high' ? 'bg-red-400' : p === 'medium' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                                  {p}
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Todo List Content */}
                   <div className="grid grid-cols-1 gap-4">
                      <AnimatePresence mode="popLayout">
                        {sortedTodos.map(todo => (
                           <motion.div 
                             key={todo.id} 
                             layout
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             className={`p-8 bg-white/5 rounded-[2.5rem] border flex items-center justify-between group transition-all relative overflow-hidden ${todo.completed ? 'opacity-40 border-white/5' : 'border-white/5 hover:border-blue-500/20 shadow-xl'}`}
                           >
                              {/* Priority Indicator Line */}
                              {!todo.completed && (
                                 <div className={`absolute left-0 top-0 w-1.5 h-full ${todo.priority === 'high' ? 'bg-red-600' : todo.priority === 'medium' ? 'bg-blue-600' : todo.priority === 'emerald-600'}`} />
                              )}
                              
                              <div className="flex items-center gap-8">
                                 <button 
                                   onClick={() => toggleTodo(todo.id)} 
                                   className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all active:scale-90 ${todo.completed ? 'bg-blue-600 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'border-zinc-700 hover:border-zinc-400'}`}
                                 >
                                    {todo.completed && <Check className="w-6 h-6 text-white" />}
                                 </button>
                                 <div>
                                    <p className={`text-xl font-black transition-all ${todo.completed ? 'line-through text-zinc-600' : 'text-zinc-100'}`}>
                                       {todo.text}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                       <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${todo.priority === 'high' ? 'text-red-400' : todo.priority === 'medium' ? 'text-blue-400' : 'text-emerald-400'}`}>
                                          Priority {todo.priority}
                                       </span>
                                       <span className="text-[8px] text-zinc-600 uppercase font-black tracking-[0.2em] flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> {new Date(todo.timestamp).toLocaleDateString()}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                              <button 
                                onClick={() => removeTodo(todo.id)} 
                                className="p-4 opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 transition-all active:scale-90"
                              >
                                 <Trash2 className="w-6 h-6" />
                              </button>
                           </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {todos.length === 0 && (
                         <div className="py-40 flex flex-col items-center justify-center opacity-10">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                               <ListChecks className="w-12 h-12" />
                            </div>
                            <p className="text-xl font-black uppercase tracking-[0.5em] italic">Liste des Actions Vide</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Le manager peut se reposer... ou pas.</p>
                         </div>
                      )}
                   </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 max-w-2xl mx-auto pb-20">
                   <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 shadow-xl">
                      <div className="flex items-center gap-4 mb-10">
                         <Sliders className="w-6 h-6 text-blue-500" />
                         <h4 className="text-xl font-black text-white uppercase tracking-tight">Avatar Layout Pro</h4>
                      </div>
                      <div className="space-y-10">
                         <div>
                            <div className="flex justify-between items-center mb-4 px-2">
                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Zoom Avatar (Scale)</label>
                               <span className="text-sm font-black text-blue-500 tabular-nums">{(config.scale * 100).toFixed(0)}%</span>
                            </div>
                            <input type="range" min="0.5" max="2.5" step="0.1" value={config.scale} onChange={(e) => updateConfig({ scale: parseFloat(e.target.value) })} className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500 border border-white/5" />
                         </div>

                         <div>
                            <div className="flex justify-between items-center mb-4 px-2">
                               <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Diamètre du Cercle (Base)</label>
                               <span className="text-sm font-black text-emerald-500 tabular-nums">{config.baseSize}px</span>
                            </div>
                            <input type="range" min="150" max="600" step="10" value={config.baseSize} onChange={(e) => updateConfig({ baseSize: parseInt(e.target.value) })} className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500 border border-white/5" />
                         </div>

                         <div className="bg-black/40 p-8 rounded-3xl border border-white/5">
                            <div className="flex items-center justify-between mb-8">
                               <div className="flex items-center gap-3">
                                  <MousePointer2 className="w-4 h-4 text-zinc-500" />
                                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Coordonnées de l'écran</span>
                               </div>
                               <button onClick={() => updateConfig({ posX: 0, posY: 0 })} className="text-[8px] font-black text-zinc-600 hover:text-white uppercase underline tracking-widest">Center Reset</button>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                               <div>
                                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 block">Position X</label>
                                  <input type="number" value={config.posX} onChange={(e) => updateConfig({ posX: parseInt(e.target.value) })} className="w-full bg-black/60 border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500 font-mono" />
                               </div>
                               <div>
                                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3 block">Position Y</label>
                                  <input type="number" value={config.posY} onChange={(e) => updateConfig({ posY: parseInt(e.target.value) })} className="w-full bg-black/60 border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500 font-mono" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 shadow-xl">
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-4">
                           <Volume2 className="w-6 h-6 text-blue-500" />
                           <h4 className="text-xl font-black text-white uppercase tracking-tight">Voix & Persona</h4>
                         </div>
                         <button 
                           onClick={handleTestVoice} 
                           disabled={isTestingVoice}
                           className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isTestingVoice ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-600 text-white shadow-lg active:scale-95'}`}
                         >
                           {isTestingVoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                           Tester la voix
                         </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         {(['Fenrir', 'Charon', 'Puck', 'Kore', 'Zephyr'] as VoiceName[]).map(v => (
                            <button key={v} onClick={() => updateConfig({ selectedVoice: v })} className={`p-6 rounded-2xl border flex items-center justify-between transition-all active:scale-95 ${config.selectedVoice === v ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/20' : 'bg-black/40 border-white/5 text-zinc-400 hover:border-white/20'}`}>
                               <span className="font-black uppercase tracking-widest text-xs">{v}</span>
                               <Volume2 className={`w-4 h-4 ${config.selectedVoice === v ? 'opacity-100' : 'opacity-20'}`} />
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 shadow-xl">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                           <Moon className="w-6 h-6 text-amber-500" />
                           <h4 className="text-xl font-black text-white uppercase tracking-tight">Mode Maintenance</h4>
                        </div>
                        <button 
                          onClick={() => updateConfig({ isMaintenanceMode: !config.isMaintenanceMode })}
                          className={`w-14 h-8 rounded-full transition-all relative p-1 ${config.isMaintenanceMode ? 'bg-amber-500' : 'bg-zinc-800'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${config.isMaintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-4">Message aux clients</label>
                      <textarea 
                        value={config.maintenanceMessage}
                        onChange={(e) => updateConfig({ maintenanceMessage: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm font-medium outline-none focus:border-amber-500 h-24 resize-none"
                      />
                   </div>

                   <div className="bg-white/5 p-10 rounded-[3.5rem] border border-white/5 shadow-xl">
                      <div className="flex items-center gap-4 mb-8">
                         <Trash2 className="w-6 h-6 text-red-500" />
                         <h4 className="text-xl font-black text-white uppercase tracking-tight">Factory Reset</h4>
                      </div>
                      <button onClick={() => { if(confirm("Supprimer TOUTES les données ?")) useStore.getState().clearData(); }} className="w-full py-6 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all active:scale-95 shadow-lg">
                         Wipe Control Tower Data
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
      `}</style>
    </div>
  );
};
