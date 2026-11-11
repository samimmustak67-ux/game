import React, { useState, useEffect } from 'react';
import { multiplayerClient } from '../game/net/multiplayerClient';
import { CharacterId } from '../types/game';
import { CHARACTERS } from '../data/charactersAndWeapons';
import { 
  X, 
  Wifi, 
  WifiOff, 
  Users, 
  Play, 
  Plus, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface LobbyModalProps {
  onClose: () => void;
  onStartMultiplayerMatch: (roomCode: string) => void;
  selectedChar: CharacterId;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  onClose,
  onStartMultiplayerMatch,
  selectedChar
}) => {
  const [nickname, setNickname] = useState('Cadet_Ace');
  const [joinCode, setJoinCode] = useState('');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [statusMsg, setStatusMsg] = useState<string>('Connecting to WebSocket server...');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'dm' | 'tdm' | 'ctf'>('dm');
  const [customServerUrl, setCustomServerUrl] = useState('');
  const [showCustomServer, setShowCustomServer] = useState(false);

  useEffect(() => {
    // Attempt connection
    multiplayerClient.connect(customServerUrl || undefined).then((success) => {
      if (success) {
        setStatusMsg('Connected to authoritative 30 tick/s game server.');
      } else {
        setStatusMsg('Local server ready. You can test multiplayer or offline bots.');
      }
    });

    multiplayerClient.onRoomJoined = (code, count) => {
      setActiveRoomCode(code);
      setPlayerCount(count);
      setStatusMsg(`Joined room #${code} (${count}/8 players).`);
    };

    multiplayerClient.onError = (err) => {
      setStatusMsg(`Server error: ${err}`);
    };

    return () => {
      multiplayerClient.onRoomJoined = null;
      multiplayerClient.onError = null;
    };
  }, [customServerUrl]);

  const handleCreateRoom = () => {
    multiplayerClient.createRoom(selectedChar, nickname, mode);
  };

  const handleJoinRoom = () => {
    if (!joinCode || joinCode.length < 4) {
      setStatusMsg('Please enter a valid 6-digit room code.');
      return;
    }
    multiplayerClient.joinRoom(joinCode, selectedChar, nickname);
  };

  const handleQuickMatch = () => {
    multiplayerClient.quickMatch(selectedChar, nickname);
  };

  const handleCopyCode = () => {
    if (activeRoomCode) {
      navigator.clipboard.writeText(activeRoomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-pink-500/40 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative anime-box-glow-pink flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-mono tracking-wide">
                MULTIPLAYER LOBBY
              </h3>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                {multiplayerClient.isConnected ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <Wifi className="w-3.5 h-3.5" /> ONLINE ({multiplayerClient.pingMs}ms)
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1 font-mono">
                    <WifiOff className="w-3.5 h-3.5" /> CONNECTING / LOCAL READY
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Profile Bar */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-bold text-cyan-300 pop-font">
            {nickname.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-slate-500 font-mono">NICKNAME (GUEST LOGIN)</div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={16}
              className="bg-transparent text-sm font-bold text-white outline-none w-full"
            />
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Char: {selectedChar.toUpperCase()}
          </span>
        </div>

        {/* Action Tabs / Matchmaking */}
        {!activeRoomCode ? (
          <div className="space-y-4">
            
            {/* Quick Matchmaking */}
            <div className="bg-gradient-to-r from-pink-950/40 to-slate-900 border border-pink-500/30 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Quick Matchmaking</h4>
                <p className="text-xs text-slate-400">Instantly match with players in available public rooms.</p>
              </div>
              <button
                onClick={handleQuickMatch}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Find Match
              </button>
            </div>

            {/* Create Room or Join by 6-digit Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Create Room */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-cyan-400" /> Create Private Room
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Generates a unique 6-digit code for friends.</p>
                </div>

                <div className="flex gap-1.5 pt-2">
                  {(['dm', 'tdm', 'ctf'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-1 rounded text-[10px] font-mono uppercase font-bold border ${
                        mode === m ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCreateRoom}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl text-xs border border-cyan-500/30"
                >
                  Create Room
                </button>
              </div>

              {/* Join by Code */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" /> Join with Code
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Enter your friend&apos;s 6-digit room code.</p>
                </div>

                <input
                  type="text"
                  placeholder="e.g. 582910"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="bg-slate-900 border border-slate-700 text-center text-lg font-mono tracking-widest text-white rounded-xl py-1 outline-none focus:border-amber-400"
                />

                <button
                  onClick={handleJoinRoom}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs border border-amber-500/30"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE ROOM VIEW */
          <div className="bg-slate-950 p-5 rounded-2xl border-2 border-cyan-400/50 flex flex-col items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400 font-mono">YOUR 6-DIGIT ROOM CODE</div>
              <div className="flex items-center gap-3 justify-center mt-1">
                <span className="text-4xl font-black text-cyan-300 font-mono tracking-widest">
                  #{activeRoomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl bg-slate-800 text-cyan-400 hover:text-white"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="w-full bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">PLAYERS IN ROOM:</span>
              <span className="text-emerald-400 font-bold">{playerCount} / 8 PLAYERS</span>
            </div>

            <button
              onClick={() => onStartMultiplayerMatch(activeRoomCode)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Multiplayer Combat
            </button>
          </div>
        )}

        {/* Status bar */}
        <div className="text-[11px] font-mono text-slate-400 text-center bg-slate-950 py-2 rounded-xl border border-slate-800">
          {statusMsg}
        </div>

        {/* Custom Server Toggle for deployment */}
        <div className="text-center">
          <button
            onClick={() => setShowCustomServer(!showCustomServer)}
            className="text-[11px] text-slate-500 hover:text-slate-300 font-mono underline"
          >
            {showCustomServer ? 'Hide Custom Server Config' : 'Configure Custom Remote Server URL'}
          </button>
          {showCustomServer && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="wss://your-server.onrender.com/ws"
                value={customServerUrl}
                onChange={(e) => setCustomServerUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 text-xs px-3 py-1.5 rounded-xl text-slate-200 font-mono outline-none"
              />
              <button
                onClick={() => multiplayerClient.connect(customServerUrl)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-xl"
              >
                Reconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
