
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-who-am-i',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col items-center justify-center p-6 relative">
      
      <h2 class="text-3xl font-black text-white mb-2 uppercase tracking-tight">Kim Ben?</h2>
      <p class="text-slate-400 text-sm mb-12">Kelimeyi görmeden tahmin etmeye çalış!</p>

      @if(gameService.whoAmIActivePlayer(); as playerId) {
          <!-- Active Game State -->
          <div class="bg-yellow-500/10 border border-yellow-500/50 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden animate-pulse-slow">
              
              <!-- Timer -->
              <div class="absolute top-4 right-4 bg-slate-900 text-white font-mono font-bold px-3 py-1 rounded border border-slate-700">
                  {{ gameService.timerValue() }}s
              </div>

              <!-- "Post-it" Note Effect -->
              <div class="bg-yellow-300 text-black p-6 rotate-1 shadow-xl transform transition-transform hover:rotate-0 mb-6 mx-auto w-48 h-32 flex items-center justify-center font-handwriting">
                  @if(gameService.whoAmIWord()) {
                      <span class="text-3xl font-black">{{ gameService.whoAmIWord() }}</span>
                  } @else {
                      <div class="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                  }
              </div>

              <div class="text-yellow-500 font-bold mb-2">Şu an Tahmin Ediyor:</div>
              @if(getPlayer(playerId); as p) {
                 <div class="flex items-center justify-center gap-2">
                     <img [src]="p.avatar" class="w-8 h-8 rounded-full">
                     <span class="text-white font-bold">{{ p.name }}</span>
                 </div>
              }
              
              <div class="mt-8 flex gap-4">
                  <button (click)="finishTurn(false)" class="flex-1 py-3 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-colors">Pes Et</button>
                  <button (click)="finishTurn(true)" class="flex-1 py-3 bg-green-600/20 text-green-500 hover:bg-green-600 hover:text-white rounded-xl font-bold transition-colors">Bildim!</button>
              </div>
          </div>

      } @else {
          <!-- Selection State -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
              @for(p of gameService.stagePlayers(); track p.id) {
                  <button (click)="gameService.startWhoAmI(p.id)" 
                          class="bg-slate-800 hover:bg-slate-700 p-4 rounded-xl border border-slate-600 hover:border-yellow-500 transition-all flex flex-col items-center gap-2 group">
                      <img [src]="p.avatar" class="w-16 h-16 rounded-full grayscale group-hover:grayscale-0 transition-all">
                      <span class="font-bold text-white text-sm">{{ p.name }}</span>
                      <span class="text-[10px] text-slate-500 uppercase group-hover:text-yellow-400">Seç</span>
                  </button>
              }
          </div>
          <p class="text-slate-500 text-xs mt-6">Bir oyuncu seçerek oyunu başlat.</p>
      }
    </div>
  `,
  styles: [`
    .font-handwriting { font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif; }
    .animate-pulse-slow { animation: pulse 3s infinite; }
  `]
})
export class WhoAmIComponent {
  gameService = inject(GameService);

  getPlayer(id: string) { return this.gameService.players().find(p => p.id === id); }
  
  finishTurn(success: boolean) {
      if(success) {
          // Add points logic here if needed
      }
      this.gameService.whoAmIActivePlayer.set(null);
      this.gameService.stopTimer();
  }
}
