
import React from 'react';
import { Upgrade, PlayerState, GameAction, ResourceType } from '../types';
import { UPGRADES_DATA, RESOURCE_ICONS, RESOURCE_COLORS } from '../constants';
import { Button } from './shared/Button';
import { Card } from './shared/Card';

interface UpgradesPanelProps {
  currentWorldId: string;
  playerState: PlayerState;
  dispatch: React.Dispatch<GameAction>;
}

const canAffordUpgrade = (playerResources: PlayerState['resources'], cost: Upgrade['cost']): boolean => {
  return Object.entries(cost).every(([resource, amount]) => 
    playerResources[resource as ResourceType]! >= amount!
  );
};

export const UpgradesPanel: React.FC<UpgradesPanelProps> = ({ currentWorldId, playerState, dispatch }) => {
  const availableUpgrades = UPGRADES_DATA.filter(u => 
    (u.worldId === currentWorldId || !u.worldId) && // Show global upgrades or current world upgrades
    !playerState.purchasedUpgrades.has(u.id)
  );

  const handleBuyUpgrade = (upgrade: Upgrade) => {
    if (canAffordUpgrade(playerState.resources, upgrade.cost)) {
      dispatch({ type: 'BUY_UPGRADE', upgrade });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-space-dark rounded-b-lg">
      {availableUpgrades.map((upgrade) => {
        const isAffordable = canAffordUpgrade(playerState.resources, upgrade.cost);
        return (
          <Card key={upgrade.id} className="flex flex-col justify-between border border-space-light hover:shadow-star-yellow/30 hover:border-star-yellow/50 transition-all">
            <div>
              <h4 className="text-lg font-display text-star-yellow flex items-center gap-2">
                <span className="text-2xl">{upgrade.icon}</span>{upgrade.name}
              </h4>
              <p className="text-sm text-slate-300 mb-1">{upgrade.description}</p>
              <p className="text-sm text-success-green font-semibold mt-1">{upgrade.effectDescription}</p>
              <div className="text-xs text-slate-400 mt-1">
                Cost: {Object.entries(upgrade.cost).map(([res, amt]) => 
                  <span key={res} className={`mr-2 ${RESOURCE_COLORS[res as ResourceType]}`}>
                    {RESOURCE_ICONS[res as ResourceType]} {amt}
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={() => handleBuyUpgrade(upgrade)}
              disabled={!isAffordable}
              className="mt-3 w-full bg-star-yellow hover:bg-yellow-600 text-space-dark"
            >
              {isAffordable ? 'Research' : 'Insufficient Funds'}
            </Button>
          </Card>
        );
      })}
      {availableUpgrades.length === 0 && <p className="text-slate-400 col-span-full text-center">No new research available.</p>}
    </div>
  );
};
