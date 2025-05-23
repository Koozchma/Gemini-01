
export enum ResourceType {
  GOLD = 'GOLD',
  MANA = 'MANA',
  CRYSTALS = 'CRYSTALS',
  DATA_FRAGMENTS = 'DATA_FRAGMENTS',
}

export type Resources = Partial<Record<ResourceType, number>>;

export interface Property {
  id: string;
  name: string;
  worldId: string;
  cost: Resources;
  baseProduction: Resources; // Per second
  productionResource: ResourceType;
  description: string;
  icon: string; 
  flavorText?: string;
}

export interface Upgrade {
  id: string;
  name: string;
  cost: Resources;
  description: string;
  effectDescription: string;
  type: 'clickBoost' | 'propertyBoost' | 'globalMultiplier' | 'worldSpecific';
  worldId?: string; // For world-specific upgrades
  targetPropertyId?: string; // For property-specific boosts
  value: number; // e.g., percentage increase (0.1 for 10%) or flat amount
  icon: string;
}

export interface StoreItem {
  id: string;
  name: string;
  cost: Resources;
  type: 'weapon' | 'armor' | 'tool';
  description: string;
  flavorText?: string;
  icon: string;
  effects?: string; // e.g. "+10% Gold from clicks"
}

export interface World {
  id: string;
  name: string;
  unlockCost: Resources;
  baseClickValue: Resources;
  clickResource: ResourceType;
  initialNpcId?: string;
  availablePropertyIds: string[];
  availableUpgradeIds: string[];
  availableItemIds?: string[]; // Items specific to this world's store section
  description?: string; // To be fetched from Gemini
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  buttonClass: string;
  backgroundImageUrl?: string; // URL for background image
  ambientSound?: string; // Path to sound file
}

export interface NPC {
  id: string;
  name: string;
  worldId: string;
  basePrompt: string; // Base prompt for Gemini
  icon: string;
  dialogue?: string; // Current dialogue, fetched from Gemini
}

export interface PlayerState {
  resources: Resources;
  ownedProperties: Record<string, { count: number; worldId: string }>;
  purchasedUpgrades: Set<string>;
  inventory: Set<string>;
  unlockedWorlds: Set<string>;
  currentWorldId: string;
  npcDialogues: Record<string, string>; // NPC ID -> dialogue
  worldDescriptions: Record<string, string>; // World ID -> description
  itemFlavorTexts: Record<string, string>; // Item ID -> flavor text
  propertyFlavorTexts: Record<string, string>; // Property ID -> flavor text
  apiKeyState?: 'loading' | 'ready' | 'error';
}

export type GameAction =
  | { type: 'CLICK_GATHER'; world: World }
  | { type: 'BUY_PROPERTY'; property: Property }
  | { type: 'BUY_UPGRADE'; upgrade: Upgrade }
  | { type: 'BUY_ITEM'; item: StoreItem }
  | { type: 'UNLOCK_WORLD'; world: World }
  | { type: 'CHANGE_WORLD'; worldId: string }
  | { type: 'UPDATE_RESOURCES'; newResources: Resources }
  | { type: 'SET_NPC_DIALOGUE'; npcId: string; dialogue: string }
  | { type: 'SET_WORLD_DESCRIPTION'; worldId: string; description: string }
  | { type: 'SET_ITEM_FLAVOR_TEXT'; itemId: string; text: string }
  | { type: 'SET_PROPERTY_FLAVOR_TEXT'; propertyId: string; text: string }
  | { type: 'LOAD_GAME'; state: PlayerState }
  | { type: 'SET_API_KEY_STATE', status: 'loading' | 'ready' | 'error'};
