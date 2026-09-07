window.MemoriumAudio = (function () {
  let ctx = null;
  let muted = false;
  let master = null;
  let sfxGain = null;
  let ambGain = null;
  let ambNodes = [];
  let ambRunning = false;
  let ambWanted = false;
  let ambLevel = 0.045;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.95;
      sfxGain.connect(master);
      ambGain = ctx.createGain();
      ambGain.gain.value = 0.0001;
      ambGain.connect(master);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function destSfx() {
    ensure();
    return sfxGain || master || ctx.destination;
  }

  function tone(freq, dur, type, gainVal, when, slideTo) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = when ?? c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 4200;
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainVal, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(filter);
    filter.connect(g);
    g.connect(destSfx());
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  function noiseBurst(dur, gainVal, when) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = when ?? c.currentTime;
    const frames = Math.max(1, (dur * c.sampleRate) | 0);
    const buf = c.createBuffer(1, frames, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 900;
    g.gain.setValueAtTime(gainVal, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(destSfx());
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  function stopAmbientNodes() {
    ambNodes.forEach((n) => {
      try { n.stop(); } catch (_) {}
      try { n.disconnect(); } catch (_) {}
    });
    ambNodes = [];
    ambRunning = false;
  }

  function startAmbientGraph() {
    const c = ensure();
    if (!c || muted || ambRunning) return;
    const freqs = [110, 164.81, 220, 277.18];
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 680;
    filter.Q.value = 0.7;
    filter.connect(ambGain);

    freqs.forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      const lfo = c.createOscillator();
      const lfoG = c.createGain();
      osc.type = i % 2 ? "triangle" : "sine";
      osc.frequency.value = f;
      g.gain.value = 0.12 / freqs.length;
      lfo.frequency.value = 0.05 + i * 0.03;
      lfoG.gain.value = 0.04;
      lfo.connect(lfoG);
      lfoG.connect(g.gain);
      osc.connect(g);
      g.connect(filter);
      osc.start();
      lfo.start();
      ambNodes.push(osc, lfo);
    });

    // soft shimmer noise bed
    const frames = c.sampleRate * 2;
    const buf = c.createBuffer(1, frames, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
    const noise = c.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const nf = c.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.value = 420;
    nf.Q.value = 0.6;
    const ng = c.createGain();
    ng.gain.value = 0.035;
    noise.connect(nf);
    nf.connect(ng);
    ng.connect(filter);
    noise.start();
    ambNodes.push(noise);

    ambRunning = true;
    const target = ambLevel;
    ambGain.gain.cancelScheduledValues(c.currentTime);
    ambGain.gain.setValueAtTime(Math.max(ambGain.gain.value, 0.0001), c.currentTime);
    ambGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, target), c.currentTime + 1.2);
  }

  function applyAmbientState() {
    const c = ensure();
    if (!c) return;
    if (muted || !ambWanted) {
      if (ambRunning) {
        ambGain.gain.cancelScheduledValues(c.currentTime);
        ambGain.gain.setValueAtTime(Math.max(ambGain.gain.value, 0.0001), c.currentTime);
        ambGain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
        setTimeout(stopAmbientNodes, 700);
      }
      return;
    }
    startAmbientGraph();
    ambGain.gain.cancelScheduledValues(c.currentTime);
    ambGain.gain.setValueAtTime(Math.max(ambGain.gain.value, 0.0001), c.currentTime);
    ambGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, ambLevel), c.currentTime + 0.8);
  }

  return {
    unlock() { ensure(); },
    isMuted() { return muted; },
    setMuted(v) {
      muted = !!v;
      try { localStorage.setItem("memorium-muted", muted ? "1" : "0"); } catch (_) {}
      applyAmbientState();
    },
    loadMute() {
      try { muted = localStorage.getItem("memorium-muted") === "1"; } catch (_) {}
      return muted;
    },
    setAmbient(on) {
      ambWanted = !!on;
      applyAmbientState();
    },
    setAmbientLevel(level) {
      ambLevel = Math.max(0.0001, level);
      if (ambRunning && !muted && ambWanted && ctx) {
        ambGain.gain.cancelScheduledValues(ctx.currentTime);
        ambGain.gain.linearRampToValueAtTime(ambLevel, ctx.currentTime + 0.4);
      }
    },
    flip() {
      tone(520, 0.06, "triangle", 0.06);
      noiseBurst(0.04, 0.03);
    },
    match() {
      const c = ensure();
      if (!c || muted) return;
      const t = c.currentTime;
      tone(523.25, 0.11, "sine", 0.1, t);
      tone(659.25, 0.13, "triangle", 0.09, t + 0.07);
      tone(783.99, 0.2, "sine", 0.1, t + 0.14);
      tone(1046.5, 0.28, "sine", 0.07, t + 0.22);
    },
    miss() {
      tone(220, 0.16, "sawtooth", 0.045, undefined, 110);
      noiseBurst(0.08, 0.025);
    },
    win() {
      const c = ensure();
      if (!c || muted) return;
      const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];
      notes.forEach((f, i) => tone(f, 0.26, i % 2 ? "triangle" : "sine", 0.1, c.currentTime + i * 0.1));
    },
    click() { tone(740, 0.035, "square", 0.025); },
    deal() { tone(380 + Math.random() * 40, 0.04, "triangle", 0.03); }
  };
})();
