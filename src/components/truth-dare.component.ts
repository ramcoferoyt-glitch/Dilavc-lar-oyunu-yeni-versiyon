
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-truth-dare',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col items-center justify-center p-6 relative">
      
      <!-- Content Result -->
      @if(gameService.truthDareContent()) {
          <div class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-8 animate-zoom-in">
              <div class="max-w-xl w-full text-center">
                  <h3 class="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">GÖREVİN</h3>
                  <div class="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl mb-8">
                      <p class="text-2xl text-white font-medium leading-relaxed">{{ gameService.truthDareContent() }}</p>
                  </div>
                  <button (click)="gameService.truthDareContent.set('')" class="px-8 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition-transform">
                      DEVAM ET
                  </button>
              </div>
          </div>
      }

      <h2 class="text-2xl md:text-4xl font-black text-white mb-12 uppercase tracking-tight text-center">
         <span class="text-blue-500">Doğruluk</span> mu <span class="text-red-500">Cesaret</span> mi?
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
         <!-- TRUTH -->
         <button (click)="gameService.getTruthOrDare('TRUTH')" 
                 class="group relative h-64 md:h-80 rounded-3xl overflow-hidden border-2 border-blue-500/30 hover:border-blue-500 transition-all transform hover:scale-[1.02]">
             <div class="absolute inset-0 bg-blue-900/20 group-hover:bg-blue-900/40 transition-colors"></div>
             <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
                 <span class="text-6xl mb-4 group-hover:scale-110 transition-transform">😇</span>
                 <span class="text-3xl font-black text-blue-400 uppercase tracking-widest">Doğruluk</span>
                 <p class="text-blue-200/50 text-xs mt-2 font-bold">Dürüstçe Cevapla</p>
             </div>
         </button>

         <!-- DARE -->
         <button (click)="gameService.getTruthOrDare('DARE')" 
                 class="group relative h-64 md:h-80 rounded-3xl overflow-hidden border-2 border-red-500/30 hover:border-red-500 transition-all transform hover:scale-[1.02]">
             <div class="absolute inset-0 bg-red-900/20 group-hover:bg-red-900/40 transition-colors"></div>
             <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
                 <span class="text-6xl mb-4 group-hover:scale-110 transition-transform">😈</span>
                 <span class="text-3xl font-black text-red-500 uppercase tracking-widest">Cesaret</span>
                 <p class="text-red-200/50 text-xs mt-2 font-bold">Meydan Oku</p>
             </div>
         </button>
      </div>
      
      <p class="text-slate-500 text-sm mt-8 font-medium">Seçimini yap, kaderine razı ol.</p>
    </div>
  `,
  styles: [`
    .animate-zoom-in { animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class TruthDareComponent {
  gameService = inject(GameService);
}
