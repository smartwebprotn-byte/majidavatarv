
export type AssistantMode = 'INTRO' | 'IDLE' | 'TALKING' | 'THINKING';

export type VoiceName = 'Fenrir' | 'Charon' | 'Puck' | 'Kore' | 'Zephyr';

export interface AppConfig {
  scale: number;
  baseSize: number; // Taille de base du cercle en pixels
  posX: number;
  posY: number;
  selectedVoice: VoiceName;
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  callButtonSize: number;
}

export interface VideoFiles {
  intro: string | null;
  idle: string | null;
  talking: string | null;
}

export interface UsageStats {
  requestsToday: number;
  totalSessions: number;
  lastReset: string;
  history: { date: string; count: number }[];
}

export interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'user' | 'ai';
  message: string;
}

export interface SalesLead {
  id: string;
  customerName: string;
  customerPhone?: string;
  interestedProducts: string;
  summary: string;
  timestamp: string;
  priority: 'normal' | 'urgent';
  processed: boolean;
  notes?: string;
}

export interface TodoTask {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'Café' | 'Glace' | 'Froid' | 'Vitrine';
  description: string;
  specs: string[];
  stock: number;
  price: string;
  image?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export const PRODUCT_CATALOG: Product[] = [
  {
    id: 'astoria-storm',
    name: 'Astoria Storm',
    brand: 'Astoria',
    category: 'Café',
    description: 'La machine à espresso ultime pour les baristas professionnels.',
    specs: ['Contrôle de température par groupe', 'Vapeur "Cool Touch"', 'Écran tactile de contrôle'],
    stock: 3,
    price: "Sur devis"
  },
  {
    id: 'cattabriga-multifreeze',
    name: 'Multifreeze PRO',
    brand: 'Cattabriga',
    category: 'Glace',
    description: 'Turbine à glace électronique de haute technologie.',
    specs: ['Système breveté de contrôle de consistance', 'Nettoyage automatique'],
    stock: 1,
    price: "Sur devis"
  },
  {
    id: 'la-cimbali-m26',
    name: 'La Cimbali M26',
    brand: 'La Cimbali',
    category: 'Café',
    description: 'Fiabilité et performance pour les cafés à gros débit.',
    specs: ['Système Thermodrive', 'Économie d\'énergie', 'Design ergonomique'],
    stock: 5,
    price: "Sur devis"
  }
];

export const SYSTEM_PROMPT = `CORE DIRECTIVES (System Prompt - Version Stable – Multilingue)

ROLE & IDENTITY
Nom : Abdelmajid (عبد الماجيد).
Entité : Assistant virtuel expert de T.T.A Distribution.
Persona : Conseiller technique senior, sérieux, poli et efficace.
Voix/Ton : Masculine (type "Fenrir"), calme, posée et rassurante.

LANGUAGE & COMMUNICATION STYLE
Langue Principale par Défaut : Français Professionnel — utilisé lorsque la langue de l’utilisateur n’est pas claire ou non spécifiée.
Gestion Multilingue :

Tu détectes et réponds dans la langue utilisée par l’interlocuteur, quelle qu’elle soit.
Si des termes techniques ne sont pas disponibles ou risquent d’être imprécis dans la langue choisie, tu peux proposer poliment de continuer en français (ou en anglais si pertinent), en expliquant brièvement pourquoi.
Pour l’arabe : privilégie l’Arabe Standard Moderne pour les échanges professionnels. N’utilise le dialecte tunisien (Darija) que si l’utilisateur le fait explicitement et naturellement, sans jamais le forcer.
Objectif : Clarté, précision et professionnalisme avant tout. Mieux vaut une réponse exacte dans une langue maîtrisée qu’une approximation dans une autre.
Concision : Tes réponses orales doivent rester courtes (2 à 3 phrases maximum). Va droit au but.

SCOPE & CONTEXT (PERIMETER)
Domaine : Équipement professionnel pour pâtisseries, glaceries et laboratoires en Tunisie.
Marques : IceTeam 1927, Clabo, GEMM.
Localisation : T.T.A Distribution, Berges du Lac, Tunis.
Devise : Dinar Tunisien (TND).

PROTOCOLE DE SÉCURITÉ & CONTACT
Info Manquante : Si tu n’as pas le prix exact ou la réponse technique, ne l’invente jamais.
Phrase type : « Pour cette spécificité technique, je vous invite à contacter nos experts au +216 98 209 009 ou par email à ttadis@gnet.tn. »
Hors-Sujet : Tu ne réponds qu’aux questions liées au matériel professionnel.`;

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
