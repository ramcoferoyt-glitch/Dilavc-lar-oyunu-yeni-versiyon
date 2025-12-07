import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialService, SocialUser } from '../services/social.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-[#0F111A] text-white p-6">
      <h1 class="text-3xl font-black mb-6">🏆 Liderlik Tablosu</h1>
      <div class="flex-1 overflow-y-auto">
        <div class="space-y-3">
            @for(user of rankedUsers(); track user.id; let i = $index) {
                <div class="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <span class="font-bold text-lg w-8 text-center text-slate-500">{{ i + 1 }}</span>
                    <img [src]="user.avatar" class="w-12 h-12 rounded-full">
                    <div class="flex-1">
                        <p class="font-bold text-white">{{ user.username }}</p>
                        <p class="text-xs text-slate-400">Seviye: {{ user.level }}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-yellow-400">{{ user.crowns.king + user.crowns.queen }} Taç 👑</p>
                    </div>
                </div>
            }
        </div>
      </div>
    </div>
  `
})
export class LeaderboardComponent {
  socialService = inject(SocialService);

  rankedUsers = computed(() => {
    return this.socialService.allUsers().slice().sort((a, b) => {
        const scoreA = (a.crowns.king + a.crowns.queen) * 100 + a.level;
        const scoreB = (b.crowns.king + b.crowns.queen) * 100 + b.level;
        return scoreB - scoreA;
    });
  });
}
