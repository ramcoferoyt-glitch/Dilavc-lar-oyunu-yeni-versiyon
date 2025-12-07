
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  audioContext: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  microphoneStream: MediaStream | null = null;
  dataArray: Uint8Array | null = null;
  
  isMicrophoneActive = signal(false);
  currentVolume = signal(0); // 0 to 100
  
  private tensionInterval: any = null;
  private volumeInterval: any = null;
  private spinOscillator: OscillatorNode | null = null;
  private spinGain: GainNode | null = null;

  constructor() {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  // --- MICROPHONE HANDLING ---

  async startMicrophone() {
    if (!this.audioContext) return;
    try {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.microphoneStream = stream;
        this.isMicrophoneActive.set(true);

        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        this.startVolumeAnalysis();

    } catch (err) {
        console.error('Microphone access denied:', err);
        this.isMicrophoneActive.set(false);
    }
  }

  stopMicrophone() {
      if (this.microphoneStream) {
          this.microphoneStream.getTracks().forEach(track => track.stop());
          this.microphoneStream = null;
      }
      if (this.volumeInterval) {
          clearInterval(this.volumeInterval);
      }
      this.isMicrophoneActive.set(false);
      this.currentVolume.set(0);
  }

  private startVolumeAnalysis() {
      if (!this.analyser || !this.dataArray) return;

      this.volumeInterval = setInterval(() => {
          if (this.analyser && this.dataArray) {
              this.analyser.getByteFrequencyData(this.dataArray);
              
              // Calculate average volume
              let sum = 0;
              for (let i = 0; i < this.dataArray.length; i++) {
                  sum += this.dataArray[i];
              }
              const average = sum / this.dataArray.length;
              
              // Normalize to 0-100 range roughly
              const vol = average > 10 ? average : 0; 
              this.currentVolume.set(vol);
          }
      }, 100);
  }

  // --- PREMIUM SYNTHESIZER FX (CLEAN & PRO) ---

  private playTone(freq: number, type: OscillatorType, dur: number, vol = 0.1, when = 0, ramp = true) {
     if(!this.audioContext) return;
     if(this.audioContext.state === 'suspended') this.audioContext.resume();

     const t = this.audioContext.currentTime + when;
     const o = this.audioContext.createOscillator();
     const g = this.audioContext.createGain();
     
     o.type = type;
     o.frequency.setValueAtTime(freq, t);
     
     // Envelope
     g.gain.setValueAtTime(0, t);
     g.gain.linearRampToValueAtTime(vol, t + 0.01); // Smooth Attack
     
     if(ramp) {
         g.gain.exponentialRampToValueAtTime(0.001, t + dur); // Decay
     } else {
         g.gain.linearRampToValueAtTime(0, t + dur);
     }

     o.connect(g); 
     g.connect(this.audioContext.destination);
     
     o.start(t); 
     o.stop(t + dur + 0.1);
  }

  playOrbClick() {
    this.playTone(1200, 'sine', 0.1, 0.05);
  }

  playTick() { 
    this.playTone(800, 'sine', 0.05, 0.02); 
  }
  
  playChatSound() {
      this.playTone(600, 'sine', 0.1, 0.05);
      this.playTone(800, 'sine', 0.1, 0.03, 0.05);
  }
  
  playSuccess() { 
      const now = 0;
      this.playTone(523.25, 'sine', 0.6, 0.2, now); // C5
      this.playTone(659.25, 'sine', 0.6, 0.2, now + 0.1); // E5
      this.playTone(783.99, 'sine', 0.8, 0.2, now + 0.2); // G5
      this.playTone(1046.50, 'sine', 1.0, 0.1, now + 0.3); // C6
  }
  
  playFail() { 
      const now = 0;
      this.playTone(150, 'sine', 0.4, 0.5, now);
      this.playTone(145, 'triangle', 0.4, 0.3, now); 
  }

  playAlarm() {
      if(!this.audioContext) return;
      for(let i=0; i<3; i++) {
        this.playTone(800, 'sine', 0.15, 0.2, i*0.25);
        this.playTone(400, 'sine', 0.15, 0.2, i*0.25 + 0.1);
      }
  }

  playVictory() {
      const t = 0;
      [523, 659, 783, 1046, 1318, 1568].forEach((f, i) => this.playTone(f, 'triangle', 1.5, 0.1, i*0.1));
      this.playTone(261, 'sine', 2.0, 0.3, 0.5);
      this.playTone(130, 'square', 1.5, 0.1, 0.5); 
      
      setTimeout(() => {
          this.playTone(2000, 'sine', 0.1, 0.05, 0);
          this.playTone(2500, 'sine', 0.1, 0.05, 0.1);
          this.playTone(3000, 'sine', 0.1, 0.05, 0.2);
      }, 1000);
  }

  playGameStart() {
      if(!this.audioContext) return;
      const t = this.audioContext.currentTime;
      const o = this.audioContext.createOscillator();
      const g = this.audioContext.createGain();
      
      o.type = 'sine';
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 2); 
      
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.5, t + 0.1);
      g.gain.linearRampToValueAtTime(0, t + 2);

      o.connect(g); 
      g.connect(this.audioContext.destination);
      o.start(t); 
      o.stop(t + 2.1);
  }

  // --- Spin Bottle Sound (Ratcheting effect) ---
  playSpinLoop() {
      if(!this.audioContext) return;
      if(this.audioContext.state === 'suspended') this.audioContext.resume();
      this.stopSpinLoop(); // Ensure no duplicates

      const t = this.audioContext.currentTime;
      this.spinOscillator = this.audioContext.createOscillator();
      this.spinGain = this.audioContext.createGain();

      this.spinOscillator.type = 'sawtooth';
      this.spinOscillator.frequency.setValueAtTime(20, t); // Low rumble click
      this.spinOscillator.frequency.linearRampToValueAtTime(5, t + 3); // Slow down

      // Create a rhythmic clicking
      const lfo = this.audioContext.createOscillator();
      lfo.type = 'square';
      lfo.frequency.setValueAtTime(15, t); // Clicks per second
      lfo.frequency.linearRampToValueAtTime(2, t + 3); // Slowing down

      const lfoGain = this.audioContext.createGain();
      lfoGain.gain.value = 1000;

      lfo.connect(lfoGain);
      // We can't easily do complex FM synthesis here simply, let's stick to a simple modulated noise or tone
      // Simpler approach: Just play rapid ticks
      
      this.spinOscillator.disconnect(); // Reset
      
      // Recursive tick function to simulate slowing down wheel
      let tickRate = 50; // ms
      let elapsed = 0;
      
      const tick = () => {
          if(!this.spinOscillator) return; // Stopped
          this.playTone(800, 'square', 0.05, 0.1);
          elapsed += tickRate;
          tickRate += (elapsed / 200); // Exponential slow down
          if (tickRate < 500) {
              setTimeout(tick, tickRate);
          }
      };
      
      // Just set a flag object to cancel
      this.spinOscillator = {} as any; // Marker that it's running
      tick();
  }

  stopSpinLoop() {
      this.spinOscillator = null;
  }

  playTension() {
      this.stopTension();
      const beat = () => {
          this.playTone(60, 'sine', 0.15, 0.4, 0);      
          this.playTone(100, 'triangle', 0.05, 0.1, 0); 
          setTimeout(() => { this.playTone(55, 'sine', 0.2, 0.3, 0); }, 250);
      };
      beat(); 
      this.tensionInterval = setInterval(beat, 2000); 
  }

  stopTension() {
      if(this.tensionInterval) {
          clearInterval(this.tensionInterval);
          this.tensionInterval = null;
      }
  }
}
