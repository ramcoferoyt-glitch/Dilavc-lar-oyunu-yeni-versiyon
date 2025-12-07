import { Component, inject, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { TestService } from '../services/test.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full bg-[#0F111A] relative overflow-y-auto font-sans pb-24">
      
      @if (displayUser(); as user) {
        
        <!-- Header -->
        <div class="h-48 w-full bg-gradient-to-r from-blue-900 to-purple-900 relative">
             <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
             <button (click)="close.emit()" class="absolute top-4 left-4 w-10 h-10 bg-black/30 rounded-full text-white flex items-center justify-center">←</button>
             <button (click)="startEditing()" class="absolute top-4 right-4 px-4 py-1.5 bg-black/30 rounded-full text-white text-xs font-bold">✏️ Düzenle</button>
        </div>

        <!-- Profile Card -->
        <div class="px-4 -mt-16 relative z-10">
            <div class="bg-[#1A1D29] rounded-3xl p-6 shadow-2xl border border-white/5">
                
                <div class="flex justify-between items-end mb-4">
                    <div class="w-24 h-24 rounded-[2rem] border-4 border-[#1A1D29] bg-slate-800 overflow-hidden -mt-16">
                        <img [src]="user.avatar" class="w-full h-full object-cover">
                    </div>
                    <div class="flex gap-2">
                         <div class="text-center"><span class="font-bold text-white text-lg">{{ user.crowns.king + user.crowns.queen }}</span><span class="text-[10px] text-slate-500 block">Taç</span></div>
                         <div class="text-center"><span class="font-bold text-white text-lg">{{ user.level }}</span><span class="text-[10px] text-slate-500 block">Seviye</span></div>
                    </div>
                </div>

                <h1 class="text-2xl font-black text-white">{{ user.username }}</h1>
                <p class="text-slate-300 text-sm leading-relaxed mb-6">{{ user.bio }}</p>

                <!-- NEW: Language Proficiency Section -->
                <div class="mb-6">
                    <h3 class="text-slate-500 text-xs font-bold uppercase mb-3">DİL YETERLİLİĞİ</h3>
                    <div class="space-y-2">
                        @for(cert of objectKeys(user.certificates); track cert) {
                           <div class="bg-slate-800 p-2 rounded-lg flex justify-between items-center">
                               <span class="font-bold text-sm text-white">{{cert}}</span>
                               <span class="px-2 py-0.5 bg-green-600 text-white text-xs font-black rounded">{{ user.certificates[cert] }}</span>
                           </div>
                        }
                        @if(objectKeys(user.certificates).length === 0) {
                            <p class="text-slate-500 text-xs italic">Henüz sertifika yok.</p>
                        }
                    </div>
                     <button (click)="startTest.emit()" class="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg">
                        + Seviye Tespit Sınavına Gir
                    </button>
                </div>
            </div>
        </div>
      }
    </div>
  `,
})
export class ProfileComponent {
  authService = inject(AuthService);
  testService = inject(TestService);
  close = output<void>();
  startTest = output<void>();

  isEditing = false;
  displayUser = computed(() => this.authService.currentUser());

  objectKeys(obj: any) {
    return Object.keys(obj);
  }

  startEditing() {
      // Logic for editing profile
  }
}
