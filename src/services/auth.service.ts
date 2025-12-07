import { Injectable, signal } from '@angular/core';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  password?: string; // In real app, hash this!
  avatar: string;
  bio: string;
  gender: string;
  birthDate: string;
  targetLanguages: string[];
  hobbies: string[]; 
  level: number;
  crowns: { king: number; queen: number };
  achievements: string[];
  isOnline: boolean;
  isBot?: boolean; 
  certificates: { [language: string]: string }; // e.g. { 'İngilizce': 'B2' }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<UserProfile | null>(null);
  private readonly DB_KEY = 'dilavcilar_users_v3'; 
  private readonly SESSION_KEY = 'dilavcilar_session_v3';
  
  constructor() {
    this.tryRestoreSession();
    
    if (!this.currentUser()) {
        this.loginAsGuest();
    }
  }

  private tryRestoreSession() {
      try {
          const session = localStorage.getItem(this.SESSION_KEY);
          if (session) {
              const user = this.getUserByUsername(session);
              if (user) {
                  this.currentUser.set(user);
              }
          }
      } catch (e) {
          console.error('Session restore failed', e);
      }
  }

  private loginAsGuest() {
      const randomId = Math.floor(Math.random() * 9000) + 1000;
      const guestUser: UserProfile = {
          id: 'guest-' + Date.now(),
          username: `Misafir_${randomId}`,
          email: `misafir${randomId}@dilavcilar.app`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Misafir_${randomId}`,
          bio: 'Dil Avcısı Evrenine hoş geldiniz.',
          gender: 'Belirtilmemiş',
          birthDate: '',
          targetLanguages: ['İngilizce'],
          hobbies: [],
          level: 1,
          crowns: { king: 0, queen: 0 },
          achievements: [],
          isOnline: true,
          certificates: {}
      };
      
      this.currentUser.set(guestUser);
  }

  private getUsersDB(): UserProfile[] {
      try {
          const raw = localStorage.getItem(this.DB_KEY);
          if (!raw) return [];
          return JSON.parse(raw);
      } catch (e) {
          localStorage.removeItem(this.DB_KEY);
          return [];
      }
  }

  private saveUsersDB(users: UserProfile[]) {
      try {
          localStorage.setItem(this.DB_KEY, JSON.stringify(users));
      } catch (e) {
          console.error('Save failed', e);
      }
  }

  private getUserByUsername(username: string): UserProfile | undefined {
      const users = this.getUsersDB();
      return users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  register(data: any): boolean {
    const users = this.getUsersDB();
    
    if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
        return false; // User exists
    }

    const newUser: UserProfile = {
      id: 'u-' + Date.now() + Math.floor(Math.random() * 1000),
      username: data.username,
      email: data.email,
      password: data.password, 
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      bio: 'Yeni bir Dil Avcısı maceraya hazır.',
      gender: 'Belirtilmemiş',
      birthDate: '',
      targetLanguages: ['İngilizce'],
      hobbies: ['Müzik', 'Sinema'],
      level: 1,
      crowns: { king: 0, queen: 0 },
      achievements: ['Çaylak Avcı'],
      isOnline: true,
      certificates: {}
    };

    users.push(newUser);
    this.saveUsersDB(users);
    this.loginInternal(newUser);
    return true;
  }

  login(username: string, password?: string): boolean {
    const user = this.getUserByUsername(username);
    if (user) {
        if (password && user.password && user.password !== password) {
            return false;
        }
        this.loginInternal(user);
        return true;
    }
    return false;
  }

  private loginInternal(user: UserProfile) {
      this.currentUser.set(user);
      localStorage.setItem(this.SESSION_KEY, user.username);
  }

  logout() { 
      this.currentUser.set(null); 
      localStorage.removeItem(this.SESSION_KEY);
      this.loginAsGuest();
  }
  
  updateProfile(d: Partial<UserProfile>) { 
    this.currentUser.update(u => {
        if (!u) return null;
        const updated = { ...u, ...d };
        
        const users = this.getUsersDB();
        const idx = users.findIndex(x => x.id === u.id);
        if (idx !== -1) {
            users[idx] = updated;
            this.saveUsersDB(users);
        }
        
        return updated;
    }); 
  }

  addCertificate(language: string, level: string) {
      this.currentUser.update(u => {
          if(!u) return null;
          const newCerts = { ...u.certificates, [language]: level };
          const updatedUser = { ...u, certificates: newCerts };
          
          // Also save to DB
          const users = this.getUsersDB();
          const idx = users.findIndex(x => x.id === u.id);
          if (idx !== -1) {
              users[idx] = updatedUser;
              this.saveUsersDB(users);
          }
          return updatedUser;
      });
  }
}
