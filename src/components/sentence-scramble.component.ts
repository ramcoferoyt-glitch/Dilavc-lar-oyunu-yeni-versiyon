import { Component, inject, signal, onInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-sentence-scramble',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col items-center justify-center p-6 text-white">
      <h2 class="text-3xl font-black mb-4">Cümleyi Düzelt</h2>
      <p class="text-slate-400 mb-8">Kelimeleri doğru sıraya dizerek anlamlı bir cümle oluştur.</p>

      @if(scrambledWords().length > 0) {
        <div class="w-full max-w-2xl min-h-[80px] bg-slate-800 p-4 rounded-lg flex items-center justify-center flex-wrap gap-4 mb-8">
            @for(word of scrambledWords(); track word) {
                <button (click)="selectWord(word)" class="px-4 py-2 bg-slate-700 rounded-lg text-lg font-bold">{{ word }}</button>
            }
        </div>

        <div class="w-full max-w-2xl min-h-[80px] bg-slate-900/50 border-2 border-dashed border-slate-700 p-4 rounded-lg flex items-center justify-center flex-wrap gap-4 mb-4">
             @for(word of userSentence(); track $index) {
                <button (click)="deselectWord($index)" class="px-4 py-2 bg-blue-600 rounded-lg text-lg font-bold">{{ word }}</button>
            }
        </div>
        <button (click)="checkSentence()" class="px-8 py-3 bg-green-600 rounded-lg font-bold">Kontrol Et</button>
        
        @if(isCorrect() === true) {
            <p class="text-green-500 mt-4">Tebrikler, doğru! 🎉</p>
        }
        @if(isCorrect() === false) {
            <p class="text-red-500 mt-4">Yanlış, tekrar dene.</p>
        }

      } @else {
        <p>Yükleniyor...</p>
      }
    </div>
  `
})
export class SentenceScrambleComponent implements onInit {
  gameService = inject(GameService);
  geminiService = inject(GeminiService);

  scrambledWords = signal<string[]>([]);
  originalSentence = signal('');
  userSentence = signal<string[]>([]);
  isCorrect = signal<boolean | null>(null);

  async ngOnInit() {
    const data = await this.geminiService.generateSentenceScramble(
        this.gameService.settings().targetLanguage,
        this.gameService.settings().difficulty
    );
    this.scrambledWords.set(data.scrambled);
    this.originalSentence.set(data.original);
  }

  selectWord(word: string) {
    this.userSentence.update(s => [...s, word]);
    this.scrambledWords.update(s => s.filter(w => w !== word));
    this.isCorrect.set(null);
  }

  deselectWord(index: number) {
    const word = this.userSentence()[index];
    this.userSentence.update(s => s.filter((_, i) => i !== index));
    this.scrambledWords.update(s => [...s, word]);
  }

  checkSentence() {
    const userString = this.userSentence().join(' ');
    // Simple check, a more robust version might ignore punctuation.
    if (userString.toLowerCase().replace(/[^a-z0-9 ]/g, '') === this.originalSentence().toLowerCase().replace(/[^a-z0-9 ]/g, '')) {
      this.isCorrect.set(true);
    } else {
      this.isCorrect.set(false);
    }
  }
}
