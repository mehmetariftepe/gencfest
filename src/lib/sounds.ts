// Kapı ekranı sesleri: dosya indirmeden Web Audio ile üretilir (çevrimdışı da çalışır).
// Tarayıcılar sesi ancak bir kullanıcı dokunuşundan sonra açtığı için unlockAudio() "Okutmaya başla" düğmesinde çağrılır.
let ctx: AudioContext | null = null;

export function unlockAudio() {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx ??= new AC();
  void ctx.resume();
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number) {
  if (!ctx) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

/** Geçerli: yükselen iki tiz bip. */
export function playOk() {
  tone(988, 0, 0.12, "sine", 0.5);
  tone(1480, 0.12, 0.22, "sine", 0.5);
}

/** Geçersiz/kullanılmış: üç kalın, sert bip. */
export function playError() {
  for (let i = 0; i < 3; i++) tone(196, i * 0.18, 0.14, "square", 0.35);
}
