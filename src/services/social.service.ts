
import { Injectable, signal } from '@angular/core';
import { UserProfile } from './auth.service';

export interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: number;
  isMe: boolean;
}

export interface SocialUser extends UserProfile {
  isBot: boolean;
  isFriend: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  // The "Database" of all users in the universe
  allUsers = signal<SocialUser[]>([]);
  
  // Chat State
  activeChatUserId = signal<string | null>(null);
  chatHistory = signal<Map<string, ChatMessage[]>>(new Map());
  isChatOpen = signal<boolean>(false);

  private readonly DB_KEY_USERS = 'dilavcilar_users_v1';
  private readonly DB_KEY_BOTS = 'dilavcilar_bots_v1';

  private mockFemales = ['Aylin', 'Zeynep', 'Elif', 'Selin', 'Defne', 'Mira', 'Esra'];
  private mockMales = ['Can', 'Mert', 'Emre', 'Burak', 'Kerem', 'Arda', 'Deniz'];
  private hobbiesList = ['Fotoğrafçılık', 'Kodlama', 'Manga', 'Jazz', 'Seyahat', 'Yemek', 'Dans', 'Tarih', 'Futbol', 'Yoga'];
  private badgesList = ['Hızlı Düşünür', 'Kelime Cambazı', 'Kral Katili', 'Gece Kuşu', 'Polyglot', 'Yardımsever'];

  constructor() {
    this.loadDatabase();
  }

  refreshUsers() {
      this.loadDatabase();
  }

  private loadDatabase() {
    // 1. Get Real Users
    let realUsers: SocialUser[] = [];
    try {
        const rawUsers = localStorage.getItem(this.DB_KEY_USERS);
        if (rawUsers) {
            realUsers = JSON.parse(rawUsers).map((u: any) => ({...u, isBot: false, isFriend: false}));
        }
    } catch(e) {}

    // 2. Get Bots
    let bots: SocialUser[] = [];
    try {
        const rawBots = localStorage.getItem(this.DB_KEY_BOTS);
        if (rawBots) {
            bots = JSON.parse(rawBots);
        } else {
            bots = this.generateInitialBots();
            localStorage.setItem(this.DB_KEY_BOTS, JSON.stringify(bots));
        }
    } catch(e) {
        bots = this.generateInitialBots();
    }

    // Merge
    this.allUsers.set([...realUsers, ...bots]);
  }

  private generateInitialBots(): SocialUser[] {
    const bots: SocialUser[] = [];
    this.mockFemales.forEach(name => bots.push(this.createBot(name, 'female')));
    this.mockMales.forEach(name => bots.push(this.createBot(name, 'male')));
    return bots;
  }

  private createBot(name: string, gender: 'male'|'female'): SocialUser {
    const seed = name + Math.random();
    const randomLvl = Math.floor(Math.random() * 20) + 1;
    
    const myHobbies = [];
    for(let i=0; i<3; i++) myHobbies.push(this.hobbiesList[Math.floor(Math.random() * this.hobbiesList.length)]);

    const myBadges = [];
    if(Math.random() > 0.3) myBadges.push(this.badgesList[Math.floor(Math.random() * this.badgesList.length)]);

    return {
      id: 'bot-' + name.toLowerCase(),
      username: name,
      email: `${name.toLowerCase()}@dilavcilar.bot`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=${gender}`,
      bio: `Merhaba! Ben ${name}. Dil öğrenmeyi ve ${myHobbies[0].toLowerCase()} ile ilgilenmeyi seviyorum.`,
      gender: gender === 'male' ? 'Erkek' : 'Kadın',
      birthDate: '2000-01-01',
      targetLanguages: Math.random() > 0.5 ? ['İngilizce', 'İspanyolca'] : ['İngilizce'],
      hobbies: Array.from(new Set(myHobbies)),
      level: randomLvl,
      crowns: { king: Math.floor(Math.random()*5), queen: Math.floor(Math.random()*5) },
      achievements: myBadges,
      isOnline: true,
      isBot: true,
      isFriend: false,
      // FIX: Added missing certificates property
      certificates: {}
    };
  }

  // --- Bot Reaction Logic ---
  
  getBotReaction(context: 'WIN' | 'FAIL' | 'START' | 'WAIT' | 'GREET' | 'TURN_TRUTH_DARE', lang: string = 'Türkçe'): string {
      const isEnglish = lang.toLowerCase().includes('ingilizce');
      
      const phrases: any = {
          WIN: isEnglish ? 
              ['Wow! Congrats!', 'Nice one!', 'Amazing!', 'Respect!', '👏'] : 
              ['Vay canına, tebrikler!', 'Harikasın!', 'Helal olsun!', 'Çok iyi!', '👏'],
          FAIL: isEnglish ? 
              ['Oh no...', 'Next time!', 'Don\'t worry.', 'Tough luck.'] : 
              ['Ah be...', 'Bir dahakine artık.', 'Üzülme dostum.', 'Zor soruydu.'],
          START: isEnglish ? 
              ['Let\'s go!', 'Ready!', 'Good luck everyone!', 'Excited!'] : 
              ['Hadi başlayalım!', 'Hazırım!', 'Herkese bol şans!', 'Çok heyecanlı!'],
          WAIT: isEnglish ? 
              ['Hmmm...', 'Thinking...', 'Give me a sec...', 'Let me guess...'] : 
              ['Hmmm...', 'Düşünüyorum...', 'Bir saniye...', 'Zor karar...'],
          GREET: isEnglish ?
              ['Hello everyone!', 'Hi!', 'Ready to play!'] :
              ['Selam herkese!', 'Merhaba!', 'Oyuna hazırım!'],
          TURN_TRUTH_DARE: isEnglish ?
              ['I choose Truth!', 'Dare! Definitely Dare.', 'Truth.', 'I am brave, Dare!'] :
              ['Doğruluk diyorum!', 'Cesaret! Korkum yok.', 'Doğruluk olsun.', 'Cesaret tabii ki!']
      };

      const options = phrases[context] || ['...'];
      return options[Math.floor(Math.random() * options.length)];
  }

  // --- Actions ---

  toggleFriend(userId: string) {
    this.allUsers.update(users => users.map(u => {
      if (u.id === userId) return { ...u, isFriend: !u.isFriend };
      return u;
    }));
  }

  openChat(userId: string) {
    this.activeChatUserId.set(userId);
    this.isChatOpen.set(true);
    
    const hist = this.chatHistory();
    if (!hist.has(userId)) {
      const user = this.allUsers().find(u => u.id === userId);
      if(user) {
        this.addMessage(userId, {
           senderId: userId,
           text: `Selam! Ben ${user.username}. Müsait olduğunda yazışalım mı? 👋`,
           timestamp: Date.now(),
           isMe: false
        });
      }
    }
  }

  closeChat() {
    this.isChatOpen.set(false);
  }

  sendMessage(text: string) {
    const activeId = this.activeChatUserId();
    if (!activeId || !text.trim()) return;

    this.addMessage(activeId, {
      senderId: 'me',
      text: text,
      timestamp: Date.now(),
      isMe: true
    });

    setTimeout(() => {
       this.botReply(activeId, text);
    }, 1500);
  }

  private addMessage(chatId: string, msg: ChatMessage) {
    this.chatHistory.update(map => {
      const newMap = new Map<string, ChatMessage[]>(map);
      const current = newMap.get(chatId) || [];
      newMap.set(chatId, [...current, msg]);
      return newMap;
    });
  }

  private botReply(botId: string, userMsg: string) {
    const responses = [
       "Kesinlikle!",
       "Bunu duyduğuma sevindim.",
       "Oyun oynamak ister misin?",
       "İngilizce çalışıyorum şu an.",
       "Haha, çok komiksin! 😂",
       "Sonra konuşalım mı? Biraz meşgulüm."
    ];
    const randomResp = responses[Math.floor(Math.random() * responses.length)];
    
    this.addMessage(botId, {
      senderId: botId,
      text: randomResp,
      timestamp: Date.now(),
      isMe: false
    });
  }

  getRandomBots(count: number): SocialUser[] {
    const bots = this.allUsers().filter(u => u.isBot);
    const shuffled = bots.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  getById(id: string) {
      return this.allUsers().find(u => u.id === id);
  }
}