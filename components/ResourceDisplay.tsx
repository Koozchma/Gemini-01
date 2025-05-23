
import React from 'react';
import { Resources, ResourceType } from '../types';
import { RESOURCE_ICONS, RESOURCE_COLORS } from '../constants';

interface ResourceDisplayProps {
  resources: Resources;
}

const formatNumber = (num: number): string => {
  if (num < 1000) return num.toFixed(1); // Keep one decimal for small numbers
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
  return (num / 1000000000).toFixed(1) + 'B';
};


export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources }) => {
  return (
    <div className="bg-space-dark p-3 rounded-lg shadow-lg border border-space-light fixed top-0 left-0 right-0 z-10">
      <div className="container mx-auto flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
        {(Object.keys(ResourceType) as Array<keyof typeof ResourceType>).map((key) => {
          const type = ResourceType[key];
          const amount = resources[type] || 0;
          if (amount > 0 || type === ResourceType.GOLD || type === ResourceType.DATA_FRAGMENTS) { // Always show core resources
            return (
              <div key={type} className={`flex items-center p-2 rounded-md bg-space-mid shadow ${RESOURCE_COLORS[type]}`}>
                <span className="text-xl mr-2">{RESOURCE_ICONS[type]}</span>
                <span className="font-semibold text-sm md:text-base">{type}: </span>
                <span className="ml-1 font-bold text-sm md:text-base">{formatNumber(amount)}</span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
