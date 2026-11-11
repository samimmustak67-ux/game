import { PlayerState, CharacterId, WeaponType } from '../../types/game';

export interface ClientInputPacket {
  type: 'input';
  seq: number;
  moveX: number;
  isJetpacking: boolean;
  aimAngle: number;
  isFiring: boolean;
  activeWeaponIndex: number;
  timestamp: number;
}

export interface ServerStatePacket {
  type: 'world_state';
  ackSeq: number;
  timestamp: number;
  players: Array<{
    id: string;
    name: string;
    characterId: CharacterId;
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
  }>;
}

export class MultiplayerClient {
  private ws: WebSocket | null = null;
  public isConnected: boolean = false;
  public roomCode: string | null = null;
  public pingMs: number = 24;
  private inputSequence: number = 0;
  private pendingInputs: ClientInputPacket[] = [];
  private lastPingSend: number = 0;

  public onWorldState: ((state: ServerStatePacket) => void) | null = null;
  public onChatMessage: ((msg: { sender: string; text: string; charId: CharacterId }) => void) | null = null;
  public onRoomJoined: ((code: string, players: number) => void) | null = null;
  public onError: ((err: string) => void) | null = null;

  // Connect to WebSocket Server (defaults to current host)
  public connect(serverUrl?: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const defaultUrl = `${protocol}//${window.location.host}/ws`;
        const targetUrl = serverUrl || defaultUrl;

        this.ws = new WebSocket(targetUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.startPingHeartbeat();
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.roomCode = null;
        };

        this.ws.onerror = (e) => {
          this.isConnected = false;
          resolve(false);
        };
      } catch (err) {
        this.isConnected = false;
        resolve(false);
      }
    });
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.roomCode = null;
  }

  // Create room with custom or random 6-digit code
  public createRoom(characterId: CharacterId, nickname: string, mode: 'dm' | 'tdm' | 'ctf' = 'dm') {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.send({
      type: 'create_room',
      characterId,
      nickname,
      mode
    });
  }

  // Join room by 6-digit code
  public joinRoom(roomCode: string, characterId: CharacterId, nickname: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.send({
      type: 'join_room',
      roomCode,
      characterId,
      nickname
    });
  }

  // Quick Match matchmaking
  public quickMatch(characterId: CharacterId, nickname: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.send({
      type: 'quick_match',
      characterId,
      nickname
    });
  }

  // Send client input for authoritative tick processing
  public sendInput(moveX: number, isJetpacking: boolean, aimAngle: number, isFiring: boolean, activeWeaponIndex: number) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.inputSequence++;
    const packet: ClientInputPacket = {
      type: 'input',
      seq: this.inputSequence,
      moveX,
      isJetpacking,
      aimAngle,
      isFiring,
      activeWeaponIndex,
      timestamp: Date.now()
    };

    this.pendingInputs.push(packet);
    // Keep last 60 unacknowledged inputs for reconciliation
    if (this.pendingInputs.length > 60) this.pendingInputs.shift();

    this.send(packet);
  }

  // Send preset quick-chat
  public sendQuickChat(presetText: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.send({
      type: 'quick_chat',
      text: presetText
    });
  }

  private send(data: object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(dataStr: string) {
    try {
      const msg = JSON.parse(dataStr);

      if (msg.type === 'world_state') {
        // Server reconciliation: drop acknowledged inputs
        if (msg.ackSeq) {
          this.pendingInputs = this.pendingInputs.filter(inp => inp.seq > msg.ackSeq);
        }
        if (this.onWorldState) this.onWorldState(msg);
      } else if (msg.type === 'pong') {
        this.pingMs = Math.round(Date.now() - this.lastPingSend);
      } else if (msg.type === 'room_joined') {
        this.roomCode = msg.roomCode;
        if (this.onRoomJoined) this.onRoomJoined(msg.roomCode, msg.playerCount);
      } else if (msg.type === 'quick_chat_broadcast') {
        if (this.onChatMessage) this.onChatMessage(msg);
      } else if (msg.type === 'error') {
        if (this.onError) this.onError(msg.message);
      }
    } catch (e) {
      // Ignore malformed packets
    }
  }

  private startPingHeartbeat() {
    window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.lastPingSend = Date.now();
        this.send({ type: 'ping' });
      }
    }, 2000);
  }
}

export const multiplayerClient = new MultiplayerClient();
