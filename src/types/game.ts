export type CharacterId = 
  | 'aoi' 
  | 'ren' 
  | 'ryuko' 
  | 'hayate' 
  | 'lumiere' 
  | 'viper' 
  | 'yukino' 
  | 'katsu';

export interface AnimeCharacter {
  id: CharacterId;
  name: string;
  title: string;
  hairColor: string;
  hairStyle: 'twin_drills' | 'spiky_cold' | 'wild_crimson' | 'ninja_ponytail' | 'cyber_bob' | 'mech_dreads' | 'glacier_long' | 'flame_short';
  eyeColor: string;
  outfitColor: string;
  accentColor: string;
  scarfColor: string;
  bio: string;
  voiceQuote: string;
  role: 'Speedster' | 'Sniper' | 'Brawler' | 'Scout' | 'Support' | 'Heavy' | 'Cryo' | 'Demolitionist';
  stats: {
    speed: number;
    jetpack: number;
    health: number;
    reload: number;
  };
  ultimate: {
    name: string;
    description: string;
    icon: string;
    color: string;
  };
}

export type WeaponType = 
  | 'pistol' 
  | 'smg' 
  | 'rifle' 
  | 'shotgun' 
  | 'sniper' 
  | 'rocket' 
  | 'flamethrower' 
  | 'minigun';

export interface WeaponDef {
  type: WeaponType;
  name: string;
  japaneseName: string;
  damage: number;
  fireRate: number; // shots per sec
  clipSize: number;
  reloadTime: number; // in sec
  spread: number; // radians
  bulletSpeed: number;
  bulletColor: string;
  recoil: number;
  burstCount?: number;
  isAutomatic: boolean;
  barrelLength: number;
  description: string;
}

export interface MapTheme {
  id: 'tokyo' | 'sakura' | 'sky_isles' | 'snow_temple' | 'space_station';
  name: string;
  subtitle: string;
  skyGradient: [string, string, string];
  bgElements: string[];
  ambientParticle: 'sakura' | 'snow' | 'speedlines' | 'embers' | 'stars';
  platformColor: string;
  platformBorder: string;
  hazardColor: string;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Projectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  color: string;
  radius: number;
  lifetime: number; // in sec
  maxLifetime: number;
  isRocket?: boolean;
  isFlame?: boolean;
  isGrenade?: boolean;
  bounce?: number;
}

export interface Pickup {
  id: string;
  x: number;
  y: number;
  type: 'health' | 'shield' | 'ammo' | 'ultimate';
  amount: number;
  radius: number;
  respawnTime: number; // 0 if active
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: 'solid' | 'one_way' | 'bounce';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'sakura' | 'snow' | 'shockwave' | 'flame' | 'star';
  rotation?: number;
  rotSpeed?: number;
}

export interface ComicText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  alpha: number;
  life: number;
}

export interface PlayerState {
  id: string;
  name: string;
  characterId: CharacterId;
  skinIndex: number;
  isBot: boolean;
  team: 'blue' | 'red' | 'free';
  x: number;
  y: number;
  vx: number;
  vy: number;
  aimAngle: number;
  facingLeft: boolean;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  fuel: number;
  maxFuel: number;
  isJetpacking: boolean;
  isGrounded: boolean;
  isCrouching: boolean;
  
  // Weapons
  weapons: [WeaponType, WeaponType];
  activeWeaponIndex: number;
  currentAmmo: [number, number];
  reserveAmmo: [number, number];
  isReloading: boolean;
  reloadProgress: number;
  lastShotTime: number;

  // Ultimate
  ultimateCharge: number; // 0 to 100
  isUltimateActive: boolean;
  ultimateTimer: number;

  // Stats
  kills: number;
  deaths: number;
  score: number;
  killStreak: number;
  
  // Expressions: 'normal' | 'determined' | 'hurt'
  expression: 'normal' | 'determined' | 'hurt';
  hurtTimer: number;

  // Ragdoll/Death
  isDead: boolean;
  respawnTimer: number;
  ragdollRotation: number;
  ragdollAngularVel: number;
}

export interface KillEvent {
  id: string;
  killerName: string;
  killerChar: CharacterId;
  victimName: string;
  victimChar: CharacterId;
  weapon: WeaponType | 'grenade' | 'melee' | 'ultimate';
  isHeadshot?: boolean;
  timestamp: number;
}

export interface QuickChatMessage {
  id: string;
  senderName: string;
  senderChar: CharacterId;
  text: string;
  timestamp: number;
}

export interface GameSettings {
  quality: 'low' | 'medium' | 'high';
  joystickSize: number; // 80 to 140
  joystickOpacity: number; // 0.2 to 1.0
  soundVolume: number; // 0 to 1
  musicVolume: number; // 0 to 1
  haptics: boolean;
  screenShake: boolean;
  showMinimap: boolean;
  showDamageNumbers: boolean;
  botDifficulty: 'easy' | 'medium' | 'hard';
}
