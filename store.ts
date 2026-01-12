
import { create } from 'zustand';
import { get as idbGet, set as idbSet, clear as idbClear } from 'idb-keyval';
import { AssistantMode, AppConfig, VideoFiles, LogEntry, SalesLead, TodoTask, GroundingChunk, Product, PRODUCT_CATALOG, GeneratedImage, UsageStats, VoiceName, SYSTEM_PROMPT, ActiveSession } from './types';

interface AppState {
  currentMode: AssistantMode;
  config: AppConfig;
  videoUrls: VideoFiles;
  usage: UsageStats;
  logs: LogEntry[];
  leads: SalesLead[];
  todos: TodoTask[];
  catalog: Product[];
  generatedImages: GeneratedImage[];
  activeSessions: ActiveSession[];
  systemInstruction: string;
  showConfig: boolean;
  isLive: boolean;
  isConnecting: boolean;
  audioLevel: number;
  hasPermissions: boolean;
  showReportToast: boolean;
  groundingChunks: GroundingChunk[];
  audioAnalyser: AnalyserNode | null;
  transcription: { user: string; ai: string };
  isSyncing: boolean;
  isTranscriptionOpen: boolean;
  isTransparent: boolean;

  setMode: (mode: AssistantMode) => void;
  updateConfig: (config: Partial<AppConfig>) => void;
  resetConfig: () => void;
  saveAllSettings: () => Promise<void>;
  setVideo: (key: keyof VideoFiles, blob: Blob | null) => Promise<void>;
  toggleConfig: () => void;
  addLog: (entry: Omit<LogEntry, 'timestamp'>) => void;
  clearLogs: () => void;
  addLead: (lead: Omit<SalesLead, 'id' | 'timestamp' | 'priority' | 'processed'> & { priority?: SalesLead['priority'] }) => void;
  markLeadAsProcessed: (id: string) => void;
  removeLead: (id: string) => void;
  exportLeads: () => void;
  addGeneratedImage: (img: Omit<GeneratedImage, 'id' | 'timestamp'>) => void;
  removeGeneratedImage: (id: string) => void;

  incrementRequest: () => void;
  incrementSession: () => void;

  addTodo: (text: string, priority?: TodoTask['priority']) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  clearTodos: () => void;

  updateProduct: (id: string, updates: Partial<Product>) => void;
  updateProductStock: (id: string, newStock: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  removeProduct: (id: string) => void;
  syncData: () => Promise<void>;
  updateSystemInstruction: (text: string) => void;

  startSession: (sessionData?: Partial<ActiveSession>) => string;
  updateSession: (id: string, updates: Partial<ActiveSession>) => void;
  endSession: (id: string) => void;
  clearInactiveSessions: () => void;

  clearData: () => Promise<void>;
  loadStoredData: () => Promise<void>;
  setLiveState: (isLive: boolean, isConnecting?: boolean) => void;
  setAudioLevel: (level: number) => void;
  setPermissions: (granted: boolean) => void;
  triggerReportToast: () => void;
  setGroundingChunks: (chunks: GroundingChunk[]) => void;
  setAudioAnalyser: (analyser: AnalyserNode | null) => void;
  setTranscription: (type: 'user' | 'ai', text: string) => void;
  clearTranscription: () => void;
}

const DEFAULT_USAGE: UsageStats = {
  requestsToday: 0,
  totalSessions: 0,
  lastReset: new Date().toISOString().split('T')[0],
  history: []
};

const DEFAULT_CONFIG: AppConfig = {
  scale: 0.9,
  baseSize: 320,
  posX: -610,
  posY: 87,
  selectedVoice: 'Fenrir',
  isMaintenanceMode: false,
  maintenanceMessage: "Nous mettons à jour nos stocks. Retour immédiat.",
  callButtonSize: 128,
};

const DEFAULT_VIDEO_URLS: VideoFiles = {
  intro: '/intro.mp4',
  idle: '/idle.mp4',
  talking: '/talking.mp4'
};

export const useStore = create<AppState>((set, get) => ({
  currentMode: 'IDLE',
  config: DEFAULT_CONFIG,
  videoUrls: DEFAULT_VIDEO_URLS,
  usage: DEFAULT_USAGE,
  logs: [],
  leads: [],
  todos: [],
  catalog: PRODUCT_CATALOG,
  generatedImages: [],
  activeSessions: [],
  systemInstruction: SYSTEM_PROMPT,
  showConfig: false,
  isLive: false,
  isConnecting: false,
  audioLevel: 0,
  hasPermissions: true,
  showReportToast: false,
  groundingChunks: [],
  audioAnalyser: null,
  transcription: { user: '', ai: '' },
  isSyncing: false,
  isTranscriptionOpen: false,
  isTransparent: new URLSearchParams(window.location.search).get('transparent') === 'true',

  setMode: (mode) => set({ currentMode: mode }),
  updateConfig: (newConfig) => set((state) => {
    const updated = { ...state.config, ...newConfig };
    idbSet('app-config', updated);
    return { config: updated };
  }),

  incrementRequest: () => set((state) => {
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = state.usage.lastReset !== today;

    let history = [...state.usage.history];
    if (isNewDay && state.usage.requestsToday > 0) {
      history = [{ date: state.usage.lastReset, count: state.usage.requestsToday }, ...history].slice(0, 7);
    } else if (isNewDay) {
      history = [{ date: state.usage.lastReset, count: 0 }, ...history].slice(0, 7);
    }

    const newUsage = {
      ...state.usage,
      requestsToday: isNewDay ? 1 : state.usage.requestsToday + 1,
      lastReset: today,
      history
    };
    idbSet('app-usage', newUsage);
    return { usage: newUsage };
  }),

  incrementSession: () => set((state) => {
    const newUsage = { ...state.usage, totalSessions: state.usage.totalSessions + 1 };
    idbSet('app-usage', newUsage);
    return { usage: newUsage };
  }),

  saveAllSettings: async () => {
    const { config, todos, leads, generatedImages, usage, catalog, systemInstruction } = get();
    await idbSet('app-config', config);
    await idbSet('app-todos', todos);
    await idbSet('app-leads', leads);
    await idbSet('app-gallery', generatedImages);
    await idbSet('app-usage', usage);
    await idbSet('app-catalog', catalog);
    await idbSet('app-system-prompt', systemInstruction);
  },

  syncData: async () => {
    set({ isSyncing: true });
    await new Promise(resolve => setTimeout(resolve, 1500));
    await get().saveAllSettings();
    set({ isSyncing: false });
    get().addLog({ type: 'info', message: 'Synchronisation Cloud T.T.A réussie.' });
  },

  updateProduct: (id, updates) => set((state) => {
    const newCatalog = state.catalog.map(p => p.id === id ? { ...p, ...updates } : p);
    idbSet('app-catalog', newCatalog);
    return { catalog: newCatalog };
  }),

  updateProductStock: (id, newStock) => set((state) => {
    const newCatalog = state.catalog.map(p => p.id === id ? { ...p, stock: newStock } : p);
    idbSet('app-catalog', newCatalog);
    return { catalog: newCatalog };
  }),

  addProduct: (product) => set((state) => {
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    const newCatalog = [newProduct, ...state.catalog];
    idbSet('app-catalog', newCatalog);
    return { catalog: newCatalog };
  }),

  removeProduct: (id) => set((state) => {
    const newCatalog = state.catalog.filter(p => p.id !== id);
    idbSet('app-catalog', newCatalog);
    return { catalog: newCatalog };
  }),

  updateSystemInstruction: (text) => set((state) => {
    idbSet('app-system-prompt', text);
    return { systemInstruction: text };
  }),

  resetConfig: async () => {
    set({ config: DEFAULT_CONFIG });
    await idbSet('app-config', DEFAULT_CONFIG);
  },

  setVideo: async (key, blob) => {
    const { videoUrls } = get();
    if (videoUrls[key] && videoUrls[key]!.startsWith('blob:')) URL.revokeObjectURL(videoUrls[key]!);

    if (!blob) {
      set((state) => ({ videoUrls: { ...state.videoUrls, [key]: null } }));
      await idbSet(`video-${key}`, null);
      return;
    }
    const url = URL.createObjectURL(blob);
    set((state) => ({ videoUrls: { ...state.videoUrls, [key]: url } }));
    await idbSet(`video-${key}`, blob);
  },

  toggleConfig: () => set((state) => ({ showConfig: !state.showConfig })),

  addLog: (entry) => set((state) => ({
    logs: [{ ...entry, timestamp: new Date().toISOString() }, ...state.logs].slice(0, 100)
  })),

  clearLogs: () => set({ logs: [] }),

  addLead: (lead) => {
    const newLead: SalesLead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      priority: lead.priority || 'normal',
      processed: false
    };
    set((state) => ({ leads: [newLead, ...state.leads] }));
    get().saveAllSettings();
  },

  markLeadAsProcessed: (id) => set((state) => {
    const newLeads = state.leads.map(l => l.id === id ? { ...l, processed: true } : l);
    idbSet('app-leads', newLeads);
    return { leads: newLeads };
  }),

  removeLead: (id) => set((state) => {
    const newLeads = state.leads.filter(l => l.id !== id);
    idbSet('app-leads', newLeads);
    return { leads: newLeads };
  }),

  exportLeads: () => {
    const { leads } = get();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `tta_leads_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    get().addLog({ type: 'info', message: 'Export des leads commerciaux réussi.' });
  },

  addGeneratedImage: (img) => {
    const newImg: GeneratedImage = { ...img, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() };
    set((state) => ({ generatedImages: [newImg, ...state.generatedImages] }));
    get().saveAllSettings();
  },

  removeGeneratedImage: (id) => set((state) => {
    const newImages = state.generatedImages.filter(img => img.id !== id);
    idbSet('app-gallery', newImages);
    return { generatedImages: newImages };
  }),

  addTodo: (text, priority: TodoTask['priority'] = 'medium') => {
    const newTodo: TodoTask = { id: Math.random().toString(36).substr(2, 9), text, completed: false, priority, timestamp: new Date().toISOString() };
    set((state) => ({ todos: [newTodo, ...state.todos] }));
    get().saveAllSettings();
  },

  toggleTodo: (id) => {
    set((state) => ({ todos: state.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t) }));
    idbSet('app-todos', get().todos);
  },

  removeTodo: (id) => {
    set((state) => ({ todos: state.todos.filter(t => t.id !== id) }));
    idbSet('app-todos', get().todos);
  },

  clearTodos: () => { set({ todos: [] }); idbSet('app-todos', []); },

  startSession: (sessionData) => {
    const sessionId = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newSession: ActiveSession = {
      id: sessionId,
      startTime: now,
      userAgent: navigator.userAgent,
      userLanguage: navigator.language,
      currentMode: 'IDLE',
      transcription: { user: '', ai: '' },
      audioLevel: 0,
      isConnected: true,
      duration: 0,
      requestsCount: 0,
      lastActivity: now,
      ...sessionData
    };
    set((state) => ({ activeSessions: [newSession, ...state.activeSessions] }));
    return sessionId;
  },

  updateSession: (id, updates) => set((state) => ({
    activeSessions: state.activeSessions.map(session =>
      session.id === id ? { ...session, ...updates, lastActivity: new Date().toISOString() } : session
    )
  })),

  endSession: (id) => set((state) => ({
    activeSessions: state.activeSessions.filter(session => session.id !== id)
  })),

  clearInactiveSessions: () => set((state) => ({
    activeSessions: state.activeSessions.filter(session => session.isConnected)
  })),

  clearData: async () => {
    await idbClear();
    set({ config: DEFAULT_CONFIG, usage: DEFAULT_USAGE, videoUrls: DEFAULT_VIDEO_URLS, logs: [], leads: [], todos: [], generatedImages: [], activeSessions: [], catalog: PRODUCT_CATALOG, systemInstruction: SYSTEM_PROMPT });
    window.location.reload();
  },

  setLiveState: (isLive, isConnecting = false) => set({ isLive, isConnecting }),
  setAudioLevel: (audioLevel) => set({ audioLevel }),
  setPermissions: (granted: boolean) => set({ hasPermissions: granted }),

  triggerReportToast: () => {
    set({ showReportToast: true });
    setTimeout(() => set({ showReportToast: false }), 5000);
  },

  setGroundingChunks: (chunks: GroundingChunk[]) => set({ groundingChunks: chunks }),
  setAudioAnalyser: (audioAnalyser) => set({ audioAnalyser }),
  setTranscription: (type, text) => set((state) => ({ transcription: { ...state.transcription, [type]: text } })),
  clearTranscription: () => set({ transcription: { user: '', ai: '' }, groundingChunks: [] }),

  loadStoredData: async () => {
    const config = await idbGet<AppConfig>('app-config');
    if (config) set({ config: { ...DEFAULT_CONFIG, ...config } });

    const todos = await idbGet<TodoTask[]>('app-todos');
    if (todos) set({ todos });

    const leads = await idbGet<SalesLead[]>('app-leads');
    if (leads) set({ leads });

    const gallery = await idbGet<GeneratedImage[]>('app-gallery');
    if (gallery) set({ generatedImages: gallery });

    const usage = await idbGet<UsageStats>('app-usage');
    if (usage) set({ usage: { ...DEFAULT_USAGE, ...usage } });

    const storedCatalog = await idbGet<Product[]>('app-catalog');
    if (storedCatalog) set({ catalog: storedCatalog });

    const systemPrompt = await idbGet<string>('app-system-prompt');
    if (systemPrompt) set({ systemInstruction: systemPrompt });

    const keys: (keyof VideoFiles)[] = ['intro', 'idle', 'talking'];
    const newVideoUrls = { ...get().videoUrls };
    for (const key of keys) {
      try {
        const stored = await idbGet(`video-${key}`);
        if (stored instanceof Blob) newVideoUrls[key] = URL.createObjectURL(stored);
      } catch (err) { console.error(`Error loading video ${key}:`, err); }
    }
    set({ videoUrls: newVideoUrls });
  }
}));
