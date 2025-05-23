
import React from 'react';
import { Button } from './shared/Button';

export type PanelView = 'properties' | 'upgrades' | 'store' | 'worlds';

interface PanelTabsProps {
  activeView: PanelView;
  onSetView: (view: PanelView) => void;
  currentWorldColor: string;
}

const panelIcons: Record<PanelView, string> = {
    properties: 'fas fa-industry',
    upgrades: 'fas fa-level-up-alt',
    store: 'fas fa-store',
    worlds: 'fas fa-globe-americas',
}

export const PanelTabs: React.FC<PanelTabsProps> = ({ activeView, onSetView, currentWorldColor }) => {
  const views: PanelView[] = ['properties', 'upgrades', 'store', 'worlds'];
  
  return (
    <div className="flex justify-around p-2 bg-space-mid rounded-t-lg sticky top-[70px] z-5">
      {views.map((view) => (
        <Button
          key={view}
          onClick={() => onSetView(view)}
          variant={activeView === view ? 'primary' : 'ghost'}
          size="sm"
          className={`capitalize flex-1 md:flex-none ${activeView === view ? currentWorldColor : ''} ${activeView === view ? 'text-white' : 'text-slate-300'}`}
          icon={<i className={panelIcons[view]}></i>}
        >
          {view}
        </Button>
      ))}
    </div>
  );
};
