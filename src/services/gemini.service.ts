import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { TestQuestion } from './test.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private modelId = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  private getLevelDesc(difficulty: string): string {
    return difficulty === 'Expert' ? 'C1 (Advanced)' : (difficulty === 'Zor' ? 'B2 (Upper Int)' : 'A1-A2 (Beginner)');
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
      });
      return response.text || 'İçerik alınamadı.';
    } catch (error) {
      console.error('AI Error:', error);
      return 'Bağlantı hatası. Lütfen tekrar deneyin.';
    }
  }

  // --- ROUND 1: HIZLI & ÖFKELİ ---
  async generateRound1Task(targetLanguage: string, difficulty: string): Promise<string> {
    const prompt = `Sen 'DİL AVCILARI' yarışmasının sunucususun.
    Hedef Dil: ${targetLanguage}
    Seviye: ${difficulty}
    
    Yarışmacıya çok kısa, net, aksiyon odaklı bir görev ver.
    Cevabı veya ipucunu ASLA verme. Sadece emri ver.

    Örnekler:
    - "15 saniye içinde İngilizce 5 farklı meyve ismi say!"
    - "Tek ayak üstünde dururken 10'dan geriye İngilizce say!"
    - "Masa kelimesini İngilizce bir cümlede kullan."
    
    Sadece görevi yaz.
    `;
    return this.generateContent(prompt);
  }

  async generatePenalty(targetLanguage: string): Promise<string> {
    const prompt = `Kısa, komik, utandırmayan bir 'Cezalı Görev' ver.
    Örnek: "Bir sonraki tura kadar robot gibi konuş."
    Sadece görevi yaz.
    `;
    return this.generateContent(prompt);
  }
  
  // --- ROUND 2: COLORS ---
  async generateColorTask(colorName: string, targetLanguage: string, difficulty: string): Promise<string> {
    const prompt = `Oyun: 2. Tur (Renklerin Dili).
    Renk: ${colorName}
    Dil: ${targetLanguage}
    
    Bu renkle ilgili bir nesne bulmasını iste YA DA bu rengi içeren bir deyim sor.
    ÖNEMLİ: Cevabı içinde verme! Sadece soruyu sor.
    
    Yanlış: "Blue (Mavi) ile ilgili 'Once in a blue moon' deyimini söyle."
    Doğru: "İçinde 'Mavi' (Blue) geçen bir İngilizce deyim söyle."
    
    Sadece soruyu yaz.
    `;
    return this.generateContent(prompt);
  }

  // --- ROUND 3: THE FINALS (NO ANSWERS IN TEXT) ---
  
  async generateWrongWordPuzzle(targetLanguage: string, difficulty: string): Promise<string> {
    const prompt = `3. Tur Final Sorusu. Dil: ${targetLanguage}.
    Bana 5-6 kelimelik bir cümle ver. Cümlenin içinde BİR kelime mantıken çok saçma (absürt) olsun.
    
    KURALLAR:
    1. Sadece cümleyi yaz.
    2. Hangi kelimenin yanlış olduğunu veya doğru cevabı ASLA yazma.
    3. Parantez içinde açıklama yapma.
    
    Örnek Çıktı:
    "I drink hot bread for breakfast every morning."
    (Burada bread kelimesi saçma ama bunu yazma, sadece cümleyi ver).
    `;
    return this.generateContent(prompt);
  }

  async generateInterviewQuestion(targetLanguage: string, difficulty: string): Promise<string> {
    const prompt = `3. Tur Mülakat. Dil: ${targetLanguage}.
    Yarışmacıya felsefi, düşündürücü derin bir soru sor.
    Cevap verme, sadece soruyu sor.
    Örn: "Zaman makinesi olsaydı geçmişe mi geleceğe mi giderdin?"
    `;
    return this.generateContent(prompt);
  }

  async generateRiddle(targetLanguage: string): Promise<string> {
    const prompt = `3. Tur Final Bilmecesi. Dil: ${targetLanguage}.
    Zeka gerektiren zor bir bilmece sor.
    
    ÇOK ÖNEMLİ:
    - Bilmecenin cevabını ASLA yazma.
    - Sadece soruyu sor.
    `;
    return this.generateContent(prompt);
  }

  // --- NEW GAMES ---

  // Word Chain
  async generateWordChainValidation(word: string, lastLetter: string, language: string): Promise<{isValid: boolean, reason: string}> {
      // For now, simple client side validation
      if (word.toLowerCase().startsWith(lastLetter.toLowerCase())) {
          return { isValid: true, reason: 'Valid' };
      }
      return { isValid: false, reason: `Kelime '${lastLetter}' ile başlamalı.` };
  }

  // Sentence Scramble
  async generateSentenceScramble(language: string, difficulty: string): Promise<{scrambled: string[], original: string}> {
      const prompt = `Dil: ${language}. Seviye: ${difficulty}. Bana 5-7 kelimelik basit bir cümle ver. Sadece cümleyi yaz, başka hiçbir şey yazma.`;
      const sentence = await this.generateContent(prompt);
      const words = sentence.replace(/[^a-zA-Z0-9' ]/g, "").split(' ').filter(w => w);
      const scrambled = words.slice().sort(() => Math.random() - 0.5);
      return { scrambled, original: sentence };
  }


  // --- CERTIFICATION TEST ---
  async generateCertificationTest(language: string, count: number): Promise<TestQuestion[]> {
    const prompt = `Bana ${language} dilinde, CEFR seviyelerini (A1'den C1'e) ölçecek ${count} tane test sorusu oluştur.
    Sorular şu tiplerde olsun:
    1. 'multiple_choice': Çoktan seçmeli gramer veya kelime sorusu.
    2. 'fill_blank': Cümlede boşluk doldurma.
    3. 'translation': Kısa bir Türkçe ifadeyi ${language} diline çevirme.

    JSON formatında bir dizi olarak cevap ver. Her obje "question", "type", "options" (eğer multiple_choice ise), ve "answer" içermeli.
    
    Örnek JSON objesi:
    {
      "question": "He ___ a doctor.",
      "type": "multiple_choice",
      "options": ["is", "are", "am", "be"],
      "answer": "is"
    }
    `;
    
    try {
        const response = await this.ai.models.generateContent({
            model: this.modelId,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            type: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
                            answer: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as TestQuestion[];

    } catch(e) {
        console.error("Test generation failed", e);
        // Fallback with mock data
        return [{
            question: `'elma' kelimesinin ${language} dilindeki karşılığı nedir?`,
            type: 'fill_blank',
            answer: 'apple' // This is a mock, AI would provide real answer
        }];
    }
  }
}
