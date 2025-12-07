import { Component, inject, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestService } from '../services/test.service';
import { GameService } from '../services/game.service';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-certification-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full w-full bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      @switch (testService.testState()) {
        @case ('SELECT_LANG') {
          <div class="text-center">
            <h1 class="text-3xl font-bold mb-2">Seviye Tespit Sınavı</h1>
            <p class="text-slate-400 mb-8">Hangi dilde seviyeni ölçmek istersin?</p>
            <div class="max-w-md mx-auto space-y-2">
              @for(lang of gameService.availableLanguages; track lang) {
                <button (click)="testService.startTestForLanguage(lang)" class="w-full p-4 bg-slate-800 rounded-lg text-left font-bold hover:bg-blue-600">
                  {{ lang }}
                </button>
              }
            </div>
             <button (click)="close.emit()" class="mt-8 text-slate-500">Geri</button>
          </div>
        }
        @case ('IN_PROGRESS') {
          @if(currentQuestion(); as q) {
            <div class="w-full max-w-2xl">
              <p class="text-sm text-slate-400 mb-4">Soru {{ testService.currentQuestionIndex() + 1 }} / {{ testService.questions().length }}</p>
              <h2 class="text-2xl font-bold mb-8">{{ q.question }}</h2>

              @if(q.type === 'multiple_choice') {
                <div class="space-y-3">
                  @for(opt of q.options; track opt) {
                    <button (click)="submit(q, opt)" class="w-full p-4 bg-slate-800 rounded-lg text-left font-bold hover:bg-blue-600">
                      {{ opt }}
                    </button>
                  }
                </div>
              } @else if (q.type === 'fill_blank') {
                <form (submit)="submit(q, blankAnswer)">
                  <input [(ngModel)]="blankAnswer" name="blankAnswer" class="w-full p-4 bg-slate-800 rounded-lg font-bold mb-4" placeholder="Cevabınızı yazın...">
                  <button type="submit" class="w-full p-4 bg-blue-600 rounded-lg font-bold">GÖNDER</button>
                </form>
              } @else if (q.type === 'translation') {
                 <form (submit)="submit(q, blankAnswer)">
                  <input [(ngModel)]="blankAnswer" name="blankAnswer" class="w-full p-4 bg-slate-800 rounded-lg font-bold mb-4" placeholder="Çeviriyi yazın...">
                  <button type="submit" class="w-full p-4 bg-blue-600 rounded-lg font-bold">GÖNDER</button>
                </form>
              }
            </div>
          } @else {
             <div class="text-center">
                <div class="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                <p class="mt-4">Sorular hazırlanıyor...</p>
             </div>
          }
        }
        @case ('FINISHED') {
          <div class="text-center bg-slate-800 p-8 rounded-2xl max-w-lg w-full">
            <h1 class="text-4xl font-black text-yellow-400 mb-4">SONUÇ</h1>
            <p class="mb-2">{{ testService.selectedLanguage() }} dilindeki yeterlilik seviyen:</p>
            <p class="text-8xl font-black text-white mb-6">{{ testService.finalLevel() }}</p>
            <p class="text-slate-400 mb-8">Bu sertifika profiline eklendi.</p>
            <button (click)="close.emit()" class="w-full p-4 bg-blue-600 rounded-lg font-bold">Harika!</button>
          </div>
        }
      }
    </div>
  `
})
export class CertificationTestComponent {
  testService = inject(TestService);
  gameService = inject(GameService); // for language list
  close = output<void>();

  blankAnswer = '';

  currentQuestion = computed(() => {
    const questions = this.testService.questions();
    const index = this.testService.currentQuestionIndex();
    return questions.length > index ? questions[index] : null;
  });

  submit(q: any, answer: string) {
      this.testService.submitAnswer(q, answer);
      this.blankAnswer = '';
  }
}
