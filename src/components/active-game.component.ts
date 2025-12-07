import { Component, inject, signal, computed, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService, Player, GameType } from '../services/game.service';
import { AuthService } from '../services/auth.service';
import { AudioService } from '../services/audio.service';

// Game Components
import { GameRoundComponent } from './game-round.component';
import { FinalRoundComponent } from './final-round.component';
import { SpinBottleComponent } from './spin-bottle.component';
import { TruthDareComponent } from './truth-dare.component';
import { WhoAmIComponent } from './who-am-i.component';
import { WordChainComponent } from './word-chain.component';
import { SentenceScrambleComponent } from './sentence-scramble.component';


@Component({
  selector: 'app-active-game',
  standalone: true,
  imports: [
      CommonModule, FormsModule, 
      GameRoundComponent, FinalRoundComponent, SpinBottleComponent, 
      TruthDareComponent, WhoAmIComponent, WordChainComponent, SentenceScrambleComponent
  ],
  template: `
    <div class="h-full w-full flex flex-col relative overflow-hidden select-none font-sans bg-slate-950 text-white">
      
      <!-- BACKGROUND -->
      <div class="absolute inset-0 z-0 bg-cover bg-center opacity-30" [style.backgroundImage]="'url(' + gameService.settings().backgroundImage + ')'"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-950"></div>

      <!-- TOP BAR -->
      <div class="relative z-50 h-16 flex items-center justify-between px-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
          <!-- Room Info -->
          <div>
              <h1 class="font-bold text-white">{{ gameService.settings().roomName }}</h1>
              <span class="text-xs text-slate-400">👑 {{ hostUser()?.name }}</span>
          </div>
          <div class="flex items-center gap-2">
              <span class="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                  ● {{ gameService.players().length }} CANLI
              </span>
              <button (click)="showTopMenu = !showTopMenu" class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">⋮</button>
          </div>

          <!-- Top Menu Dropdown -->
          @if(showTopMenu) {
              <div class="absolute right-4 top-16 w-60 bg-[#1A1D29] border border-white/10 rounded-xl shadow-2xl z-[100]">
                  <button (click)="openSettings()" class="w-full text-left px-4 py-3 hover:bg-white/5">⚙️ Oda Ayarları</button>
                  <button (click)="shareRoom()" class="w-full text-left px-4 py-3 hover:bg-white/5">🔗 Odayı Paylaş</button>
                  <button (click)="minimize.emit()" class="w-full text-left px-4 py-3 hover:bg-white/5">_ Ekranı Küçült</button>
                  <button (click)="leaveRoom()" class="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10">✕ Odadan Çık</button>
              </div>
          }
      </div>

      <!-- STAGE -->
      <div class="relative z-40 w-full p-4 flex flex-col items-center">
          <div class="flex items-start justify-center gap-4">
              @for(p of gameService.stagePlayers(); track p.id) {
                 @if(p.id !== me()?.id) { <div (click)="openPlayerMenu(p)" class="flex flex-col items-center"><img [src]="p.avatar" class="w-14 h-14 rounded-full"><span class="text-xs">{{ p.name }}</span></div> }
              }
          </div>
      </div>

      <!-- GAME AREA -->
      <div class="flex-1 relative z-30 flex flex-col items-center justify-center p-4">
        @if(viewMode === 'GAME' && isGameActive()) {
            @switch (gameService.activeGameType()) {
                @case ('DIL_AVCILARI') { <app-game-round /> }
                @case ('SPIN_BOTTLE') { <app-spin-bottle /> }
                @case ('TRUTH_DARE') { <app-truth-dare /> }
                @case ('WHO_AM_I') { <app-who-am-i /> }
                @case ('WORD_CHAIN') { <app-word-chain /> }
                @case ('SENTENCE_SCRAMBLE') { <app-sentence-scramble /> }
            }
        }
      </div>

      <!-- AUDIENCE -->
      @if(gameService.audiencePlayers().length > 0) {
          <div class="relative z-40 bg-slate-950 border-t border-white/5 p-3">
              <span class="text-xs text-slate-500">Seyirciler</span>
              <div class="flex gap-2">
                 @for(p of gameService.audiencePlayers(); track p.id) {
                    @if(p.id !== me()?.id) { <img (click)="openPlayerMenu(p)" [src]="p.avatar" class="w-8 h-8 rounded-full"> }
                 }
              </div>
          </div>
      }

      <!-- BOTTOM CONTROLLER -->
      <div class="relative z-50 h-[70px] bg-[#0F111A] border-t border-white/10 px-4 flex items-center justify-between">
          <button (click)="showChatDrawer = true" class="p-2">💬 Sohbet</button>
          @if(isMePatron()) {
             <button (click)="showGamesDrawer = true" class="p-2">🎮 Oyunlar</button>
          }
           @if(isMePatron() && gameService.handRaiseRequests().length > 0) {
              <button (click)="showRequestsDrawer = true" class="bg-red-500 rounded-full px-3 py-1">✋ {{ gameService.handRaiseRequests().length }}</button>
          }
          <!-- Mic / Hand Raise -->
          @if(me()?.isOnStage || isMePatron()){
             <button (click)="toggleMyMic()" class="w-16 h-16 rounded-full -top-6 relative" [class]="me()?.isMuted ? 'bg-red-500' : 'bg-green-500'">MIC</button>
          } @else {
             <button (click)="toggleHandRaise()" class="w-16 h-16 rounded-full -top-6 relative" [class]="me()?.isHandRaised ? 'bg-yellow-500' : 'bg-slate-700'">✋</button>
          }
      </div>

      <!-- GAMES DRAWER -->
      @if(showGamesDrawer) {
          <div class="absolute inset-0 z-[200] bg-black/60" (click)="showGamesDrawer = false">
              <div class="absolute bottom-0 left-0 right-0 bg-[#1A1D29] rounded-t-3xl p-6">
                  <h3 class="font-bold mb-4">Oyun Seç</h3>
                  <div class="grid gap-4">
                      <button (click)="switchGame('DIL_AVCILARI')">Dil Avcıları</button>
                      <button (click)="switchGame('SPIN_BOTTLE')">Şişe Çevirmece</button>
                      <button (click)="switchGame('TRUTH_DARE')">D mi C mi?</button>
                      <button (click)="switchGame('WHO_AM_I')">Kim Ben?</button>
                      <button (click)="switchGame('WORD_CHAIN')">Kelime Zinciri</button>
                      <button (click)="switchGame('SENTENCE_SCRAMBLE')">Cümle Düzeltme</button>
                  </div>
              </div>
          </div>
      }
      <!-- Other drawers would go here -->
    </div>
  `
})
export class ActiveGameComponent {
  gameService = inject(GameService);
  authService = inject(AuthService);
  audioService = inject(AudioService);
  
  minimize = output<void>();

  showTopMenu = false;
  showGamesDrawer = false;
  showSettingsDrawer = false;
  showChatDrawer = false;
  showRequestsDrawer = false;
  
  viewMode: 'GAME' | 'CHAT' = 'GAME';
  
  hostUser = computed(() => this.gameService.players().find(p => p.isPatron));
  me = computed(() => this.gameService.players().find(p => p.id === this.authService.currentUser()?.id));

  isMePatron = computed(() => this.me()?.isPatron);
  isMeOnStage = computed(() => this.me()?.isOnStage);

  isGameActive() {
      const s = this.gameService.gameState();
      return s !== 'MENU' && s !== 'SOCIAL';
  }

  switchGame(type: GameType) {
      this.gameService.switchGameType(type);
      this.showGamesDrawer = false;
  }
  
  openSettings() { this.showSettingsDrawer = true; }
  shareRoom() { /* ... */ }
  toggleMyMic() { if (this.me()) this.gameService.toggleMute(this.me()!.id); }
  toggleHandRaise() { if (this.me()) this.gameService.raiseHand(this.me()!.id); }
  handleNextTurn() { this.gameService.nextTurn(); }
  openPlayerMenu(p: Player) { /* ... */ }
  leaveRoom() { this.gameService.leaveGame(); }

}
