import React, { useState, useMemo } from 'react';
import { GameEngine } from './game/engine/gameEngine';
import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { LobbyModal } from './components/LobbyModal';
import { LoadoutModal } from './components/LoadoutModal';
import { CodeViewerModal } from './components/CodeViewerModal';
import { SettingsModal } from './components/SettingsModal';
import { CharacterId } from './types/game';
import { multiplayerClient } from './game/net/multiplayerClient';

export default function App() {
  const [view, setView] = useState<'menu' | 'game'>('menu');
  const [selectedChar, setSelectedChar] = useState<CharacterId>('aoi');
  
  // Modals
  const [showLobby, setShowLobby] = useState(false);
  const [showLoadout, setShowLoadout] = useState(false);
  const [showCodeExplorer, setShowCodeExplorer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Singleton game engine instance
  const engine = useMemo(() => new GameEngine(), []);

  // Launch offline battle vs bots
  const handleStartGame = (
    charId: CharacterId,
    mapId: string,
    botCount: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => {
    setSelectedChar(charId);
    engine.initMap(mapId);
    engine.startMatch(charId, 'Commander Ace', botCount, difficulty);
    setView('game');
  };

  // Launch online multiplayer combat
  const handleStartMultiplayerMatch = (roomCode: string) => {
    setShowLobby(false);
    engine.initMap('tokyo');
    // Start local player session linked to server room
    engine.startMatch(selectedChar, 'Commander Ace', 3, 'hard');
    setView('game');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 flex flex-col">
      {view === 'menu' ? (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenMultiplayer={() => setShowLobby(true)}
          onOpenLoadout={() => setShowLoadout(true)}
          onOpenCodeExplorer={() => setShowCodeExplorer(true)}
          onOpenSettings={() => setShowSettings(true)}
          selectedChar={selectedChar}
          onSelectChar={setSelectedChar}
        />
      ) : (
        <GameCanvas
          engine={engine}
          onOpenSettings={() => setShowSettings(true)}
          onOpenLoadout={() => setShowLoadout(true)}
          onExitToMenu={() => setView('menu')}
        />
      )}

      {/* MODALS */}
      {showLobby && (
        <LobbyModal
          onClose={() => setShowLobby(false)}
          onStartMultiplayerMatch={handleStartMultiplayerMatch}
          selectedChar={selectedChar}
        />
      )}

      {showLoadout && (
        <LoadoutModal
          onClose={() => setShowLoadout(false)}
          selectedChar={selectedChar}
          onSelectChar={setSelectedChar}
        />
      )}

      {showCodeExplorer && (
        <CodeViewerModal
          onClose={() => setShowCodeExplorer(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          engine={engine}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
