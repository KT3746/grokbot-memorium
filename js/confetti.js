window.MemoriumConfetti = (function () {
  let canvas = null;
  let ctx = null;
  let pieces = [];
  let raf = 0;
  let running = false;

  function ensure() {
    if (canvas) return;
    canvas = document.createElement("canvas");
    canvas.id = "confetti-layer";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "40"
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

  function burst(opts = {}) {
    ensure();
    const count = opts.count || 120;
    const colors = opts.colors || ["#f0b429", "#ffd978", "#7c5cff", "#3dd68c", "#ff6b7a", "#5eead4", "#fff"];
    const cx = opts.x ?? window.innerWidth / 2;
    const cy = opts.y ?? window.innerHeight * 0.35;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      pieces.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        g: 0.18 + Math.random() * 0.12,
        w: 5 + Math.random() * 6,
        h: 7 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        color: colors[(Math.random() * colors.length) | 0],
        life: 90 + (Math.random() * 40) | 0
      });
    }
    if (!running) {
      running = true;
      tick();
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces = pieces.filter((p) => p.life > 0);
    for (const p of pieces) {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rot += p.vr;
      p.life -= 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 30));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (pieces.length) {
      raf = requestAnimationFrame(tick);
    } else {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function clear() {
    pieces = [];
    if (raf) cancelAnimationFrame(raf);
    running = false;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return { burst, clear };
})();
