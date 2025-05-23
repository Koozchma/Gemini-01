
import React from 'react';
import { World, PlayerState, GameAction, ResourceType } from '../types';
import { WORLDS_DATA, RESOURCE_ICONS, RESOURCE_COLORS } from '../constants';
import { Button } from './shared/Button';
import { Card } from './shared/Card';

interface WorldsPanelProps {
  playerState: PlayerState;
  dispatch: React.Dispatch<GameAction>;
  fetchWorldDescriptionIfNeeded: (worldId: string, worldName: string) => void;
}

const canAffordUnlock = (playerResources: PlayerState['resources'], cost: World['unlockCost']): boolean => {
    if (Object.keys(cost).length === 0) return true; // No cost, always affordable
    return Object.entries(cost).every(([resource, amount]) => 
      playerResources[resource as ResourceType]! >= amount!
    );
};

export const WorldsPanel: React.FC<WorldsPanelProps> = ({ playerState, dispatch, fetchWorldDescriptionIfNeeded }) => {
  const handleUnlockWorld = (world: World) => {
    if (canAffordUnlock(playerState.resources, world.unlockCost)) {
      dispatch({ type: 'UNLOCK_WORLD', world });
      fetchWorldDescriptionIfNeeded(world.id, world.name); // Pre-fetch description on unlock
    }
  };

  const handleChangeWorld = (worldId: string) => {
    dispatch({ type: 'CHANGE_WORLD', worldId });
    const world = WORLDS_DATA.find(w => w.id === worldId);
    if(world) fetchWorldDescriptionIfNeeded(world.id, world.name);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-space-dark rounded-b-lg">
      {WORLDS_DATA.map((world) => {
        const isUnlocked = playerState.unlockedWorlds.has(world.id);
        const isCurrent = playerState.currentWorldId === world.id;
        const isAffordable = canAffordUnlock(playerState.resources, world.unlockCost);
        const description = playerState.worldDescriptions[world.id] || "Undiscovered Sector...";

        return (
          <Card 
            key={world.id} 
            className={`border-2 ${isCurrent ? world.accentColor.replace('bg-','border-') : 'border-space-light'} hover:shadow-lg transition-all`}
            style={{borderColor: isCurrent ? world.accentColor.replace('bg-','').replace('-500','') : ''}} // Ensure correct color string
          >
            <h4 className={`text-xl font-display ${isCurrent ? world.textColor : 'text-slate-100'}`} style={{color: isCurrent ? world.accentColor.replace('bg-','').replace('-500','') : ''}}>{world.name}</h4>
            {isUnlocked && <p className="text-sm text-slate-300 mb-2 italic">{description}</p>}
            {!isUnlocked && (
              <div className="text-xs text-slate-400 my-2">
                Unlock Cost: {Object.entries(world.unlockCost).map(([res, amt]) => 
                  <span key={res} className={`mr-2 ${RESOURCE_COLORS[res as ResourceType]}`}>
                    {RESOURCE_ICONS[res as ResourceType]} {amt}
                  </span>
                )}
                {Object.keys(world.unlockCost).length === 0 && <span>Free</span>}
              </div>
            )}
            {isCurrent ? (
              <p className="text-sm text-success-green font-semibold">Currently Exploring</p>
            ) : isUnlocked ? (
              <Button onClick={() => handleChangeWorld(world.id)} className={`${world.buttonClass} w-full mt-2`}>
                Travel to {world.name}
              </Button>
            ) : (
              <Button
                onClick={() => handleUnlockWorld(world)}
                disabled={!isAffordable}
                className={`w-full mt-2 ${world.buttonClass}`}
              >
                {isAffordable ? `Unlock ${world.name}` : 'Insufficient Funds'}
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
};
