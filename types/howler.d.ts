/**
 * Type definitions for Howler.js
 * Temporary declaration until @types/howler is installed
 */

declare module 'howler' {
  export interface HowlOptions {
    src?: string | string[];
    volume?: number;
    html5?: boolean;
    loop?: boolean;
    preload?: boolean | 'metadata' | 'auto';
    autoplay?: boolean;
    mute?: boolean;
    rate?: number;
    pool?: number;
    format?: string[];
    xhr?: {
      method?: string;
      headers?: Record<string, string>;
      withCredentials?: boolean;
    };
    onload?: () => void;
    onloaderror?: (id: number, error: any) => void;
    onplay?: (id: number) => void;
    onplayerror?: (id: number, error: any) => void;
    onend?: (id: number) => void;
    onpause?: (id: number) => void;
    onstop?: (id: number) => void;
    onmute?: (id: number) => void;
    onvolume?: (id: number) => void;
    onrate?: (id: number) => void;
    onseek?: (id: number) => void;
    onfade?: (id: number) => void;
  }

  export class Howl {
    constructor(options: HowlOptions);
    
    play(id?: number | string): number;
    pause(id?: number): Howl;
    stop(id?: number): Howl;
    mute(muted?: boolean, id?: number): Howl | boolean;
    volume(volume?: number, id?: number): Howl | number;
    fade(from: number, to: number, duration: number, id?: number): Howl;
    rate(rate?: number, id?: number): Howl | number;
    seek(seek?: number, id?: number): Howl | number;
    loop(loop?: boolean, id?: number): Howl | boolean;
    playing(id?: number): boolean;
    duration(id?: number): number;
    state(): 'unloaded' | 'loading' | 'loaded';
    load(): Howl;
    unload(): void;
    on(event: string, listener: (...args: any[]) => void, id?: number): Howl;
    off(event: string, listener?: (...args: any[]) => void, id?: number): Howl;
    once(event: string, listener: (...args: any[]) => void, id?: number): Howl;
  }

  export class Howler {
    static mute(muted?: boolean): boolean;
    static volume(volume?: number): number;
    static codecs(ext: string): boolean;
    static ctx: AudioContext;
    static masterGain: GainNode;
    static noAudio: boolean;
    static usingWebAudio: boolean;
    static autoSuspend: boolean;
    static autoUnlock: boolean;
  }
}

