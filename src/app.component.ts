import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { GameService } from './services/game.service';
import { TestService } from './services/test.service';

// Components
import { ProfileComponent } from './components/profile.component';
import { RoomListComponent } from './components/room-list.component';
import { ActiveGameComponent } from './components/active-game.component';
import { DiscoverComponent } from './components/discover.component';
import { LeaderboardComponent } from './components/leaderboard.component';
import { CertificationTestComponent } from './components/certification-test.component';

export type ViewState = 'ROOMS' | 'GAME' | 'RANK' | 'PROFILE' | 'DISCOVER' | 'TEST';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ProfileComponent,
    RoomListComponent,
    ActiveGameComponent,
    DiscoverComponent,
    LeaderboardComponent,
    CertificationTestComponent
  ],
  template: `
    <div class.="h-screen w-screen bg-[#0F111A] text-white overflow-hidden flex flex-col font-sans relative">
      
      @if (authService.currentUser(); as user) {
        
        <!-- Main Content Area -->
        <main class="flex-1 overflow-hidden relative w-full" [class.pb-[70px]]="showBottomNav()"> 
           @switch (currentView()) {
             @case ('PROFILE') { <app-profile (startTest)="startCertificationProcess()" (close)="navTo('ROOMS')" /> }
             @case ('ROOMS') { <app-room-list /> }
             @case ('DISCOVER') { <app-discover /> }
             @case ('GAME') { 
                @if(gameService.gameState() === 'MENU') {
                    <div class="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900">
                        <p class="mb-6 font-medium">Şu an bir odada değilsin.</p>
                        <button (click)="navTo('ROOMS')" class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-bold">
                           Oda Keşfet
                        </button>
                    </div>
                } @else {
                    <app-active-game (minimize)="navTo('ROOMS')" />
                }
             }
             @case ('RANK') { <app-leaderboard /> }
             @case ('TEST') { <app-certification-test (close)="navTo('PROFILE')" /> }
             @default { <app-room-list /> }
           }
        </main>

        <!-- MINI PLAYER BAR -->
        @if(isRoomActiveButMinimized()) {
            <div (click)="navTo('GAME')" class="absolute bottom-[75px] left-2 right-2 bg-[#1A1D29]/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl flex items-center justify-between z-40">
                 <div>
                     <div class="text-[10px] text-green-400 font-bold">Odaya Dön</div>
                     <div class="font-bold text-sm text-white">{{ gameService.settings().roomName }}</div>
                 </div>
            </div>
        }

        <!-- BOTTOM NAVIGATION BAR -->
        @if(showBottomNav()) {
          <nav class="absolute bottom-0 left-0 w-full h-[70px] bg-[#1A1D29]/95 backdrop-blur-md border-t border-white/5 flex justify-around items-center px-2 z-50">
              
              <button (click)="navTo('ROOMS')" class="flex flex-col items-center gap-1 p-2 w-14 group">
                  <div [class.text-white]="currentView() === 'ROOMS'" [class.text-slate-600]="currentView() !== 'ROOMS'">🏠</div>
                  <span class="text-[9px] font-bold" [class.text-white]="currentView() === 'ROOMS'" [class.text-slate-600]="currentView() !== 'ROOMS'">Ana Sayfa</span>
              </button>
              <button (click)="navTo('DISCOVER')" class="flex flex-col items-center gap-1 p-2 w-14 group">
                  <div [class.text-blue-400]="currentView() === 'DISCOVER'" [class.text-slate-600]="currentView() !== 'DISCOVER'">🔍</div>
                  <span class="text-[9px] font-bold" [class.text-blue-400]="currentView() === 'DISCOVER'" [class.text-slate-600]="currentView() !== 'DISCOVER'">Keşfet</span>
              </button>
              <div class="relative -top-6">
                  <button (click)="handleMiddleButton()" class="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600">
                      <span class="text-3xl text-white">+</span>
                  </button>
              </div>
              <button (click)="navTo('RANK')" class="flex flex-col items-center gap-1 p-2 w-14 group">
                  <div [class.text-yellow-500]="currentView() === 'RANK'" [class.text-slate-600]="currentView() !== 'RANK'">🏆</div>
                  <span class="text-[9px] font-bold" [class.text-yellow-500]="currentView() === 'RANK'" [class.text-slate-600]="currentView() !== 'RANK'">Liderler</span>
              </button>
              <button (click)="navTo('PROFILE')" class="flex flex-col items-center gap-1 p-2 w-14 group">
                  <div class="w-7 h-7 rounded-full overflow-hidden border-2" [class.border-white]="currentView() === 'PROFILE'" [class.border-transparent]="currentView() !== 'PROFILE'">
                      <img [src]="user.avatar" class="w-full h-full object-cover">
                  </div>
                  <span class="text-[9px] font-bold" [class.text-white]="currentView() === 'PROFILE'" [class.text-slate-600]="currentView() !== 'PROFILE'">Profil</span>
              </button>

          </nav>
        }

      } @else {
        <!-- This logic is now handled by auto-guest login in AuthService -->
        <div class="h-full w-full flex items-center justify-center">Yükleniyor...</div>
      }
    </div>
  `
})
export class AppComponent {
  authService = inject(AuthService);
  gameService = inject(GameService);
  testService = inject(TestService);
  
  currentView = signal<ViewState>('ROOMS');

  constructor() {
    effect(() => {
        const state = this.gameService.gameState();
        if ((state === 'SOCIAL' || this.isGameActive()) && this.currentView() !== 'GAME') {
            this.navTo('GAME');
        }
        if (state === 'MENU' && this.currentView() === 'GAME') {
             this.navTo('ROOMS');
        }
    });

    effect(() => {
        const testState = this.testService.testState();
        if(testState === 'SELECT_LANG' || testState === 'IN_PROGRESS' || testState === 'FINISHED') {
            this.navTo('TEST');
        }
    })
  }

  isGameActive(): boolean {
      const s = this.gameService.gameState();
      return s !== 'MENU' && s !== 'SOCIAL';
  }

  navTo(view: ViewState) {
      this.currentView.set(view);
  }

  startCertificationProcess() {
      this.testService.startTestSelection();
      this.navTo('TEST');
  }

  showBottomNav(): boolean {
      if (this.currentView() === 'GAME' && this.gameService.gameState() !== 'MENU') {
          return false;
      }
      if (this.currentView() === 'TEST') return false;
      return true;
  }
  
  isRoomActiveButMinimized(): boolean {
      return this.gameService.gameState() !== 'MENU' && this.currentView() !== 'GAME';
  }

  handleMiddleButton() {
      if (this.gameService.gameState() !== 'MENU') {
          this.navTo('GAME');
      } else {
          this.navTo('ROOMS'); 
      }
  }
}
