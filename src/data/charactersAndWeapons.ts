import { AnimeCharacter, WeaponDef, WeaponType, MapTheme } from '../types/game';

export const CHARACTERS: AnimeCharacter[] = [
  {
    id: 'aoi',
    name: 'Aoi Tachibana',
    title: 'Sky Gale Ace',
    hairColor: '#00F0FF',
    hairStyle: 'twin_drills',
    eyeColor: '#38BDF8',
    outfitColor: '#0F172A',
    accentColor: '#38BDF8',
    scarfColor: '#06B6D4',
    bio: 'A high-spirited aerial pilot from Neo-Shibuya who modified her twin booster thrusters for supersonic 360-degree dogfights.',
    voiceQuote: 'Iku zo! The skies belong to me!',
    role: 'Speedster',
    stats: { speed: 92, jetpack: 95, health: 80, reload: 85 },
    ultimate: {
      name: 'Sky Gale Overdrive',
      description: 'Supercharges jetpack with unlimited fuel and fires a homing micro-missile typhoon for 5s.',
      icon: 'Wind',
      color: '#00F0FF'
    }
  },
  {
    id: 'ren',
    name: 'Ren Kurogane',
    title: 'Phantom Rail',
    hairColor: '#E2E8F0',
    hairStyle: 'spiky_cold',
    eyeColor: '#EF4444',
    outfitColor: '#1E293B',
    accentColor: '#94A3B8',
    scarfColor: '#DC2626',
    bio: 'Silent mercenary who operates with mathematical precision. His customized particle railgun pierces clean through heavy titanium.',
    voiceQuote: 'Target locked. One breath, one kill.',
    role: 'Sniper',
    stats: { speed: 78, jetpack: 80, health: 85, reload: 90 },
    ultimate: {
      name: 'Phantom Laser Barrage',
      description: 'Deploys an orbital piercing beam across the entire screen, disintegrating all enemies in line of sight.',
      icon: 'Crosshair',
      color: '#EF4444'
    }
  },
  {
    id: 'ryuko',
    name: 'Ryuko Blaze',
    title: 'Crimson Vanguard',
    hairColor: '#FF2E55',
    hairStyle: 'wild_crimson',
    eyeColor: '#F59E0B',
    outfitColor: '#450A0A',
    accentColor: '#F43F5E',
    scarfColor: '#FBBF24',
    bio: 'Hot-headed frontline brawler who thrives in the heat of combat with custom thermal-boosted rocket launchers.',
    voiceQuote: 'Burn it all down! Let\'s go full throttle!',
    role: 'Brawler',
    stats: { speed: 82, jetpack: 84, health: 95, reload: 75 },
    ultimate: {
      name: 'Meteor Strike',
      description: 'Dives down creating a colossal anime shockwave blast that deals massive 360° explosion damage.',
      icon: 'Flame',
      color: '#FF2E55'
    }
  },
  {
    id: 'hayate',
    name: 'Hayate Kage',
    title: 'Midnight Shinobi',
    hairColor: '#8B5CF6',
    hairStyle: 'ninja_ponytail',
    eyeColor: '#A855F7',
    outfitColor: '#18181B',
    accentColor: '#C084FC',
    scarfColor: '#9333EA',
    bio: 'Infiltration specialist wielding plasma shurikens and ultra-compact SMGs with lightning quick dash maneuvers.',
    voiceQuote: 'You cannot shoot what you cannot see.',
    role: 'Scout',
    stats: { speed: 96, jetpack: 90, health: 75, reload: 88 },
    ultimate: {
      name: 'Shadow Clone Blitz',
      description: 'Generates 2 invulnerable holographic clones that mirror all movements and gunfire for 6s.',
      icon: 'Zap',
      color: '#A855F7'
    }
  },
  {
    id: 'lumiere',
    name: 'Lumière Vane',
    title: 'Cyber Angel',
    hairColor: '#10B981',
    hairStyle: 'cyber_bob',
    eyeColor: '#34D399',
    outfitColor: '#064E3B',
    accentColor: '#6EE7B7',
    scarfColor: '#10B981',
    bio: 'Combat medic armed with nanite shields and hard-light barrier generators that keep teammates invincible under fire.',
    voiceQuote: 'Nanite field active! Nobody dies today!',
    role: 'Support',
    stats: { speed: 80, jetpack: 86, health: 90, reload: 92 },
    ultimate: {
      name: 'Aegis Sanctuary',
      description: 'Summons an invulnerable hexagonal energy dome that rapidly regenerates health and shields.',
      icon: 'Shield',
      color: '#10B981'
    }
  },
  {
    id: 'viper',
    name: 'Viper Thorne',
    title: 'Steel Hydra',
    hairColor: '#84CC16',
    hairStyle: 'mech_dreads',
    eyeColor: '#EAB308',
    outfitColor: '#14532D',
    accentColor: '#A3E635',
    scarfColor: '#65A30D',
    bio: 'Augmented cyber-commando clad in reactive armor plates, carrying an intimidating six-barrel rotary minigun.',
    voiceQuote: 'Heavy artillery coming through! Eat lead!',
    role: 'Heavy',
    stats: { speed: 70, jetpack: 75, health: 100, reload: 70 },
    ultimate: {
      name: 'Gatling Superstorm',
      description: 'Spins up dual miniguns with 300% fire rate and zero recoil, showering explosive rounds.',
      icon: 'Disc',
      color: '#84CC16'
    }
  },
  {
    id: 'yukino',
    name: 'Yukino Frost',
    title: 'Glacier Empress',
    hairColor: '#67E8F9',
    hairStyle: 'glacier_long',
    eyeColor: '#BAE6FD',
    outfitColor: '#082F49',
    accentColor: '#7DD3FC',
    scarfColor: '#38BDF8',
    bio: 'Quiet prodigy from northern research bases wielding cryogenic beam weaponry that freezes target trajectory.',
    voiceQuote: 'Absolute zero is the calm before victory.',
    role: 'Cryo',
    stats: { speed: 82, jetpack: 85, health: 85, reload: 82 },
    ultimate: {
      name: 'Blizzard Freeze',
      description: 'Casts a room-wide frost vortex that slows all enemy projectiles and freezes nearby foes.',
      icon: 'Snowflake',
      color: '#67E8F9'
    }
  },
  {
    id: 'katsu',
    name: 'Katsu Spark',
    title: 'Plasma Buster',
    hairColor: '#F59E0B',
    hairStyle: 'flame_short',
    eyeColor: '#FBBF24',
    outfitColor: '#78350F',
    accentColor: '#FDE047',
    scarfColor: '#D97706',
    bio: 'Eccentric demolitions expert whose grenades and cluster mines turn any battlefield into a festive fireworks show.',
    voiceQuote: 'BOOM! Did you see that sparkle?! Beautiful!',
    role: 'Demolitionist',
    stats: { speed: 84, jetpack: 88, health: 88, reload: 80 },
    ultimate: {
      name: 'Supernova Cluster',
      description: 'Launches a massive plasma bomb that fractures into 12 bouncing mini-firework grenades.',
      icon: 'Sparkles',
      color: '#F59E0B'
    }
  }
];

export const WEAPONS: Record<WeaponType, WeaponDef> = {
  pistol: {
    type: 'pistol',
    name: 'Pulse Blaster',
    japaneseName: 'パルス・ブラスター',
    damage: 18,
    fireRate: 4.5,
    clipSize: 15,
    reloadTime: 1.1,
    spread: 0.04,
    bulletSpeed: 750,
    bulletColor: '#38BDF8',
    recoil: 3,
    isAutomatic: false,
    barrelLength: 22,
    description: 'High precision sidearm with zero kickback and fast reload.'
  },
  smg: {
    type: 'smg',
    name: 'Viper SMG',
    japaneseName: 'ヴァイパー・機関短銃',
    damage: 14,
    fireRate: 11,
    clipSize: 32,
    reloadTime: 1.4,
    spread: 0.12,
    bulletSpeed: 820,
    bulletColor: '#A855F7',
    recoil: 4,
    isAutomatic: true,
    barrelLength: 26,
    description: 'Rapid-fire anime submachine gun ideal for aggressive close-quarters jetpack strafing.'
  },
  rifle: {
    type: 'rifle',
    name: 'Photon Carbine',
    japaneseName: 'フォトン・カービン',
    damage: 24,
    fireRate: 7.2,
    clipSize: 28,
    reloadTime: 1.6,
    spread: 0.06,
    bulletSpeed: 900,
    bulletColor: '#00F0FF',
    recoil: 5,
    isAutomatic: true,
    barrelLength: 34,
    description: 'Standard issue high-velocity energy rifle with supreme stability.'
  },
  shotgun: {
    type: 'shotgun',
    name: 'Scatter Buster',
    japaneseName: '散弾・スキャッター',
    damage: 11, // per pellet (x7 pellets)
    fireRate: 1.6,
    clipSize: 8,
    reloadTime: 2.1,
    spread: 0.22,
    bulletSpeed: 700,
    bulletColor: '#F59E0B',
    recoil: 14,
    burstCount: 7,
    isAutomatic: false,
    barrelLength: 30,
    description: 'Devastating close-range blast that sends enemies flying with tremendous knockback.'
  },
  sniper: {
    type: 'sniper',
    name: 'Rail Lance',
    japaneseName: 'レール・ランス',
    damage: 85,
    fireRate: 0.9,
    clipSize: 5,
    reloadTime: 2.4,
    spread: 0.01,
    bulletSpeed: 1400,
    bulletColor: '#EF4444',
    recoil: 18,
    isAutomatic: false,
    barrelLength: 42,
    description: 'Ultra-long range anti-materiel railgun capable of one-shot headshot eliminations.'
  },
  rocket: {
    type: 'rocket',
    name: 'Nova Launcher',
    japaneseName: 'ノヴァ・ランチャー',
    damage: 95,
    fireRate: 1.1,
    clipSize: 4,
    reloadTime: 2.8,
    spread: 0.03,
    bulletSpeed: 520,
    bulletColor: '#F97316',
    recoil: 20,
    isAutomatic: false,
    barrelLength: 36,
    description: 'Fires propelled micro-rockets that explode on impact with massive splash radius.'
  },
  flamethrower: {
    type: 'flamethrower',
    name: 'Hellfire Igniter',
    japaneseName: '地獄火・イグナイター',
    damage: 7, // ticks fast
    fireRate: 22,
    clipSize: 60,
    reloadTime: 2.2,
    spread: 0.18,
    bulletSpeed: 420,
    bulletColor: '#FF2E55',
    recoil: 2,
    isAutomatic: true,
    barrelLength: 32,
    description: 'Shoots a cone of continuous plasma fire that pierces through shields and ignites targets.'
  },
  minigun: {
    type: 'minigun',
    name: 'Apex Rotary Gun',
    japaneseName: 'エーペックス・ガトリング',
    damage: 16,
    fireRate: 16,
    clipSize: 80,
    reloadTime: 3.4,
    spread: 0.14,
    bulletSpeed: 880,
    bulletColor: '#84CC16',
    recoil: 7,
    isAutomatic: true,
    barrelLength: 38,
    description: 'Heavy rotary cannon with relentless suppressive fire and sheer stopping power.'
  }
};

export const MAP_THEMES: Record<string, MapTheme> = {
  tokyo: {
    id: 'tokyo',
    name: 'Neo Tokyo Rooftops',
    subtitle: 'Cyberpunk Skyline & Neon Billboards',
    skyGradient: ['#090D16', '#111827', '#1E1B4B'],
    bgElements: ['billboard', 'skyscraper', 'holo_sign', 'antenna'],
    ambientParticle: 'speedlines',
    platformColor: '#1E293B',
    platformBorder: '#00F0FF',
    hazardColor: '#EF4444'
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura Shrine Summit',
    subtitle: 'Floating Torii Gates & Falling Cherry Blossoms',
    skyGradient: ['#3B0764', '#581C87', '#9D174D'],
    bgElements: ['torii_gate', 'floating_island', 'pagoda', 'sunset_mount_fuji'],
    ambientParticle: 'sakura',
    platformColor: '#2D1B36',
    platformBorder: '#F43F5E',
    hazardColor: '#E11D48'
  },
  sky_isles: {
    id: 'sky_isles',
    name: 'Floating Sky Islands',
    subtitle: 'Jade Cliffs & High Altitude Wind Currents',
    skyGradient: ['#0284C7', '#38BDF8', '#BAE6FD'],
    bgElements: ['floating_crags', 'sky_waterfall', 'clouds', 'wind_turbine'],
    ambientParticle: 'stars',
    platformColor: '#134E4A',
    platformBorder: '#2DD4BF',
    hazardColor: '#F59E0B'
  },
  snow_temple: {
    id: 'snow_temple',
    name: 'Snowy Mountain Temple',
    subtitle: 'Ancient Pagodas in Blinding Frost',
    skyGradient: ['#0C4A6E', '#075985', '#164E63'],
    bgElements: ['frozen_pine', 'snowy_pagoda', 'ice_cliff', 'hanging_lantern'],
    ambientParticle: 'snow',
    platformColor: '#1E293B',
    platformBorder: '#38BDF8',
    hazardColor: '#0284C7'
  },
  space_station: {
    id: 'space_station',
    name: 'Cyber Orbital Station',
    subtitle: 'Zero-G Docking Bay Over Earth Horizon',
    skyGradient: ['#030712', '#080E24', '#0F172A'],
    bgElements: ['earth_curvature', 'solar_panel', 'laser_grid', 'nebula'],
    ambientParticle: 'stars',
    platformColor: '#0F172A',
    platformBorder: '#A855F7',
    hazardColor: '#8B5CF6'
  }
};
