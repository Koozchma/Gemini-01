
import React from 'react';
import { NPC } from '../types';
import { Modal } from './shared/Modal';
import { Button } from './shared/Button';

interface NpcModalProps {
  isOpen: boolean;
  onClose: () => void;
  npc: NPC | null;
  dialogue: string | null; // Fetched dialogue
  onInteract: () => void; // Function to trigger new dialogue fetch
  isLoadingDialogue: boolean;
}

export const NpcModal: React.FC<NpcModalProps> = ({ isOpen, onClose, npc, dialogue, onInteract, isLoadingDialogue }) => {
  if (!npc) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Speaking with ${npc.name}`} titleIcon={<span className="text-2xl">{npc.icon}</span>}>
      {isLoadingDialogue && <p className="text-slate-300 italic my-4">Connecting to {npc.name}...</p>}
      {!isLoadingDialogue && dialogue && (
        <p className="text-slate-200 my-4 whitespace-pre-wrap">{dialogue}</p>
      )}
      {!isLoadingDialogue && !dialogue && (
         <p className="text-slate-400 my-4 italic">{npc.name} seems contemplative. Perhaps try interacting?</p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onInteract} disabled={isLoadingDialogue} variant="primary">
          {isLoadingDialogue ? 'Thinking...' : 'Continue Conversation'}
        </Button>
        <Button onClick={onClose} variant="secondary">Close</Button>
      </div>
    </Modal>
  );
};
