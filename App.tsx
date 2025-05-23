
import React, { useState, useEffect, useReducer, useCallback } from 'react';
// Import 'Resources' type
import { PlayerState, GameAction, ResourceType, World, Property, Upgrade, StoreItem, NPC, Resources } from './types';
import { INITIAL_PLAYER_STATE, WORLDS_DATA, PROPERTIES_DATA, UPGRADES_DATA, ITEMS_DATA, NPCS_DATA, API_KEY_ENV_VAR } from './constants';
import { ResourceDisplay } from './components/ResourceDisplay';
import { WorldView } from './components/WorldView';
import { PanelTabs, PanelView } from './components/PanelTabs';
import { PropertiesPanel } from './components/PropertiesPanel';
import { UpgradesPanel } from './components/UpgradesPanel';
import { StorePanel } from './components/StorePanel';
import { WorldsPanel } from './components/WorldsPanel';
import { NpcModal } from './components/NpcModal';
import { initializeGeminiService, fetchNpcDialogue, fetchWorldDescription, fetchItemFlavorText, fetchPropertyFlavorText } from './services/geminiService';
import { Button } from './components/shared/Button';
import { Card } from './components/shared/Card';

const LOCAL_STORAGE_KEY = 'cosmicClickerConquestSave';

// Fix: Resources type was missing
const calculateProduction = (state: PlayerState): Resources => {
  // Fix: Resources type was missing
  const production: Resources = {};

  Object.values(ResourceType).forEach(resType => production[resType] = 0);

  for (const propertyId in state.ownedProperties) {
    const ownedProp = state.ownedProperties[propertyId];
    const propData = PROPERTIES_DATA.find(p => p.id === propertyId);
    if (propData) {
      let baseProdVal = Object.values(propData.baseProduction)[0]!;
      let finalProd = baseProdVal * ownedProp.count;

      state.purchasedUpgrades.forEach(upgradeId => {
        const upgradeData = UPGRADES_DATA.find(u => u.id === upgradeId);
        if (upgradeData?.type === 'propertyBoost' && upgradeData.targetPropertyId === propertyId) {
          finalProd *= (1 + upgradeData.value);
        }
      });
      
      production[propData.productionResource] = (production[propData.productionResource] || 0) + finalProd;
    }
  }
  
  state.purchasedUpgrades.forEach(upgradeId => {
    const upgradeData = UPGRADES_DATA.find(u => u.id === upgradeId);
    if (upgradeData?.type === 'globalMultiplier' && production[upgradeData.worldId as ResourceType]) { 
        production[upgradeData.worldId as ResourceType]! *= (1 + upgradeData.value);
    }
  });

  state.inventory.forEach(itemId => {
      const itemData = ITEMS_DATA.find(i => i.id === itemId);
      if(itemData?.id === 'basic_toolkit'){ 
          if(production[ResourceType.DATA_FRAGMENTS]) production[ResourceType.DATA_FRAGMENTS]! *= 1.05;
          else production[ResourceType.DATA_FRAGMENTS] = 0; // Ensure it exists before multiplying
      }
      if(itemData?.id === 'harvesting_scythe'){
         const manaSpring = PROPERTIES_DATA.find(p => p.id === 'mana_spring');
         if(manaSpring) {
            const baseManaSpringProduction = Object.values(manaSpring.baseProduction)[0]!;
            const ownedManaSprings = state.ownedProperties['mana_spring']?.count || 0;
            const bonusProduction = baseManaSpringProduction * ownedManaSprings * 0.20;
            production[manaSpring.productionResource] = (production[manaSpring.productionResource] || 0) + bonusProduction;
         }
      }
  });

  return production;
};

const gameReducer = (state: PlayerState, action: GameAction): PlayerState => {
  switch (action.type) {
    case 'CLICK_GATHER': {
      const world = action.world;
      const newResources = { ...state.resources };
      let clickValue = Object.values(world.baseClickValue)[0]!;
      
      state.purchasedUpgrades.forEach(upgradeId => {
        const upgrade = UPGRADES_DATA.find(u => u.id === upgradeId);
        if (upgrade?.type === 'clickBoost' && (upgrade.worldId === world.id || !upgrade.worldId)) {
          clickValue += upgrade.value * (upgrade.value < 5 ? Object.values(world.baseClickValue)[0]! : 1); 
        }
      });

      state.inventory.forEach(itemId => {
        const item = ITEMS_DATA.find(i => i.id === itemId);
        if(item?.id === 'explorer_pack' && world.clickResource === ResourceType.GOLD){
            clickValue *= 1.10;
        }
      });

      newResources[world.clickResource] = (newResources[world.clickResource] || 0) + clickValue;
      return { ...state, resources: newResources };
    }
    case 'BUY_PROPERTY': {
      const prop = action.property;
      if (Object.entries(prop.cost).every(([res, amt]) => (state.resources[res as ResourceType] || 0) >= amt!)) {
        const newResources = { ...state.resources };
        Object.entries(prop.cost).forEach(([res, amt]) => newResources[res as ResourceType]! -= amt!);
        const newOwnedProps = { ...state.ownedProperties };
        newOwnedProps[prop.id] = { 
            count: (newOwnedProps[prop.id]?.count || 0) + 1,
            worldId: prop.worldId 
        };
        return { ...state, resources: newResources, ownedProperties: newOwnedProps };
      }
      return state;
    }
    case 'BUY_UPGRADE': {
      const upgrade = action.upgrade;
      if (Object.entries(upgrade.cost).every(([res, amt]) => (state.resources[res as ResourceType] || 0) >= amt!)) {
        const newResources = { ...state.resources };
        Object.entries(upgrade.cost).forEach(([res, amt]) => newResources[res as ResourceType]! -= amt!);
        const newPurchasedUpgrades = new Set(state.purchasedUpgrades);
        newPurchasedUpgrades.add(upgrade.id);
        return { ...state, resources: newResources, purchasedUpgrades: newPurchasedUpgrades };
      }
      return state;
    }
    case 'BUY_ITEM': {
        const item = action.item;
        if (Object.entries(item.cost).every(([res, amt]) => (state.resources[res as ResourceType] || 0) >= amt!)) {
            const newResources = { ...state.resources };
            Object.entries(item.cost).forEach(([res, amt]) => newResources[res as ResourceType]! -= amt!);
            const newInventory = new Set(state.inventory);
            newInventory.add(item.id);
            return { ...state, resources: newResources, inventory: newInventory };
        }
        return state;
    }
    case 'UNLOCK_WORLD': {
        const world = action.world;
         if (Object.entries(world.unlockCost).every(([res, amt]) => (state.resources[res as ResourceType] || 0) >= amt!)) {
            const newResources = { ...state.resources };
            Object.entries(world.unlockCost).forEach(([res, amt]) => newResources[res as ResourceType]! -= amt!);
            const newUnlockedWorlds = new Set(state.unlockedWorlds);
            newUnlockedWorlds.add(world.id);
            return { ...state, resources: newResources, unlockedWorlds: newUnlockedWorlds, currentWorldId: world.id };
        }
        return state;
    }
    case 'CHANGE_WORLD':
      return { ...state, currentWorldId: action.worldId };
    case 'UPDATE_RESOURCES':
      const updatedResources = { ...state.resources };
      for (const resKey in action.newResources) {
        const resType = resKey as ResourceType;
        updatedResources[resType] = (updatedResources[resType] || 0) + (action.newResources[resType] || 0);
      }
      return { ...state, resources: updatedResources };
    case 'SET_NPC_DIALOGUE':
      return { ...state, npcDialogues: { ...state.npcDialogues, [action.npcId]: action.dialogue } };
    case 'SET_WORLD_DESCRIPTION':
      return { ...state, worldDescriptions: { ...state.worldDescriptions, [action.worldId]: action.description } };
    case 'SET_ITEM_FLAVOR_TEXT':
      return { ...state, itemFlavorTexts: { ...state.itemFlavorTexts, [action.itemId]: action.text } };
    case 'SET_PROPERTY_FLAVOR_TEXT':
        return { ...state, propertyFlavorTexts: { ...state.propertyFlavorTexts, [action.propertyId]: action.text } };
    case 'LOAD_GAME':
        // Ensure sets are properly recreated from arrays if stored as such
        const loadedState = action.state;
        return {
            ...loadedState,
            purchasedUpgrades: new Set(loadedState.purchasedUpgrades),
            inventory: new Set(loadedState.inventory),
            unlockedWorlds: new Set(loadedState.unlockedWorlds),
            apiKeyState: state.apiKeyState, // Keep current API key state
         };
    case 'SET_API_KEY_STATE':
        return { ...state, apiKeyState: action.status };
    default:
      // Should not happen
      const _exhaustiveCheck: never = action;
      return state;
  }
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_PLAYER_STATE);
  const [activePanel, setActivePanel] = useState<PanelView>('properties');
  const [isNpcModalOpen, setIsNpcModalOpen] = useState(false);
  const [currentNpc, setCurrentNpc] = useState<NPC | null>(null);
  const [isLoadingGemini, setIsLoadingGemini] = useState<Record<string, boolean>>({}); // Tracks loading for various Gemini calls: e.g. npc_NPCID, world_WORLDID, item_ITEMID

  const setGeminiLoading = useCallback((key: string, isLoading: boolean) => {
    setIsLoadingGemini(prevState => ({ ...prevState, [key]: isLoading }));
  }, []);

  // Initialize Gemini Service and load game
  useEffect(() => {
    dispatch({ type: 'SET_API_KEY_STATE', status: 'loading' });
    const errorMsg = initializeGeminiService();
    if (errorMsg) {
      console.error("Gemini Init Error:", errorMsg);
      dispatch({ type: 'SET_API_KEY_STATE', status: 'error' });
    } else {
      dispatch({ type: 'SET_API_KEY_STATE', status: 'ready' });
    }

    const savedGame = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedGame) {
        try {
            const parsedState = JSON.parse(savedGame, (key, value) => {
                 // Reviver function to convert array back to Set for specific keys
                if (key === 'purchasedUpgrades' || key === 'inventory' || key === 'unlockedWorlds') {
                    return new Set(value);
                }
                return value;
            });
            dispatch({ type: 'LOAD_GAME', state: parsedState });
        } catch (e) {
            console.error("Failed to parse saved game:", e);
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted save
        }
    }
  }, []);

  // Save game state to local storage whenever it changes
  useEffect(() => {
    const stateToSave = {
        ...state,
        // Convert Sets to arrays for JSON serialization
        purchasedUpgrades: Array.from(state.purchasedUpgrades),
        inventory: Array.from(state.inventory),
        unlockedWorlds: Array.from(state.unlockedWorlds),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [state]);

  // Game loop for resource production
  useEffect(() => {
    const interval = setInterval(() => {
      const production = calculateProduction(state);
      dispatch({ type: 'UPDATE_RESOURCES', newResources: production });
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  const currentWorld = WORLDS_DATA.find(w => w.id === state.currentWorldId) || WORLDS_DATA[0];

  // Fetch world description if needed
  const fetchWorldDescriptionIfNeeded = useCallback(async (worldId: string, worldName: string) => {
    if (state.apiKeyState !== 'ready' || state.worldDescriptions[worldId] || isLoadingGemini[`world_${worldId}`]) return;
    setGeminiLoading(`world_${worldId}`, true);
    try {
      const description = await fetchWorldDescription(worldName);
      dispatch({ type: 'SET_WORLD_DESCRIPTION', worldId, description });
    } catch (error) {
      console.error(`Failed to fetch description for ${worldName}:`, error);
      // Optionally set a default/error description
    } finally {
      setGeminiLoading(`world_${worldId}`, false);
    }
  }, [state.worldDescriptions, state.apiKeyState, isLoadingGemini, setGeminiLoading]);

  useEffect(() => {
    fetchWorldDescriptionIfNeeded(currentWorld.id, currentWorld.name);
  }, [currentWorld.id, currentWorld.name, fetchWorldDescriptionIfNeeded]);


  // NPC Interaction
  // Define handleNpcInteract before handleOpenNpcModal
  const handleNpcInteract = useCallback(async (npcToInteract?: NPC) => {
    const npc = npcToInteract || currentNpc;
    if (!npc || state.apiKeyState !== 'ready' || isLoadingGemini[`npc_${npc.id}`]) return;

    setGeminiLoading(`npc_${npc.id}`, true);
    try {
      // Simple game state summary
      const gameStateSummary = `Current World: ${WORLDS_DATA.find(w=>w.id === state.currentWorldId)?.name}. Gold: ${state.resources.GOLD || 0}. Mana: ${state.resources.MANA || 0}. Fragments: ${state.resources.DATA_FRAGMENTS || 0}.`;
      const dialogue = await fetchNpcDialogue(npc.basePrompt, gameStateSummary);
      dispatch({ type: 'SET_NPC_DIALOGUE', npcId: npc.id, dialogue });
    } catch (error) {
      console.error(`Failed to fetch dialogue for ${npc.name}:`, error);
      dispatch({ type: 'SET_NPC_DIALOGUE', npcId: npc.id, dialogue: "I seem to be having trouble communicating right now. Try again later." });
    } finally {
      setGeminiLoading(`npc_${npc.id}`, false);
    }
  }, [currentNpc, state.apiKeyState, state.currentWorldId, state.resources, isLoadingGemini, setGeminiLoading, dispatch]); // Added dispatch

  const handleOpenNpcModal = useCallback((npcId: string) => {
    const npc = NPCS_DATA.find(n => n.id === npcId);
    if (npc) {
      setCurrentNpc(npc);
      setIsNpcModalOpen(true);
      if (state.apiKeyState === 'ready' && !state.npcDialogues[npcId] && !isLoadingGemini[`npc_${npcId}`]) {
        handleNpcInteract(npc); // Fetch initial dialogue
      }
    }
  }, [state.apiKeyState, state.npcDialogues, isLoadingGemini, handleNpcInteract]);
  
  const closeNpcModal = () => {
    setIsNpcModalOpen(false);
    setCurrentNpc(null);
  };

  // Flavor Text Fetching
  const fetchItemFlavorTextIfNeeded = useCallback(async (itemId: string, itemName: string, itemType: string, itemDescription: string) => {
    if (state.apiKeyState !== 'ready' || state.itemFlavorTexts[itemId] || isLoadingGemini[`item_${itemId}`]) return;
    setGeminiLoading(`item_${itemId}`, true);
    try {
      const text = await fetchItemFlavorText(itemName, itemType, itemDescription);
      dispatch({ type: 'SET_ITEM_FLAVOR_TEXT', itemId, text });
    } catch (error) {
      console.error(`Failed to fetch flavor text for item ${itemName}:`, error);
    } finally {
      setGeminiLoading(`item_${itemId}`, false);
    }
  }, [state.itemFlavorTexts, state.apiKeyState, isLoadingGemini, setGeminiLoading, dispatch]); // Added dispatch

  const fetchPropertyFlavorTextIfNeeded = useCallback(async (propertyId: string, propertyName: string, propertyDescription: string) => {
    if (state.apiKeyState !== 'ready' || state.propertyFlavorTexts[propertyId] || isLoadingGemini[`prop_${propertyId}`]) return;
    setGeminiLoading(`prop_${propertyId}`, true);
    try {
      const text = await fetchPropertyFlavorText(propertyName, propertyDescription);
      dispatch({ type: 'SET_PROPERTY_FLAVOR_TEXT', propertyId, text });
    } catch (error) {
      console.error(`Failed to fetch flavor text for property ${propertyName}:`, error);
    } finally {
      setGeminiLoading(`prop_${propertyId}`, false);
    }
  }, [state.propertyFlavorTexts, state.apiKeyState, isLoadingGemini, setGeminiLoading, dispatch]); // Added dispatch


  if (state.apiKeyState === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-space-dark p-4">
        <Card title="Initializing Connection" titleIcon={<i className="fas fa-satellite-dish animate-pulse text-star-yellow"></i>}>
          <p className="text-slate-300">Attempting to establish a link with the Gemini Oracle...</p>
          <div className="mt-4 h-2 bg-space-mid rounded-full overflow-hidden">
            <div className="h-full bg-nebula-purple animate-pulse-fast" style={{width: '50%'}}></div> {/* Simple progress bar like effect */}
          </div>
        </Card>
      </div>
    );
  }
  
  if (state.apiKeyState === 'error') {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-space-dark p-4 text-center">
        <Card title="Connection Error" titleIcon={<i className="fas fa-exclamation-triangle text-danger-red"></i>} className="border-danger-red border-2">
          <p className="text-slate-200 mb-2">
            Failed to initialize the connection to the Gemini Oracle.
          </p>
          <p className="text-slate-400 text-sm mb-4">
            Please ensure the <code>{API_KEY_ENV_VAR}</code> environment variable is correctly set and you have a valid API key.
            The game's dynamic content (NPC dialogues, descriptions) will be unavailable.
          </p>
           <p className="text-slate-400 text-sm mb-4">
            You can still play with core mechanics, but for the full experience, the API key is required.
          </p>
          <Button onClick={() => window.location.reload()} variant="primary" icon={<i className="fas fa-sync-alt"></i>}>
            Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${currentWorld.backgroundColor} ${currentWorld.textColor} transition-colors duration-500 pt-[80px] pb-4 px-2 md:px-4`}>
      <ResourceDisplay resources={state.resources} />
      
      <main className="container mx-auto mt-8 flex-grow">
        <WorldView 
            currentWorld={currentWorld} 
            playerState={state} 
            dispatch={dispatch} 
            onOpenNpcModal={handleOpenNpcModal}
            isLoadingDescription={!!isLoadingGemini[`world_${currentWorld.id}`]}
        />

        <div className="mt-6">
          <PanelTabs activeView={activePanel} onSetView={setActivePanel} currentWorldColor={currentWorld.buttonClass}/>
          {activePanel === 'properties' && (
            <PropertiesPanel 
                currentWorldId={state.currentWorldId} 
                playerState={state} 
                dispatch={dispatch} 
                fetchFlavorText={fetchPropertyFlavorTextIfNeeded}
                isLoadingFlavorText={(propId) => !!isLoadingGemini[`prop_${propId}`]}
            />
          )}
          {activePanel === 'upgrades' && (
            <UpgradesPanel currentWorldId={state.currentWorldId} playerState={state} dispatch={dispatch} />
          )}
          {activePanel === 'store' && (
            <StorePanel 
                currentWorldId={state.currentWorldId} 
                playerState={state} 
                dispatch={dispatch} 
                fetchFlavorText={fetchItemFlavorTextIfNeeded}
                isLoadingFlavorText={(itemId) => !!isLoadingGemini[`item_${itemId}`]}
            />
          )}
          {activePanel === 'worlds' && (
            <WorldsPanel 
                playerState={state} 
                dispatch={dispatch}
                fetchWorldDescriptionIfNeeded={fetchWorldDescriptionIfNeeded}
            />
          )}
        </div>
      </main>

      <NpcModal
        isOpen={isNpcModalOpen}
        onClose={closeNpcModal}
        npc={currentNpc}
        dialogue={currentNpc ? state.npcDialogues[currentNpc.id] : null}
        onInteract={() => handleNpcInteract()}
        isLoadingDialogue={currentNpc ? !!isLoadingGemini[`npc_${currentNpc.id}`] : false}
      />
      
      <footer className="text-center py-4 mt-auto">
        <p className="text-xs text-slate-500">Cosmic Clicker Conquest &copy; 2024. All rights reserved (not really).</p>
         <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                window.location.reload();
            }}
            className="mt-2"
            aria-label="Reset Game Data"
        >
            <i className="fas fa-trash-alt mr-1"></i> Reset Game
        </Button>
      </footer>
    </div>
  );
};

export default App;
