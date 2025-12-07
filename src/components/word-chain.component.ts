import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-word-chain',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col items-center justify-center p-6 text-white">
      <h2 class="text-3xl font-black mb-4">Kelime Zinciri</h2>
      @if(lastWord()) {
        <p class="mb-8">Sıradaki kelime <span class="text-yellow-400 font-bold text-2xl">{{ lastLetter() }}</span> harfi ile başlamalı.</p>
      } @else {
         <p class="text-slate-400 mb-8">Oyunu başlatmak için bir kelime yaz.</p>
      }

      <div class="w-full max-w-md mb-8">
        <form (submit)="submitWord()">
          <input [(ngModel)]="currentWord" name="currentWord" class="w-full p-4 text-center bg-slate-800 rounded-lg text-2xl font-bold tracking-widest uppercase" placeholder="...">
        </form>
        @if(errorMessage) {
            <p class="text-red-500 mt-2 text-center">{{ errorMessage }}</p>
        }
      </div>

      <div class="w-full max-w-md bg-slate-900/50 p-4 rounded-lg h-48 overflow-y-auto">
        <p class="text-sm text-slate-400">Zincir:</p>
        <p class="text-lg leading-relaxed">{{ wordList().join(' → ') }}</p>
      </div>
    </div>
  `
})
export class WordChainComponent {
  gameService = inject(GameService);
  wordList = signal<string[]>([]);
  currentWord = '';
  errorMessage = '';

  lastWord = computed(() => this.wordList().length > 0 ? this.wordList()[this.wordList().length - 1] : '');
  lastLetter = computed(() => this.lastWord() ? this.lastWord().slice(-1).toUpperCase() : '');

  submitWord() {
    const word = this.currentWord.trim();
    if (!word) return;

    if (this.lastLetter() && !word.toLowerCase().startsWith(this.lastLetter().toLowerCase())) {
        this.errorMessage = `Kelime '${this.lastLetter()}' ile başlamalı!`;
        return;
    }

    this.wordList.update(list => [...list, word]);
    this.currentWord = '';
    this.errorMessage = '';
  }
}
