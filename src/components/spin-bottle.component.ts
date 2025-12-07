
import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-spin-bottle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col items-center justify-center relative p-6">
      
      <!-- Task Overlay -->
      @if(gameService.spinBottleTask()) {
          <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-6">
             <div class="bg-slate-900 border border-purple-500 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative">
                <button (click)="gameService.spinBottleTask.set('')" class="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                <div class="text-4xl mb-4">🍾</div>
                <h3 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">GÖREV</h3>
                <p class="text-xl text-white font-medium leading-relaxed mb-8">{{ gameService.spinBottleTask() }}</p>
                <button (click)="gameService.spinBottleTask.set('')" class="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-white transition-colors">
                   Tamam
                </button>
             </div>
          </div>
      }

      <h2 class="text-3xl font-black text-white mb-12 tracking-widest uppercase drop-shadow-lg">Şişe Çevir</h2>
      
      <!-- Bottle Area -->
      <div class="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12">
          <!-- Avatars Circle (Visual only representation of stage players) -->
          <div class="absolute inset-0 rounded-full border border-white/5 animate-pulse-slow"></div>
          
          <!-- Bottle -->
          <div class="relative w-16 h-48 transition-transform duration-[3000ms] ease-out origin-center"
               [style.transform]="'rotate(' + rotation + 'deg)'">
               <div class="w-full h-full bg-gradient-to-b from-green-400/80 to-green-800/80 rounded-full border-2 border-green-300 shadow-[0_0_30px_rgba(34,197,94,0.4)] flex flex-col items-center justify-center">
                   <span class="text-xs font-bold text-green-950 rotate-90">SPIN</span>
               </div>
               <!-- Neck -->
               <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-8 bg-green-300 rounded-t-lg"></div>
          </div>
      </div>

      <!-- Controls -->
      <div class="flex flex-col items-center gap-4">
          @if(gameService.activePlayer()) {
             <div class="flex flex-col items-center animate-bounce-subtle">
                 <img [src]="gameService.activePlayer()?.avatar" class="w-16 h-16 rounded-full border-4 border-yellow-500 shadow-xl">
                 <span class="mt-2 font-bold text-yellow-400 text-lg">{{ gameService.activePlayer()?.name }} Seçildi!</span>
             </div>
          } @else {
             <button (click)="spin()" [disabled]="isSpinning" 
                 class="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100">
                 <span class="text-3xl">🔄</span>
             </button>
             <p class="text-slate-400 text-sm mt-4">Çevirmek için bas</p>
          }
      </div>
    </div>
  `,
  styles: [`
    .animate-pulse-slow { animation: pulse 4s infinite; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class SpinBottleComponent {
  gameService = inject(GameService);
  audioService = inject(AudioService);
  rotation = 0;
  isSpinning = false;

  spin() {
     if(this.isSpinning) return;
     this.isSpinning = true;
     
     // Random spins (min 3 full rotations + random angle)
     const randomAngle = Math.floor(Math.random() * 360);
     const totalRot = 1080 + randomAngle; 
     this.rotation += totalRot;

     // Play Sound
     if(!this.gameService.isGlobalSoundMuted()) {
         this.audioService.playSpinLoop();
     }

     setTimeout(() => {
         this.isSpinning = false;
         this.audioService.stopSpinLoop();
         this.gameService.spinTheBottle(); // Trigger game logic (AI gen etc)
     }, 3000);
  }
}
