
import React from 'react';
import { Property, PlayerState, GameAction, ResourceType } from '../types';
import { PROPERTIES_DATA, RESOURCE_ICONS, RESOURCE_COLORS } from '../constants';
import { Button } from './shared/Button';
import { Card } from './shared/Card';

interface PropertiesPanelProps {
  currentWorldId: string;
  playerState: PlayerState;
  dispatch: React.Dispatch<GameAction>;
  fetchFlavorText: (propertyId: string, name: string, description: string) => void;
  isLoadingFlavorText: (propertyId: string) => boolean;
}

const canAfford = (playerResources: PlayerState['resources'], cost: Property['cost']): boolean => {
  return Object.entries(cost).every(([resource, amount]) => 
    playerResources[resource as ResourceType]! >= amount!
  );
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ currentWorldId, playerState, dispatch, fetchFlavorText, isLoadingFlavorText }) => {
  const availableProperties = PROPERTIES_DATA.filter(p => p.worldId === currentWorldId);

  const handleBuyProperty = (property: Property) => {
    if (canAfford(playerState.resources, property.cost)) {
      dispatch({ type: 'BUY_PROPERTY', property });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-space-dark rounded-b-lg">
      {availableProperties.map((prop) => {
        const ownedCount = playerState.ownedProperties[prop.id]?.count || 0;
        const isAffordable = canAfford(playerState.resources, prop.cost);
        const flavorText = playerState.propertyFlavorTexts[prop.id];

        if (!flavorText && !isLoadingFlavorText(prop.id)) {
            fetchFlavorText(prop.id, prop.name, prop.description);
        }

        return (
          <Card key={prop.id} className="flex flex-col justify-between border border-space-light hover:shadow-nebula-purple/30 hover:border-nebula-purple/50 transition-all">
            <div>
              <h4 className="text-lg font-display text-nebula-purple flex items-center gap-2">
                <span className="text-2xl">{prop.icon}</span>{prop.name}
              </h4>
              <p className="text-sm text-slate-300 mb-1">{prop.description}</p>
              {isLoadingFlavorText(prop.id) && !flavorText && <p className="text-xs text-slate-400 italic mt-1">Evoking echoes...</p>}
              {flavorText && <p className="text-xs text-slate-400 italic mt-1">{flavorText}</p>}
              <p className="text-sm text-crystal-blue mt-1">
                Produces: {Object.values(prop.baseProduction)[0]} {prop.productionResource.toLowerCase()} / sec
              </p>
              <div className="text-xs text-slate-400 mt-1">
                Cost: {Object.entries(prop.cost).map(([res, amt]) => 
                  <span key={res} className={`mr-2 ${RESOURCE_COLORS[res as ResourceType]}`}>
                    {RESOURCE_ICONS[res as ResourceType]} {amt}
                  </span>
                )}
              </div>
              <p className="text-sm mt-1">Owned: <span className="font-bold text-star-yellow">{ownedCount}</span></p>
            </div>
            <Button
              onClick={() => handleBuyProperty(prop)}
              disabled={!isAffordable}
              className="mt-3 w-full bg-crystal-blue hover:bg-sky-600"
            >
              {isAffordable ? 'Construct' : 'Insufficient Funds'}
            </Button>
          </Card>
        );
      })}
      {availableProperties.length === 0 && <p className="text-slate-400 col-span-full text-center">No properties available in this sector.</p>}
    </div>
  );
};
