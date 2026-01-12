
import { GoogleGenAI, Modality, LiveServerMessage, FunctionDeclaration, Type } from '@google/genai';
import { useStore } from '../store';
import { encodeAudio, decodeAudio, decodeAudioData } from './audio-processor';
import { GroundingChunk } from '../types';

let sessionPromise: Promise<any> | null = null;
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let outputAnalyser: AnalyserNode | null = null;
let inputAnalyser: AnalyserNode | null = null;
let stream: MediaStream | null = null;
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();

const checkInventoryDeclaration: FunctionDeclaration = {
  name: 'checkInventory',
  parameters: {
    type: Type.OBJECT,
    description: 'Vérifie la disponibilité en stock d\'une machine dans la base T.T.A.',
    properties: {
      productName: { type: Type.STRING, description: 'Le nom de la machine ou la marque.' }
    },
    required: ['productName'],
  },
};

const generateMarketingPosterDeclaration: FunctionDeclaration = {
  name: 'generateMarketingPoster',
  parameters: {
    type: Type.OBJECT,
    description: 'Génère un visuel publicitaire haute qualité pour une machine.',
    properties: { prompt: { type: Type.STRING, description: 'Le sujet du poster marketing.' } },
    required: ['prompt'],
  },
};

const sendSalesLeadReportDeclaration: FunctionDeclaration = {
  name: 'sendSalesLeadReport',
  parameters: {
    type: Type.OBJECT,
    description: 'Enregistre un nouveau prospect (lead) dans le registre commercial.',
    properties: {
      customerName: { type: Type.STRING },
      customerPhone: { type: Type.STRING, description: 'Le numéro de téléphone du client.' },
      interestedProducts: { type: Type.STRING },
      summary: { type: Type.STRING },
      urgency: { type: Type.STRING, enum: ['normal', 'urgent'] }
    },
    required: ['customerName', 'interestedProducts', 'summary'],
  },
};

const manageTodoListDeclaration: FunctionDeclaration = {
  name: 'manageTodoList',
  parameters: {
    type: Type.OBJECT,
    description: 'Ajoute ou modifie des tâches dans la liste administrative.',
    properties: {
      action: { type: Type.STRING, enum: ['add', 'list', 'complete', 'delete'] },
      taskText: { type: Type.STRING },
      taskId: { type: Type.STRING }
    },
    required: ['action'],
  },
};

async function executeImageGen(prompt: string) {
  const store = useStore.getState();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  store.setMode('THINKING');
  store.incrementRequest();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Professional commercial photography of ${prompt} for T.T.A Distribution Tunis, high-end Italian style, 4k resolution.` }] },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        store.addGeneratedImage({ url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`, prompt });
        store.addLog({ type: 'ai', message: `Studio : Poster généré avec succès pour "${prompt}"` });
        return true;
      }
    }
  } catch (err) {
    console.error("Image Gen Error:", err);
    store.addLog({ type: 'error', message: "Échec de génération d'image marketing via AI." });
  }
  return false;
}

function calculateVolume(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
  return Math.min(Math.sqrt(sum / data.length) * 10, 1);
}

function trackVolume() {
  const update = () => {
    const state = useStore.getState();
    const analyser = state.currentMode === 'TALKING' ? outputAnalyser : inputAnalyser;
    if (analyser) {
      const dataArray = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatTimeDomainData(dataArray);
      useStore.getState().setAudioLevel(calculateVolume(dataArray));
    }
    if (sessionPromise) requestAnimationFrame(update);
  };
  update();
}

export async function startVoiceSession() {
  const store = useStore.getState();
  if (store.isLive || store.isConnecting) return;
  if (store.config.isMaintenanceMode) {
    store.addLog({ type: 'info', message: 'Système bloqué : Mode Maintenance Manager actif.' });
    return;
  }

  store.setLiveState(false, true);
  store.incrementSession();

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    outputAnalyser = outputAudioContext.createAnalyser();
    outputAnalyser.fftSize = 256;
    outputAnalyser.connect(outputAudioContext.destination);

    inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    inputAnalyser = inputAudioContext.createAnalyser();

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (micError: any) {
      if (micError.name === 'NotAllowedError') {
        store.addLog({ type: 'error', message: "Microphone refusé. Si intégré via iframe, vérifiez l'attribut allow='microphone'." });
        console.error("Microphone denied. Ensure <iframe allow='microphone; ...'> is used in parent site.");
      }
      throw micError;
    }
    const micSource = inputAudioContext.createMediaStreamSource(stream);
    micSource.connect(inputAnalyser);
    store.setAudioAnalyser(inputAnalyser);
    trackVolume();

    sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: async () => {
          store.setLiveState(true, false);
          store.setMode('IDLE');
          if (!inputAudioContext || !stream) return;
          scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise?.then(session => session.sendRealtimeInput({
              media: { data: encodeAudio(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
            }));
          };
          inputAnalyser?.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
          store.addLog({ type: 'info', message: 'Canal Live API Abdelmajid ouvert.' });
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.modelTurn) store.incrementRequest();

          if (message.toolCall) {
            store.setMode('THINKING');
            for (const fc of message.toolCall.functionCalls) {
              let result = "OK.";

              if (fc.name === 'checkInventory') {
                const { productName } = fc.args as any;
                const found = store.catalog.find(p => p.name.toLowerCase().includes(productName.toLowerCase()) || p.brand.toLowerCase().includes(productName.toLowerCase()));
                result = found ? `Le stock pour ${found.name} est de ${found.stock} unités au prix de ${found.price}.` : "Produit non trouvé en base T.T.A.";
                store.addLog({ type: 'info', message: `Outil Inventaire : Consultation pour ${productName}` });
              }
              else if (fc.name === 'generateMarketingPoster') {
                const success = await executeImageGen((fc.args as any).prompt);
                result = success ? "Poster marketing généré dans le studio." : "Echec technique de la génération.";
              }
              else if (fc.name === 'sendSalesLeadReport') {
                const args = fc.args as any;
                store.addLead({
                  customerName: args.customerName,
                  customerPhone: args.customerPhone,
                  interestedProducts: args.interestedProducts,
                  summary: args.summary,
                  priority: args.urgency || 'normal'
                });
                store.triggerReportToast();
                store.addLog({ type: 'ai', message: `Outil Ventes : Lead capturé (${args.customerName})` });
              }
              else if (fc.name === 'manageTodoList') {
                const { action, taskText, taskId } = fc.args as any;
                if (action === 'add') {
                  store.addTodo(taskText, 'medium');
                  result = "Action ajoutée à la liste du manager.";
                } else if (action === 'list') {
                  result = `Vous avez ${store.todos.filter(t => !t.completed).length} tâches en attente.`;
                } else if (action === 'complete') {
                  const t = store.todos.find(td => td.text.includes(taskText) || td.id === taskId);
                  if (t) store.toggleTodo(t.id);
                  result = "Tâche mise à jour.";
                }
                store.addLog({ type: 'info', message: `Outil Tâche : Modification du registre des actions.` });
              }

              sessionPromise?.then(session => session.sendToolResponse({
                functionResponses: { id: fc.id, name: fc.name, response: { result: result } }
              }));
              store.setMode('IDLE');
            }
          }

          if (message.serverContent?.groundingMetadata?.groundingChunks) {
            store.setGroundingChunks(message.serverContent.groundingMetadata.groundingChunks as GroundingChunk[]);
          }

          const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData && outputAudioContext && outputAnalyser) {
            store.setMode('TALKING');
            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
            const buffer = await decodeAudioData(decodeAudio(audioData), outputAudioContext, 24000, 1);
            const source = outputAudioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(outputAnalyser);
            source.addEventListener('ended', () => {
              sources.delete(source);
              if (sources.size === 0) store.setMode('IDLE');
            });
            source.start(nextStartTime);
            nextStartTime += buffer.duration;
            sources.add(source);
          }

          const interrupted = message.serverContent?.interrupted;
          if (interrupted) {
            for (const source of sources.values()) {
              try { source.stop(); } catch (e) { }
              sources.delete(source);
            }
            nextStartTime = 0;
            store.setMode('IDLE');
          }

          if (message.serverContent?.inputTranscription) store.setTranscription('user', message.serverContent.inputTranscription.text);
          if (message.serverContent?.outputTranscription) store.setTranscription('ai', message.serverContent.outputTranscription.text);
        },
        onerror: (e: any) => {
          console.error("Live Session Error:", e);
          const msg = e?.message || "";
          if (msg.includes("implemented") || msg.includes("supported") || msg.includes("enabled")) {
            store.addLog({ type: 'error', message: "API Live non supportée par cette clé. Utilisez une clé API payante." });
          } else {
            store.addLog({ type: 'error', message: "Erreur critique de la session Live API." });
          }
          stopVoiceSession();
        },
        onclose: () => {
          store.addLog({ type: 'info', message: "Session terminée." });
          stopVoiceSession();
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: store.config.selectedVoice } } },
        systemInstruction: store.systemInstruction,
        tools: [
          { functionDeclarations: [checkInventoryDeclaration, sendSalesLeadReportDeclaration, manageTodoListDeclaration, generateMarketingPosterDeclaration] }
        ]
      },
    });
  } catch (err) {
    console.error("Critical Start Error:", err);
    store.setLiveState(false, false);
  }
}

export function stopVoiceSession() {
  const store = useStore.getState();
  if (scriptProcessor) {
    try { scriptProcessor.disconnect(); } catch (e) { }
    scriptProcessor = null;
  }
  if (stream) {
    try { stream.getTracks().forEach(t => t.stop()); } catch (e) { }
    stream = null;
  }
  if (outputAnalyser) {
    try { outputAnalyser.disconnect(); } catch (e) { }
    outputAnalyser = null;
  }
  if (inputAnalyser) {
    try { inputAnalyser.disconnect(); } catch (e) { }
    inputAnalyser = null;
  }

  if (inputAudioContext && inputAudioContext.state !== 'closed') {
    inputAudioContext.close().catch(() => { });
  }
  inputAudioContext = null;

  if (outputAudioContext && outputAudioContext.state !== 'closed') {
    outputAudioContext.close().catch(() => { });
  }
  outputAudioContext = null;

  sources.forEach(s => { try { s.stop(); } catch (e) { } });
  sources.clear();

  if (sessionPromise) {
    sessionPromise.then(session => {
      try { session.close(); } catch (e) { }
    }).catch(() => { });
    sessionPromise = null;
  }

  store.setLiveState(false, false);
  store.setMode('IDLE');
  store.setAudioLevel(0);
}
