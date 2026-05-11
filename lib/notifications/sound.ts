// /**
//  * Notification sound utility (browser-side only).
//  * Import and use inside React components / hooks.
//  */

// export type SoundType = 'default' | 'success' | 'warning' | 'critical' | 'message'

// const SOUND_URLS: Record<SoundType, string> = {
//   default:  '/sounds/notification.mp3',
//   success:  '/sounds/success.mp3',
//   warning:  '/sounds/warning.mp3',
//   critical: '/sounds/critical.mp3',
//   message:  '/sounds/message.mp3',
// }

// let audioContext: AudioContext | null = null
// const audioCache: Record<string, AudioBuffer> = {}

// function getAudioContext(): AudioContext {
//   if (!audioContext) audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
//   return audioContext
// }

// export async function preloadSounds(): Promise<void> {
//   if (typeof window === 'undefined') return
//   const ctx = getAudioContext()
//   await Promise.all(
//     Object.entries(SOUND_URLS).map(async ([key, url]) => {
//       try {
//         const res    = await fetch(url)
//         const buf    = await res.arrayBuffer()
//         audioCache[key] = await ctx.decodeAudioData(buf)
//       } catch { /* sound file missing — silent fail */ }
//     })
//   )
// }

// export async function playSound(type: SoundType = 'default', volume = 0.6): Promise<void> {
//   if (typeof window === 'undefined') return
//   try {
//     const ctx    = getAudioContext()
//     if (ctx.state === 'suspended') await ctx.resume()

//     if (audioCache[type]) {
//       const source      = ctx.createBufferSource()
//       const gainNode    = ctx.createGain()
//       source.buffer     = audioCache[type]
//       gainNode.gain.value = volume
//       source.connect(gainNode)
//       gainNode.connect(ctx.destination)
//       source.start()
//       return
//     }

//     // Fallback: generate beep via Web Audio API
//     const oscillator  = ctx.createOscillator()
//     const gainNode    = ctx.createGain()
//     oscillator.connect(gainNode)
//     gainNode.connect(ctx.destination)

//     const freq: Record<SoundType, number> = {
//       default: 880, success: 1047, warning: 660, critical: 440, message: 784,
//     }
//     oscillator.frequency.value = freq[type]
//     oscillator.type            = 'sine'
//     gainNode.gain.setValueAtTime(volume, ctx.currentTime)
//     gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
//     oscillator.start(ctx.currentTime)
//     oscillator.stop(ctx.currentTime + 0.3)
//   } catch (err) {
//     console.warn('[sound] playback error', err)
//   }
// }

// export function isSoundEnabled(): boolean {
//   if (typeof window === 'undefined') return false
//   return localStorage.getItem('notificationSound') !== 'false'
// }

// export function setSoundEnabled(enabled: boolean): void {
//   if (typeof window === 'undefined') return
//   localStorage.setItem('notificationSound', enabled ? 'true' : 'false')
// }

export interface SoundConfig {
  enabled: boolean;
  volume: number;
  soundUrl: string;
}

const defaultSounds: Record<string, string> = {
  notification: '/sounds/notification.mp3',
  message: '/sounds/message.mp3',
  alert: '/sounds/alert.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
};

export function getSoundUrl(type: string): string {
  return defaultSounds[type] || defaultSounds.notification;
}

// Client-side function
export function playNotificationSound(type: string, volume = 0.5): void {
  if (typeof window === 'undefined') return;

  const audio = new Audio(getSoundUrl(type));
  audio.volume = Math.max(0, Math.min(1, volume));
  audio.play().catch(() => {
    // Audio play failed, likely due to browser autoplay policy
  });
}
