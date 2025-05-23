
import React from 'react';
import { World, PlayerState, GameAction } from '../types';
import { Button } from './shared/Button';
import { Card } from './shared/Card';
import { WORLDS_DATA, RESOURCE_ICONS } from '../constants';

interface WorldViewProps {
  currentWorld: World;
  playerState: PlayerState;
  dispatch: React.Dispatch<GameAction>;
  onOpenNpcModal: (npcId: string) => void;
  isLoadingDescription: boolean;
}

export const WorldView: React.FC<WorldViewProps> = ({
  currentWorld,
  playerState,
  dispatch,
  onOpenNpcModal,
  isLoadingDescription,
}) => {
  const handleGather = () => {
    dispatch({ type: 'CLICK_GATHER', world: currentWorld });
  };
  
  const worldDescription = playerState.worldDescriptions[currentWorld.id] || "Loading description...";

  return (
    <Card 
      className={`min-h-[300px] flex flex-col items-center justify-center text-center ${currentWorld.textColor}`}
      style={{ 
        backgroundImage: currentWorld.backgroundImageUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${currentWorld.backgroundImageUrl})` : '',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: `2px solid ${currentWorld.accentColor.replace('bg-','').replace('-500','')}` // hacky way to get border color
      }}
    >
      <h2 className="text-4xl font-display mb-2" style={{color: currentWorld.accentColor.replace('bg-','').replace('-500','')}}>{currentWorld.name}</h2>
      {isLoadingDescription && !playerState.worldDescriptions[currentWorld.id] ? (
        <p className="text-lg italic">Summoning worldly echoes...</p>
      ) : (
        <p className="text-lg mb-6 italic">{worldDescription}</p>
      )}
      
      <Button onClick={handleGather} className={`${currentWorld.buttonClass} px-8 py-4 text-xl animate-pulse-fast`} icon={RESOURCE_ICONS[currentWorld.clickResource]}>
        Gather {currentWorld.clickResource.toLowerCase().replace('_', ' ')}
      </Button>
      <p className="mt-2 text-sm">
        +{Object.values(currentWorld.baseClickValue)[0]} {currentWorld.clickResource.toLowerCase().replace('_', ' ')} per click
      </p>

      {currentWorld.initialNpcId && (
        <div className="mt-8">
          <Button
            onClick={() => onOpenNpcModal(currentWorld.initialNpcId!)}
            variant="secondary"
            className="border border-space-light"
          >
            Speak to {WORLDS_DATA.find(w => w.id === currentWorld.id)?.initialNpcId?.split('_')[0]} {/* Quick name extract */}
          </Button>
        </div>
      )}
    </Card>
  );
};
