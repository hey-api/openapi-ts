const SOUNDS = {
  'ui-copy': '/sounds/ui-copy.mp3',
  'ui-ready': '/sounds/ui-ready.mp3',
  'ui-select': '/sounds/ui-select.mp3',
  'ui-success': '/sounds/ui-success.mp3',
} as const;

export type SoundId = keyof typeof SOUNDS;

interface Sound {
  play(): void;
}

const bufferCache = new Map<SoundId, AudioBuffer>();
const rawCache = new Map<SoundId, ArrayBuffer>();
const soundCache = new Map<SoundId, Sound>();

let ctxPromise: Promise<AudioContext> | null = null;

function getContext(): Promise<AudioContext> {
  if (!ctxPromise) {
    ctxPromise = (async () => {
      const context = new AudioContext();
      if (context.state === 'suspended') {
        await context.resume();
      }
      context.addEventListener('statechange', () => {
        if (context.state === 'closed') ctxPromise = null;
      });
      return context;
    })();
  }
  return ctxPromise;
}

export function preloadSound(id: SoundId): Sound {
  if (!soundCache.has(id)) {
    fetch(SOUNDS[id])
      .then((r) => r.arrayBuffer())
      .then((buf) => rawCache.set(id, buf))
      .catch(() => {});

    soundCache.set(id, {
      play() {
        getContext().then(async (context) => {
          let buffer = bufferCache.get(id);
          if (!buffer) {
            const raw = rawCache.get(id);
            if (!raw) return;
            buffer = await context.decodeAudioData(raw.slice(0));
            bufferCache.set(id, buffer);
          }
          const source = context.createBufferSource();
          source.buffer = buffer;
          source.connect(context.destination);
          source.start(0);
        });
      },
    });
  }
  return soundCache.get(id)!;
}
