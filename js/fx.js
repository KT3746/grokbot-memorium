window.MemoriumFX = (function () {
  let canvas = null;
  let ctx = null;
  let sparks = [];
  let shocks = [];
  let raf = 0;
  let running = false;

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
    ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparks = sparks.filter((p) => p.life > 0);
    shocks = shocks.filter((s) => s.life > 0);

    for (const s of shocks) {
      const t = 1 - s.life / s.max;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * t, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${(1 - t) * 0.55})`;
      ctx.lineWidth = 3 * (1 - t);
      ctx.stroke();
      s.life -= 1;
    }

    for (const p of sparks) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.vx *= 0.98;
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
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ensure();
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const cols = color ? [color] : ["#fff", "#f0b429", "#7dffb3", "#7c5cff"];
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 4.5;
      sparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1,
        size: 1.2 + Math.random() * 2.2,
        color: cols[(Math.random() * cols.length) | 0],
        life: 28 + (Math.random() * 18) | 0,
        max: 46
      });
    }
    shocks.push({ x: cx, y: cy, r: Math.max(r.width, r.height) * 0.7, life: 18, max: 18 });
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
