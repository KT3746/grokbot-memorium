window.MemoriumFX = (function () {
  let canvas = null;
  let ctx = null;
  let sparks = [];
  let shocks = [];
  let raf = 0;
  let running = false;

  function reduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function ensure() {
    if (canvas) return;
    canvas = document.createElement("canvas");
    canvas.id = "fx-layer";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "35"
    });
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d", { alpha: true });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparks = sparks.filter((p) => p.life > 0);
    shocks = shocks.filter((s) => s.life > 0);

    for (const s of shocks) {
      const t = 1 - s.life / s.max;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (0.35 + t * 0.9), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${(1 - t) * 0.6})`;
      ctx.lineWidth = 3.2 * (1 - t);
      ctx.stroke();
      s.life -= 1;
    }

    for (const p of sparks) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.09;
      p.vx *= 0.985;
      p.life -= 1;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (sparks.length || shocks.length) {
      raf = requestAnimationFrame(tick);
    } else {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function kick() {
    if (!running) {
      running = true;
      raf = requestAnimationFrame(tick);
    }
  }

  function sparkAt(el, color) {
    if (!el || reduceMotion()) return;
    ensure();
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const cols = color ? [color] : ["#fff", "#f0b429", "#7dffb3", "#7c5cff", "#ff7ad9"];
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.8 + Math.random() * 5.2;
      sparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1.2,
        size: 1.1 + Math.random() * 2.4,
        color: cols[(Math.random() * cols.length) | 0],
        life: 30 + ((Math.random() * 20) | 0),
        max: 50
      });
    }
    shocks.push({
      x: cx,
      y: cy,
      r: Math.max(r.width, r.height) * 0.85,
      life: 20,
      max: 20
    });
    kick();
  }

  function clear() {
    sparks = [];
    shocks = [];
    if (raf) cancelAnimationFrame(raf);
    running = false;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return { sparkAt, clear };
})();
