import { Injectable, signal, inject } from '@angular/core';
import { GeminiService } from './gemini.service';
import { AuthService } from './auth.service';

export interface TestQuestion {
  question: string;
  type: 'multiple_choice' | 'fill_blank' | 'translation';
  options?: string[];
  answer: string;
  userAnswer?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestService {
  geminiService = inject(GeminiService);
  authService = inject(AuthService);

  testState = signal<'IDLE' | 'SELECT_LANG' | 'IN_PROGRESS' | 'FINISHED'>('IDLE');
  selectedLanguage = signal<string>('İngilizce');
  questions = signal<TestQuestion[]>([]);
  currentQuestionIndex = signal<number>(0);
  score = signal<number>(0);
  finalLevel = signal<string>('');

  constructor() { }

  startTestSelection() {
    this.testState.set('SELECT_LANG');
  }

  async startTestForLanguage(language: string) {
    this.selectedLanguage.set(language);
    this.testState.set('IN_PROGRESS');
    this.currentQuestionIndex.set(0);
    this.score.set(0);
    this.finalLevel.set('');
    // For now, let's generate 5 questions for speed
    // In a real app, this would be 20-30
    const generatedQuestions = await this.geminiService.generateCertificationTest(language, 5);
    this.questions.set(generatedQuestions.map(q => ({...q, userAnswer: ''})));
  }

  submitAnswer(question: TestQuestion, answer: string) {
    const updatedQuestions = this.questions().map(q => 
        q.question === question.question ? { ...q, userAnswer: answer } : q
    );
    this.questions.set(updatedQuestions);

    if (this.currentQuestionIndex() < this.questions().length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
    } else {
      this.finishTest();
    }
  }

  finishTest() {
    let correctAnswers = 0;
    for (const q of this.questions()) {
      if (q.userAnswer?.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
        correctAnswers++;
      }
    }
    
    this.score.set(Math.round((correctAnswers / this.questions().length) * 100));
    
    const calculatedLevel = this.calculateCEFR(this.score());
    this.finalLevel.set(calculatedLevel);

    // Save certificate to user profile
    this.authService.addCertificate(this.selectedLanguage(), calculatedLevel);

    this.testState.set('FINISHED');
  }

  private calculateCEFR(score: number): string {
    if (score >= 90) return 'C2';
    if (score >= 80) return 'C1';
    if (score >= 70) return 'B2';
    if (score >= 60) return 'B1';
    if (score >= 40) return 'A2';
    return 'A1';
  }

  resetTest() {
    this.testState.set('IDLE');
  }
}
