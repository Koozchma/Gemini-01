
import React from 'react';
import { StoreItem, PlayerState, GameAction, ResourceType } from '../types';
import { ITEMS_DATA, RESOURCE_ICONS, RESOURCE_COLORS, WORLDS_DATA } from '../constants';
import { Button } from './shared/Button';
import { Card } from './shared/Card';

interface StorePanelProps {
  currentWorldId: string;
  playerState: PlayerState;
  dispatch: React.Dispatch<GameAction>;
  fetchFlavorText: (itemId: string, name: string, type: string, description: string) => void;
  isLoadingFlavorText: (itemId: string) => boolean;
}

const canAffordItem = (playerResources: PlayerState['resources'], cost: StoreItem['cost']): boolean => {
  return Object.entries(cost).every(([resource, amount]) => 
    playerResources[resource as ResourceType]! >= amount!
  );
};

export const StorePanel: React.FC<StorePanelProps> = ({ currentWorldId, playerState, dispatch, fetchFlavorText, isLoadingFlavorText }) => {
  const currentWorldData = WORLDS_DATA.find(w => w.id === currentWorldId);
  const availableItemIds = currentWorldData?.availableItemIds || [];
  
  const availableItems = ITEMS_DATA.filter(item => 
    availableItemIds.includes(item.id) && !playerState.inventory.has(item.id)
  );

  const handleBuyItem = (item: StoreItem) => {
    if (canAffordItem(playerState.resources, item.cost)) {
      dispatch({ type: 'BUY_ITEM', item });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-space-dark rounded-b-lg">
      {availableItems.map((item) => {
        const isAffordable = canAffordItem(playerState.resources, item.cost);
        const flavorText = playerState.itemFlavorTexts[item.id];

        if (!flavorText && !isLoadingFlavorText(item.id)) {
            fetchFlavorText(item.id, item.name, item.type, item.description);
        }

        return (
          <Card key={item.id} className="flex flex-col justify-between border border-space-light hover:shadow-purple-500/30 hover:border-purple-500/50 transition-all">
            <div>
              <h4 className="text-lg font-display text-purple-400 flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>{item.name}
              </h4>
              <p className="text-xs uppercase text-purple-300 tracking-wider">{item.type}</p>
              <p className="text-sm text-slate-300 my-1">{item.description}</p>
              {isLoadingFlavorText(item.id) && !flavorText && <p className="text-xs text-slate-400 italic mt-1">Acquiring schematics...</p>}
              {flavorText && <p className="text-xs text-slate-400 italic mt-1">{flavorText}</p>}
              {item.effects && <p className="text-sm text-success-green font-semibold mt-1">{item.effects}</p>}
              <div className="text-xs text-slate-400 mt-1">
                Cost: {Object.entries(item.cost).map(([res, amt]) => 
                  <span key={res} className={`mr-2 ${RESOURCE_COLORS[res as ResourceType]}`}>
                    {RESOURCE_ICONS[res as ResourceType]} {amt}
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={() => handleBuyItem(item)}
              disabled={!isAffordable}
              className="mt-3 w-full bg-purple-500 hover:bg-purple-600"
            >
              {isAffordable ? 'Acquire' : 'Insufficient Funds'}
            </Button>
          </Card>
        );
      })}
      {availableItems.length === 0 && <p className="text-slate-400 col-span-full text-center">No items available in this sector's market.</p>}
    </div>
  );
};
