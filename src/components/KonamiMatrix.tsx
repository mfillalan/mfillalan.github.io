import { useEffect, useState, useRef, useCallback } from 'react';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
const SYMBOLS = ['↑','↑','↓','↓','←','→','←','→','B','A'];

const MESSAGES = [
  'Wake up, Neo...',
  'The Matrix has you...',
  'Follow the white rabbit.',
  'Knock, knock, Neo.',
];

const CHAR_SPEED = 55;
const LINE_PAUSE = 700;
// Wait for the CRT power-on animation (see .konami-overlay in index.css)
// to settle before any characters are typed. Otherwise text appears while
// the screen is still squished into a horizontal line.
const POWER_ON_DELAY = 600;

type ScatterStyle = { tx: number; ty: number; rot: number };

function playKnock() {
  try {
    const ctx = new AudioContext();
    const knock = (time: number) => {
      // Noise burst for the sharp impact transient
      const bufLen = ctx.sampleRate * 0.22;
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / data.length;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.5);
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 320;
      filter.Q.value = 3;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(4, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

      src.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      src.start(time);

      // Low-frequency sine for door-body thud
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.2);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(2.5, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.28);
    };

    knock(ctx.currentTime);
    knock(ctx.currentTime + 0.5);
    setTimeout(() => ctx.close(), 1400);
  } catch {
    // AudioContext not available; silently skip.
  }
}

export default function KonamiMatrix() {
  const [active, setActive] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [failing, setFailing] = useState(false);
  const [scatter, setScatter] = useState<ScatterStyle[]>([]);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Refs so the single keydown listener always sees current values
  const progressRef = useRef(0);
  const failingRef = useRef(false);
  const activeRef = useRef(false);

  const dismiss = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    activeRef.current = false;
    setActive(false);
    setLines([]);
  }, []);

  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => { failingRef.current = failing; }, [failing]);
  useEffect(() => { activeRef.current = active; }, [active]);

  // Single stable keydown listener. Refs avoid stale closure issues.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeRef.current) { dismiss(); return; }
      if (failingRef.current) return;

      const prog = progressRef.current;
      if (e.key === KONAMI[prog]) {
        const next = prog + 1;
        if (next === KONAMI.length) {
          progressRef.current = 0;
          setProgress(0);
          setLines([]);
          activeRef.current = true;
          setActive(true);
        } else {
          progressRef.current = next;
          setProgress(next);
        }
      } else if (prog > 0) {
        // Wrong key. Scatter the HUD.
        failingRef.current = true;
        setFailing(true);
        const styles: ScatterStyle[] = SYMBOLS.map(() => ({
          tx: (Math.random() - 0.5) * 320,
          ty: -(Math.random() * 160 + 60),
          rot: (Math.random() - 0.5) * 720,
        }));
        setScatter(styles);
        const t = setTimeout(() => {
          failingRef.current = false;
          progressRef.current = 0;
          setFailing(false);
          setProgress(0);
          setScatter([]);
        }, 580);
        timersRef.current.push(t);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dismiss]);

  // External activation channel: components can dispatch a 'konami:activate'
  // CustomEvent on window to open the matrix without going through the
  // arrow-key sequence. Used by the long-press handler on the footer hint
  // so mobile / touch devices have a way in.
  useEffect(() => {
    const onActivate = () => {
      if (activeRef.current) return;
      progressRef.current = 0;
      setProgress(0);
      setLines([]);
      activeRef.current = true;
      setActive(true);
    };
    window.addEventListener('konami:activate', onActivate);
    return () => window.removeEventListener('konami:activate', onActivate);
  }, []);

  // Typewriter effect when overlay opens
  useEffect(() => {
    if (!active) return;

    let elapsed = POWER_ON_DELAY;
    MESSAGES.forEach((msg, lineIndex) => {
      for (let charIndex = 1; charIndex <= msg.length; charIndex++) {
        const chunk = msg.slice(0, charIndex);
        const t = setTimeout(() => {
          setLines(prev => {
            const next = [...prev];
            next[lineIndex] = chunk;
            return next;
          });
        }, elapsed);
        timersRef.current.push(t);
        elapsed += CHAR_SPEED;
      }
      elapsed += LINE_PAUSE;
    });

    // After typing finishes: wait 2s, play knock-knock, then dismiss
    const knockDelay = elapsed + 2000;
    const knockTimer = setTimeout(() => {
      playKnock();
      const dismissTimer = setTimeout(dismiss, 1400);
      timersRef.current.push(dismissTimer);
    }, knockDelay);
    timersRef.current.push(knockTimer);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [active, dismiss]);

  const lastLineComplete =
    lines.length > 0 && lines[lines.length - 1] === MESSAGES[lines.length - 1];
  const allComplete = lines.length === MESSAGES.length && lastLineComplete;

  return (
    <>
      {/* Progress HUD. Only reveal after ↑↑. */}
      {progress >= 2 && (
        <div className="konami-hud">
          {SYMBOLS.map((sym, i) => {
            const done = i < progress;
            const scatterStyle =
              failing && scatter[i]
                ? ({
                    '--tx': `${scatter[i].tx}px`,
                    '--ty': `${scatter[i].ty}px`,
                    '--rot': `${scatter[i].rot}deg`,
                  } as React.CSSProperties)
                : {};
            return (
              <span
                key={i}
                className={[
                  'konami-key',
                  done ? 'konami-key-done' : '',
                  failing ? 'konami-key-scatter' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={scatterStyle}
              >
                {sym}
              </span>
            );
          })}
        </div>
      )}

      {/* Matrix overlay */}
      {active && (
        <div
          className="konami-overlay"
          onClick={dismiss}
          role="dialog"
          aria-modal="true"
        >
          <div className="konami-terminal">
            {lines.map((line, i) => {
              const isCurrentLine = i === lines.length - 1 && !allComplete;
              return (
                <p key={i} className="konami-line">
                  {line}
                  {isCurrentLine && <span className="konami-cursor">█</span>}
                </p>
              );
            })}
            {allComplete && <span className="konami-cursor">█</span>}
          </div>
          <p className="konami-dismiss">[press any key or click to dismiss]</p>
        </div>
      )}
    </>
  );
}
