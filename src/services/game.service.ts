import { Injectable, signal, computed, inject } from '@angular/core';
import { GeminiService } from './gemini.service';
import { AudioService } from './audio.service';
import { AuthService } from './auth.service';
import { SocialUser, SocialService } from './social.service';

export type GameState = 'MENU' | 'SOCIAL' | 'TRANSITION' | 'PREPARE_ROUND' | 'ROUND_1' | 'ROUND_2' | 'ROUND_3' | 'WINNER_REVEAL';
export type Round3Stage = 'WAITING' | 'WRONG_WORD' | 'QUERY' | 'RIDDLE';
export type PlayerStatus = 'ACTIVE' | 'ELIMINATED' | 'SPECTATOR';
export type CardType = 'TASK' | 'PUNISHMENT' | 'LUCK' | 'EMPTY';
export type GameMode = 'INDIVIDUAL' | 'TEAM';
export type GameType = 'DIL_AVCILARI' | 'SPIN_BOTTLE' | 'TRUTH_DARE' | 'WHO_AM_I' | 'WORD_CHAIN' | 'SENTENCE_SCRAMBLE';

export interface GameSettings {
  roomId: string;
  roomName: string;
  targetLanguage: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor' | 'Expert';
  maxPlayers: number;
  isPrivate: boolean;
  isPublished: boolean;
  mode: GameMode;
  backgroundImage: string;
  isChatLocked: boolean;
}

export interface RoomSummary {
  id: string;
  title: string;
  language: string;
  count: number;
  avatars: string[];
  tags: string[];
  isLive: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  status: PlayerStatus;
  team?: 'KING' | 'QUEEN';
  isPatron: boolean; 
  avatarColor: string;
  isMutedByPatron: boolean; 
  lastDelta?: number;
  lastDeltaTime?: number;
  badges: string[];
  isBot: boolean;
  avatar: string;
  gender: 'Erkek' | 'Kadın' | 'Belirtilmemiş';
  hasJoker: boolean;
  hasPlayedInRound: boolean; 
  isSpy?: boolean;
  isOnStage: boolean;
  isHandRaised: boolean;
  isMuted: boolean;
}

export interface GameCard {
  id: number | string;
  type: CardType;
  content: string;
  isRevealed: boolean;
  label: string;
  ariaLabel: string; 
  colorClass?: string; 
  orbType?: 'GOLD' | 'COLOR'; 
  completed?: boolean;
  colorName?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private geminiService = inject(GeminiService);
  private audioService = inject(AudioService);
  private authService = inject(AuthService);
  private socialService = inject(SocialService);

  private readonly ROOMS_DB_KEY = 'dilavcilar_rooms_db_v1';

  publicRooms = signal<RoomSummary[]>([]);
  activeGameType = signal<GameType>('DIL_AVCILARI'); 

  settings = signal<GameSettings>({
    roomId: 'RM-' + Math.floor(Math.random() * 10000),
    roomName: 'DİL AVCILARI',
    targetLanguage: 'İngilizce',
    difficulty: 'Orta',
    maxPlayers: 50, 
    isPrivate: false,
    isPublished: false,
    mode: 'INDIVIDUAL',
    backgroundImage: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1920&auto=format&fit=crop',
    isChatLocked: false
  });

  availableLanguages = [
    'Türkçe', 'İngilizce', 'Kürtçe', 'Arapça', 'İspanyolca', 
    'Almanca', 'Fransızca', 'Çince', 'Rusça', 'İtalyanca', 
    'Japonca', 'Portekizce', 'Farsça', 'Azerice', 'Osmanlıca', 'Korece'
  ];

  gameState = signal<GameState>('MENU'); 
  players = signal<Player[]>([]);
  roomChatMessages = signal<{sender: string, text: string, isPatron: boolean}[]>([]);
  
  // Game specific state
  currentRoundCards = signal<GameCard[]>([]);
  transitionTitle = signal<string>('');
  transitionSubtitle = signal<string>('');
  
  activePlayerId = signal<string | null>(null);
  winnerPlayer = signal<Player | null>(null);

  activePlayer = computed(() => this.players().find(p => p.id === this.activePlayerId()));
  stagePlayers = computed(() => this.players().filter(p => p.isOnStage || p.isPatron));
  audiencePlayers = computed(() => this.players().filter(p => !p.isOnStage && !p.isPatron));
  handRaiseRequests = computed(() => this.players().filter(p => p.isHandRaised && !p.isOnStage));

  constructor() {
    // Auto-load rooms on startup
  }

  createNewRoom(settings: Partial<GameSettings>) {
    // ... (implementation exists)
  }
  
  enterRoom(id: string) {
    // ... (implementation exists)
  }

  // --- Game Switching ---
  switchGameType(type: GameType) {
      this.activeGameType.set(type);
      if (type === 'DIL_AVCILARI') {
          this.gameState.set('PREPARE_ROUND');
      } else {
          // Other games don't use the complex Dil Avcilari state machine
          this.gameState.set('SOCIAL'); // Allows game component to show on top of social room
      }
  }

  startGameLoop() {
    this.gameState.set('PREPARE_ROUND');
    this.runTransition('1. TUR', 'HIZLI & ÖFKELİ', 'ROUND_1');
  }

  // FIX: Added missing runTransition method
  runTransition(title: string, subtitle: string, nextState: GameState, duration: number = 3000) {
    this.transitionTitle.set(title);
    this.transitionSubtitle.set(subtitle);
    this.gameState.set('TRANSITION');
    
    setTimeout(() => {
        this.gameState.set(nextState);
    }, duration);
  }

  // ... other existing game service methods ...
}
