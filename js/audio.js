window.MemoriumAudio = (function () {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gainVal, when) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = (when ?? c.currentTime);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainVal, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  return {
    unlock() { ensure(); },
    isMuted() { return muted; },
    setMuted(v) { muted = !!v; try { localStorage.setItem("memorium-muted", muted ? "1" : "0"); } catch (_) {} },
    loadMute() {
      try { muted = localStorage.getItem("memorium-muted") === "1"; } catch (_) {}
      return muted;
    },
    flip() { tone(420, 0.08, "triangle", 0.08); },
    match() {
      tone(523.25, 0.12, "sine", 0.1);
      tone(659.25, 0.14, "sine", 0.09, (ensure()?.currentTime || 0) + 0.08);
      tone(783.99, 0.18, "sine", 0.08, (ensure()?.currentTime || 0) + 0.16);
    },
    miss() { tone(180, 0.18, "sawtooth", 0.05); },
    win() {
      const c = ensure();
      if (!c || muted) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => tone(f, 0.22, "sine", 0.1, c.currentTime + i * 0.12));
    },
    click() { tone(660, 0.04, "square", 0.03); }
  };
})();
