
import { World, Property, Upgrade, StoreItem, NPC, PlayerState, ResourceType } from './types';

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';
export const API_KEY_ENV_VAR = 'API_KEY'; // Standardized name

export const INITIAL_PLAYER_STATE: PlayerState = {
  resources: {
    [ResourceType.GOLD]: 10,
    [ResourceType.MANA]: 0,
    [ResourceType.CRYSTALS]: 0,
    [ResourceType.DATA_FRAGMENTS]: 0,
  },
  ownedProperties: {},
  purchasedUpgrades: new Set(),
  inventory: new Set(),
  unlockedWorlds: new Set(['primordia']),
  currentWorldId: 'primordia',
  npcDialogues: {},
  worldDescriptions: {},
  itemFlavorTexts: {},
  propertyFlavorTexts: {},
  apiKeyState: 'loading',
};

export const WORLDS_DATA: World[] = [
  {
    id: 'primordia',
    name: 'Primordia Station',
    unlockCost: {},
    baseClickValue: { [ResourceType.DATA_FRAGMENTS]: 1 },
    clickResource: ResourceType.DATA_FRAGMENTS,
    initialNpcId: 'archivist_zane',
    availablePropertyIds: ['data_node_alpha', 'compute_cluster_basic'],
    availableUpgradeIds: ['data_tap_efficiency_1', 'auto_compiler_speed_1'],
    availableItemIds: ['basic_toolkit'],
    backgroundColor: 'bg-slate-800',
    textColor: 'text-slate-100',
    accentColor: 'bg-sky-500',
    buttonClass: 'bg-sky-500 hover:bg-sky-600 text-white',
    backgroundImageUrl: 'https://picsum.photos/seed/primordia/1920/1080',
  },
  {
    id: 'verdant_grove',
    name: 'Verdant Grove',
    unlockCost: { [ResourceType.DATA_FRAGMENTS]: 500, [ResourceType.GOLD]: 100 },
    baseClickValue: { [ResourceType.GOLD]: 5 },
    clickResource: ResourceType.GOLD,
    initialNpcId: 'sylva_whisperwind',
    availablePropertyIds: ['mana_spring', 'crystal_farm_small'],
    availableUpgradeIds: ['mana_conduit_1', 'crystal_lens_1'],
    availableItemIds: ['explorer_pack', 'harvesting_scythe'],
    backgroundColor: 'bg-green-800',
    textColor: 'text-green-100',
    accentColor: 'bg-emerald-500',
    buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    backgroundImageUrl: 'https://picsum.photos/seed/verdant/1920/1080',
  },
];

export const PROPERTIES_DATA: Property[] = [
  // Primordia Properties
  {
    id: 'data_node_alpha', name: 'Data Node Alpha', worldId: 'primordia',
    cost: { [ResourceType.DATA_FRAGMENTS]: 20 },
    baseProduction: { [ResourceType.DATA_FRAGMENTS]: 0.5 }, productionResource: ResourceType.DATA_FRAGMENTS,
    description: 'Passively collects stray data fragments.', icon: '📡',
  },
  {
    id: 'compute_cluster_basic', name: 'Basic Compute Cluster', worldId: 'primordia',
    cost: { [ResourceType.DATA_FRAGMENTS]: 100 },
    baseProduction: { [ResourceType.DATA_FRAGMENTS]: 3 }, productionResource: ResourceType.DATA_FRAGMENTS,
    description: 'Processes raw data into usable fragments.', icon: '💻',
  },
  // Verdant Grove Properties
  {
    id: 'mana_spring', name: 'Mana Spring', worldId: 'verdant_grove',
    cost: { [ResourceType.GOLD]: 75 },
    baseProduction: { [ResourceType.MANA]: 1 }, productionResource: ResourceType.MANA,
    description: 'A natural spring bubbling with raw mana.', icon: '💧',
  },
  {
    id: 'crystal_farm_small', name: 'Small Crystal Farm', worldId: 'verdant_grove',
    cost: { [ResourceType.GOLD]: 300, [ResourceType.MANA]: 50 },
    baseProduction: { [ResourceType.CRYSTALS]: 0.2 }, productionResource: ResourceType.CRYSTALS,
    description: 'Cultivates small, energy-rich crystals.', icon: '💎',
  },
];

export const UPGRADES_DATA: Upgrade[] = [
  // Primordia Upgrades
  {
    id: 'data_tap_efficiency_1', name: 'Data Tap Efficiency I',
    cost: { [ResourceType.DATA_FRAGMENTS]: 50 },
    description: 'Improves manual data fragment collection.', effectDescription: '+100% Click Value for Data Fragments',
    type: 'clickBoost', worldId: 'primordia', value: 1, icon: '🖱️',
  },
  {
    id: 'auto_compiler_speed_1', name: 'Auto-Compiler Speed I',
    cost: { [ResourceType.DATA_FRAGMENTS]: 200 },
    description: 'Boosts Data Node Alpha output.', effectDescription: '+50% Data Node Alpha Output',
    type: 'propertyBoost', targetPropertyId: 'data_node_alpha', value: 0.5, icon: '⚙️',
  },
  // Verdant Grove Upgrades
  {
    id: 'mana_conduit_1', name: 'Mana Conduit I',
    cost: { [ResourceType.GOLD]: 150, [ResourceType.MANA]: 25 },
    description: 'Enhances mana gathering from clicks.', effectDescription: '+1 Mana per click in Verdant Grove',
    type: 'clickBoost', worldId: 'verdant_grove', value: 1, icon: '✨',
  },
  {
    id: 'crystal_lens_1', name: 'Crystal Lens I',
    cost: { [ResourceType.GOLD]: 500, [ResourceType.MANA]: 100, [ResourceType.CRYSTALS]: 10 },
    description: 'Focuses energy for better crystal growth.', effectDescription: '+25% Small Crystal Farm Output',
    type: 'propertyBoost', targetPropertyId: 'crystal_farm_small', value: 0.25, icon: '🔍',
  },
];

export const ITEMS_DATA: StoreItem[] = [
  // Primordia Items
  {
    id: 'basic_toolkit', name: 'Basic Toolkit',
    cost: { [ResourceType.DATA_FRAGMENTS]: 250 }, type: 'tool',
    description: 'A set of fundamental tools. Slightly increases all Data Fragment gains.',
    effects: '+5% all Data Fragment gains', icon: '🔧',
  },
  // Verdant Grove Items
  {
    id: 'explorer_pack', name: 'Explorer\'s Pack',
    cost: { [ResourceType.GOLD]: 300, [ResourceType.MANA]: 50 }, type: 'tool',
    description: 'Essential gear for venturing into new territories. Increases Gold from clicks.',
    effects: '+10% Gold from clicks', icon: '🎒',
  },
  {
    id: 'harvesting_scythe', name: 'Harvesting Scythe',
    cost: { [ResourceType.GOLD]: 700, [ResourceType.MANA]: 150, [ResourceType.CRYSTALS]: 20 }, type: 'weapon', // Placeholder type
    description: 'An enchanted scythe that boosts Mana Spring output.',
    effects: '+20% Mana Spring Output', icon: '🌿',
  },
];

export const NPCS_DATA: NPC[] = [
  {
    id: 'archivist_zane', name: 'Archivist Zane', worldId: 'primordia',
    basePrompt: `You are Archivist Zane, a cautious but helpful AI custodian of Primordia Station, an ancient data hub. You are speaking to a new arrival, a "Traveler". Offer guidance about collecting Data Fragments and establishing basic systems. Keep your responses concise, slightly formal, and hint at forgotten technologies. Current game state:`,
    icon: '🤖',
  },
  {
    id: 'sylva_whisperwind', name: 'Sylva Whisperwind', worldId: 'verdant_grove',
    basePrompt: `You are Sylva Whisperwind, an ancient guardian of the Verdant Grove, a world brimming with life and magic. You are speaking to a Traveler who has just arrived. Speak with a gentle, wise, and slightly mystical tone. Guide them on harnessing Gold, Mana, and Crystals. Your responses should be 2-3 sentences. Current game state:`,
    icon: '🧝‍♀️',
  },
];

export const RESOURCE_ICONS: Record<ResourceType, string> = {
  [ResourceType.GOLD]: '💰',
  [ResourceType.MANA]: '💧',
  [ResourceType.CRYSTALS]: '💎',
  [ResourceType.DATA_FRAGMENTS]: '💾',
};

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  [ResourceType.GOLD]: 'text-star-yellow',
  [ResourceType.MANA]: 'text-crystal-blue',
  [ResourceType.CRYSTALS]: 'text-purple-400',
  [ResourceType.DATA_FRAGMENTS]: 'text-sky-400',
};
