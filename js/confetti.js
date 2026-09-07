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
    const count = opts.count || 160;
    const colors = opts.colors || ["#f0b429", "#ffd978", "#7c5cff", "#3dd68c", "#ff6b7a", "#5eead4", "#fff", "#00f5ff"];
    const cx = opts.x ?? window.innerWidth / 2;
    const cy = opts.y ?? window.innerHeight * 0.32;
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
      const speed = 5 + Math.random() * 11;
      pieces.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
        vy: Math.sin(angle) * speed,
        g: 0.16 + Math.random() * 0.14,
        w: 4 + Math.random() * 7,
        h: 6 + Math.random() * 10,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        color: colors[(Math.random() * colors.length) | 0],
        life: 100 + (Math.random() * 50) | 0,
        kind: Math.random() > 0.72 ? "circle" : "rect"
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
      p.vx *= 0.992;
      p.rot += p.vr;
      p.life -= 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 35));
      ctx.fillStyle = p.color;
      if (p.kind === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
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
