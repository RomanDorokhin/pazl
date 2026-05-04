import { useCallback, useRef, useEffect } from 'react';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(
  freq: number,
  type: OscillatorType,
  duration: number,
  volume: number,
  when?: number
) {
  const ctx = getCtx();
  const t = when ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export function useSound() {
  const enabledRef = useRef(true);

  const setEnabled = useCallback((v: boolean) => {
    enabledRef.current = v;
  }, []);

  const click = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(600, 'sine', 0.06, 0.15);
  }, []);

  const move = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(440 + Math.random() * 120, 'triangle', 0.08, 0.12);
  }, []);

  const win = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const t = ctx.currentTime;
    playTone(523, 'sine', 0.2, 0.2, t);
    playTone(659, 'sine', 0.2, 0.2, t + 0.15);
    playTone(784, 'sine', 0.2, 0.2, t + 0.3);
    playTone(1047, 'sine', 0.4, 0.2, t + 0.45);
  }, []);

  const error = useCallback(() => {
    if (!enabledRef.current) return;
    playTone(200, 'sawtooth', 0.12, 0.08);
  }, []);

  const buy = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const t = ctx.currentTime;
    playTone(880, 'sine', 0.1, 0.15, t);
    playTone(1100, 'sine', 0.15, 0.15, t + 0.1);
  }, []);

  const star = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const t = ctx.currentTime;
    playTone(880, 'sine', 0.15, 0.12, t);
    playTone(1109, 'sine', 0.2, 0.12, t + 0.12);
  }, []);

  useEffect(() => {
    return () => {
      // cleanup not strictly needed for one-shots
    };
  }, []);

  return { setEnabled, click, move, win, error, buy, star };
}
