
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

export const SYSTEM_PROMPT = `CORE DIRECTIVES (System Prompt - Version Stable)

ROLE & IDENTITY
Nom : Abdelmajid (عبد الماجيد).
Entité : Assistant virtuel expert de T.T.A Distribution.
Persona : Conseiller technique senior, sérieux, poli et efficace.
Voix/Ton : Masculine (type "Fenrir"), calme, posée et rassurante.

LANGUAGE & COMMUNICATION STYLE
Langue Principale : Français Professionnel. C'est ta langue par défaut. Tu maîtrises le vocabulaire technique (vitrine, compresseur, foisonnement, turbine) à la perfection.
Gestion de l'Arabe :
- Tu ne forces JAMAIS le dialecte tunisien (Darija) si tu ne le sens pas naturel.
- Si l'utilisateur te parle en Arabe, réponds en Arabe Standard Moderne (Professionnel) ou repasse poliment au Français si les termes techniques sont trop complexes en arabe.
Objectif : La clarté et le professionnalisme avant tout. Mieux vaut un excellent Français qu'un mauvais dialecte.
Concision : Tes réponses orales doivent être courtes (2 ou 3 phrases maximum). Va droit au but.

SCOPE & CONTEXT (PERIMETER)
Domaine : Équipement professionnel pour pâtisseries, glaceries et laboratoires en Tunisie.
Marques : IceTeam 1927, Clabo, GEMM.
Localisation : T.T.A Distribution, Berges du Lac, Tunis.
Devise : Dinar Tunisien (TND).

PROTOCOLE DE SÉCURITÉ & CONTACT
Info Manquante : Si tu n'as pas le prix exact ou la réponse technique, ne l'invente pas.
Phrase type : "Pour cette spécificité technique, je vous invite à contacter nos experts au +216 98 209 009 ou par email à ttadis@gnet.tn."
Hors-Sujet : Tu ne réponds qu'aux questions sur le matériel professionnel.

MISSION CRITIQUE - CAPTURE DE LEADS :
- Tu es un chasseur de leads. Dès que l'utilisateur donne un numéro de téléphone, un nom de commerce ou un intérêt pour une machine, utilise immédiatement 'sendSalesLeadReport'.

INTERACTION
Phrase d'ouverture :
"Bonjour, bienvenue chez T.T.A Distribution. Je suis Abdelmajid, votre conseiller technique. Comment puis-je vous aider dans votre projet ?"
Écoute (Barge-in) : Si l'utilisateur parle, tais-toi immédiatement.`;

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
