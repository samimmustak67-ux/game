import { WebSocket, WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';

export interface ServerPlayer {
  id: string;
  ws: WebSocket;
  name: string;
  characterId: string;
  roomCode: string | null;
  team: 'blue' | 'red' | 'free';
  x: number;
  y: number;
  vx: number;
  vy: number;
  aimAngle: number;
  facingLeft: boolean;
  health: number;
  shield: number;
  fuel: number;
  isJetpacking: boolean;
  isGrounded: boolean;
  isDead: boolean;
  kills: number;
  deaths: number;
  score: number;
  currentAmmo: [number, number];
  lastShotTime: number;
  lastInputTime: number;
  lastSeq: number;
}

export interface GameRoom {
  code: string;
  name: string;
  mode: 'dm' | 'tdm' | 'ctf';
  maxPlayers: number;
  players: Map<string, ServerPlayer>;
  mapTheme: string;
  matchTimer: number;
  tickInterval: NodeJS.Timeout | null;
}

export class AuthoritativeGameServer {
  private wss: WebSocketServer | null = null;
  private rooms: Map<string, GameRoom> = new Map();
  private players: Map<string, ServerPlayer> = new Map();
  private leaderboards: Array<{ name: string; score: number; kills: number; char: string }> = [
    { name: 'KageShinobi', score: 24500, kills: 142, char: 'hayate' },
    { name: 'SkyQueenAoi', score: 21800, kills: 128, char: 'aoi' },
    { name: 'RenGhost', score: 19400, kills: 110, char: 'ren' },
    { name: 'BlazeRyuko', score: 17200, kills: 98, char: 'ryuko' },
    { name: 'CyberAngel', score: 15100, kills: 76, char: 'lumiere' }
  ];

  public initialize(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      const playerId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const newPlayer: ServerPlayer = {
        id: playerId,
        ws,
        name: 'Cadet',
        characterId: 'aoi',
        roomCode: null,
        team: 'free',
        x: 400,
        y: 800,
        vx: 0,
        vy: 0,
        aimAngle: 0,
        facingLeft: false,
        health: 100,
        shield: 100,
        fuel: 100,
        isJetpacking: false,
        isGrounded: true,
        isDead: false,
        kills: 0,
        deaths: 0,
        score: 0,
        currentAmmo: [28, 15],
        lastShotTime: 0,
        lastInputTime: Date.now(),
        lastSeq: 0
      };

      this.players.set(playerId, newPlayer);

      ws.on('message', (message: string) => {
        this.handleClientMessage(newPlayer, message);
      });

      ws.on('close', () => {
        this.handleDisconnect(newPlayer);
      });

      // Send initial welcome
      ws.send(JSON.stringify({ type: 'welcome', playerId }));
    });

    console.log('[GameServer] Authoritative 30 tick/s server initialized on /ws');
  }

  private handleClientMessage(player: ServerPlayer, rawData: string) {
    try {
      const msg = JSON.parse(rawData.toString());

      if (msg.type === 'ping') {
        player.ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      if (msg.type === 'create_room') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        player.name = (msg.nickname || 'Cadet').substring(0, 16);
        player.characterId = msg.characterId || 'aoi';
        this.createRoom(code, player, msg.mode || 'dm');
        return;
      }

      if (msg.type === 'join_room') {
        const code = msg.roomCode;
        player.name = (msg.nickname || 'Cadet').substring(0, 16);
        player.characterId = msg.characterId || 'aoi';
        this.joinRoom(code, player);
        return;
      }

      if (msg.type === 'quick_match') {
        player.name = (msg.nickname || 'Cadet').substring(0, 16);
        player.characterId = msg.characterId || 'aoi';
        this.handleQuickMatch(player);
        return;
      }

      if (msg.type === 'input') {
        this.processClientInput(player, msg);
        return;
      }

      if (msg.type === 'quick_chat') {
        if (player.roomCode) {
          const room = this.rooms.get(player.roomCode);
          if (room) {
            this.broadcastToRoom(room, {
              type: 'quick_chat_broadcast',
              sender: player.name,
              charId: player.characterId,
              text: (msg.text || '').substring(0, 40)
            });
          }
        }
      }
    } catch (e) {
      // Discard invalid input
    }
  }

  // Anti-cheat Authoritative Input Processing
  private processClientInput(player: ServerPlayer, input: {
    seq: number;
    moveX: number;
    isJetpacking: boolean;
    aimAngle: number;
    isFiring: boolean;
    activeWeaponIndex: number;
  }) {
    if (player.isDead) return;

    player.lastSeq = input.seq;
    player.lastInputTime = Date.now();
    player.aimAngle = input.aimAngle;
    player.facingLeft = Math.cos(input.aimAngle) < 0;

    // Validate move speed bounds (Anti-speedhack)
    const clampedMove = Math.max(-1, Math.min(1, input.moveX));
    player.vx = clampedMove * 280;

    // Jetpack validation
    if (input.isJetpacking && player.fuel > 0) {
      player.isJetpacking = true;
      player.vy -= 42; // thrust
      player.fuel = Math.max(0, player.fuel - 1.2);
    } else {
      player.isJetpacking = false;
      player.vy += 28; // gravity
      if (player.fuel < 100) player.fuel = Math.min(100, player.fuel + 0.8);
    }

    // Terminal velocity clamping
    player.vx = Math.max(-400, Math.min(400, player.vx));
    player.vy = Math.max(-550, Math.min(650, player.vy));

    // Update position
    player.x += player.vx * (1 / 30);
    player.y += player.vy * (1 / 30);

    // Bounds check
    player.x = Math.max(120, Math.min(2280, player.x));
    player.y = Math.max(100, Math.min(1240, player.y));
  }

  private createRoom(code: string, host: ServerPlayer, mode: 'dm' | 'tdm' | 'ctf') {
    if (host.roomCode) this.leaveCurrentRoom(host);

    const room: GameRoom = {
      code,
      name: `Arena #${code}`,
      mode,
      maxPlayers: 8,
      players: new Map(),
      mapTheme: 'tokyo',
      matchTimer: 300,
      tickInterval: null
    };

    room.players.set(host.id, host);
    host.roomCode = code;
    this.rooms.set(code, room);

    // Start 30 tick/s authoritative loop for this room
    this.startRoomSimulation(room);

    host.ws.send(JSON.stringify({
      type: 'room_joined',
      roomCode: code,
      playerCount: 1
    }));
  }

  private joinRoom(code: string, player: ServerPlayer) {
    const room = this.rooms.get(code);
    if (!room) {
      player.ws.send(JSON.stringify({ type: 'error', message: 'Room not found! Check your 6-digit code.' }));
      return;
    }

    if (room.players.size >= room.maxPlayers) {
      player.ws.send(JSON.stringify({ type: 'error', message: 'Room is already full (8/8 players).' }));
      return;
    }

    if (player.roomCode) this.leaveCurrentRoom(player);

    room.players.set(player.id, player);
    player.roomCode = code;

    player.ws.send(JSON.stringify({
      type: 'room_joined',
      roomCode: code,
      playerCount: room.players.size
    }));
  }

  private handleQuickMatch(player: ServerPlayer) {
    // Find room with space
    for (const room of this.rooms.values()) {
      if (room.players.size < room.maxPlayers) {
        this.joinRoom(room.code, player);
        return;
      }
    }
    // Else create a public room
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.createRoom(code, player, 'dm');
  }

  // 30 Ticks/Sec Authoritative Broadcast Loop
  private startRoomSimulation(room: GameRoom) {
    const tickRateMs = 1000 / 30; // 33.3ms = 30 tick/s

    room.tickInterval = setInterval(() => {
      if (room.players.size === 0) {
        clearInterval(room.tickInterval!);
        this.rooms.delete(room.code);
        return;
      }

      // Compact state packet
      const statePayload = {
        type: 'world_state',
        timestamp: Date.now(),
        players: Array.from(room.players.values()).map(p => ({
          id: p.id,
          name: p.name,
          characterId: p.characterId,
          team: p.team,
          x: Math.round(p.x),
          y: Math.round(p.y),
          vx: Math.round(p.vx),
          vy: Math.round(p.vy),
          aimAngle: Math.round(p.aimAngle * 100) / 100,
          facingLeft: p.facingLeft,
          health: p.health,
          shield: p.shield,
          fuel: Math.round(p.fuel),
          isJetpacking: p.isJetpacking,
          isGrounded: p.isGrounded,
          isDead: p.isDead,
          kills: p.kills,
          deaths: p.deaths,
          score: p.score,
          currentAmmo: p.currentAmmo
        }))
      };

      // Send to each player including their personal sequence ack
      room.players.forEach(p => {
        if (p.ws.readyState === WebSocket.OPEN) {
          p.ws.send(JSON.stringify({
            ...statePayload,
            ackSeq: p.lastSeq
          }));
        }
      });
    }, tickRateMs);
  }

  private leaveCurrentRoom(player: ServerPlayer) {
    if (!player.roomCode) return;
    const room = this.rooms.get(player.roomCode);
    if (room) {
      room.players.delete(player.id);
      if (room.players.size === 0) {
        if (room.tickInterval) clearInterval(room.tickInterval);
        this.rooms.delete(room.code);
      }
    }
    player.roomCode = null;
  }

  private handleDisconnect(player: ServerPlayer) {
    this.leaveCurrentRoom(player);
    this.players.delete(player.id);
  }

  private broadcastToRoom(room: GameRoom, data: object) {
    const jsonStr = JSON.stringify(data);
    room.players.forEach(p => {
      if (p.ws.readyState === WebSocket.OPEN) {
        p.ws.send(jsonStr);
      }
    });
  }

  // Leaderboard getter for REST API
  public getLeaderboard() {
    return this.leaderboards;
  }

  public getActiveRooms() {
    return Array.from(this.rooms.values()).map(r => ({
      code: r.code,
      name: r.name,
      mode: r.mode,
      players: r.players.size,
      maxPlayers: r.maxPlayers
    }));
  }
}

export const gameServer = new AuthoritativeGameServer();
