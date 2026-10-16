// Dedicated Restaurant Kitchen & POS Order Alarm Controller
class OrderAlarmController {
  private audioCtx: AudioContext | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;
  private listeners: Set<(active: boolean) => void> = new Set();

  public getContext(): AudioContext | null {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public subscribe(listener: (active: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.isRunning));
  }

  /**
   * Plays a loud, piercing, urgent 2-burst POS kitchen alarm buzzer
   * Notes: C6 (1046.5Hz) -> E6 (1318.5Hz) -> G6 (1567.98Hz) -> C7 (2093.0Hz)
   */
  public playTone() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      const playBeep = (freq: number, start: number, duration: number, gainVal = 0.75) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Triangle waveform produces rich, penetrating buzzer harmonics
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(gainVal, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      };

      // Burst 1: Rapid rising alert (Kitchen buzzer)
      playBeep(1046.5, now + 0.00, 0.16, 0.8); // C6
      playBeep(1318.5, now + 0.14, 0.16, 0.85); // E6
      playBeep(1567.98, now + 0.28, 0.25, 0.9); // G6

      // Burst 2: High urgency repeat
      playBeep(1318.5, now + 0.58, 0.16, 0.85); // E6
      playBeep(1567.98, now + 0.72, 0.18, 0.9); // G6
      playBeep(2093.0, now + 0.90, 0.40, 1.0);  // High C7
    } catch (e) {
      console.error('Failed to play alarm tone:', e);
    }
  }

  /**
   * Starts ringing continuously every 1.8 seconds until stopped
   */
  public startAlarm() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.notify();

    // Play first tone immediately
    this.playTone();

    // Ring continuously every 1.8 seconds
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.playTone();
      }
    }, 1800);
  }

  /**
   * Stops the continuous ringing
   */
  public stopAlarm() {
    if (!this.isRunning && !this.intervalId) return;
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.notify();
  }

  public isAlarmActive(): boolean {
    return this.isRunning;
  }
}

export const orderAlarm = new OrderAlarmController();
