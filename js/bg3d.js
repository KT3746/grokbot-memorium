/**
 * Fundo ambiente Three.js do MEMÓRIUM.
 * Cartas, HUD e toque continuam em HTML/CSS — aqui só o cenário atrás.
 * Three.js entra via importmap ("three" → js/vendor/three.module.js).
 */
let THREE;

export const FAIL_PT =
  "Não foi possível iniciar o fundo 3D. O MEMÓRIUM continua no visual clássico (2D).";

const IDLE_MS = 45000;

const PAL = {
  cosmos: {
    bg: 0x0a1024,
    fog: 0x12183a,
    hemi: 0xd7e7ff,
    hemiG: 0x1a1040,
    sun: 0xfff1c2,
    fill: 0x7c5cff,
    a: 0x8eb6ff,
    b: 0x7c5cff,
    c: 0xf0b429,
    d: 0xd7e7ff,
    em: 0x4c7cff
  },
  flora: {
    bg: 0x08140e,
    fog: 0x0f2a1c,
    hemi: 0xe8ffd8,
    hemiG: 0x123528,
    sun: 0xfff3c4,
    fill: 0x34d399,
    a: 0x7dffb3,
    b: 0x2ea35a,
    c: 0xffd0dc,
    d: 0xe8ffa8,
    em: 0x1f9a58
  },
  runas: {
    bg: 0x180c08,
    fog: 0x2a1520,
    hemi: 0xffe7a3,
    hemiG: 0x3a140e,
    sun: 0xffc07a,
    fill: 0xe0562a,
    a: 0xff8a5b,
    b: 0xf0b429,
    c: 0xead4ff,
    d: 0xffc8a8,
    em: 0xe0562a
  },
  neon: {
    bg: 0x0a0220,
    fog: 0x140018,
    hemi: 0x9affff,
    hemiG: 0x3a0860,
    sun: 0xff9af5,
    fill: 0x00f5ff,
    a: 0x00f5ff,
    b: 0xff00e5,
    c: 0xfff38a,
    d: 0xd4a8ff,
    em: 0xff00e5
  },
  comida: {
    bg: 0x1c0808,
    fog: 0x3e120e,
    hemi: 0xffe7a3,
    hemiG: 0x7a2e1a,
    sun: 0xffd166,
    fill: 0xef476f,
    a: 0xffd166,
    b: 0xef476f,
    c: 0xc8ffe4,
    d: 0xffc4b0,
    em: 0xe04a2a
  }
};

function detectLowEnd() {
  const ua = (navigator.userAgent || "").toLowerCase();
  const mobileUA = /android|iphone|ipad|ipod|mobile|opera mini|iemobile/.test(ua);
  const narrow = window.innerWidth <= 500;
  const dpr = window.devicePixelRatio || 1;
  const touch = "ontouchstart" in window;
  const cores = navigator.hardwareConcurrency || 4;
  return mobileUA || narrow || cores <= 4 || (touch && dpr >= 2 && window.innerWidth <= 900);
}

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function showFail(el, msg) {
  if (!el) return;
  el.hidden = false;
  el.removeAttribute("hidden");
  el.textContent = msg;
  window.setTimeout(() => {
    if (el && el.textContent === msg) {
      el.hidden = true;
      el.setAttribute("hidden", "");
    }
  }, 8000);
}

function useFallback(view3d, failEl, msg) {
  if (msg) showFail(failEl, msg);
  document.body.classList.add("renderer-canvas");
  document.body.classList.remove("renderer-webgl", "has-webgl-bg");
  if (view3d) {
    view3d.hidden = true;
    view3d.setAttribute("hidden", "");
  }
}

function mat(hex, extra = {}) {
  const { emissive = 0x000000, em = 0, opacity = 1 } = extra;
  return new THREE.MeshLambertMaterial({
    color: hex,
    emissive,
    emissiveIntensity: em,
    flatShading: true,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1
  });
}

function pickTheme() {
  const id = document.documentElement.dataset.theme || "cosmos";
  return PAL[id] ? id : "cosmos";
}

class AmbientBg {
  constructor(view) {
    this.view = view;
    this.ok = false;
    this.playing = false;
    this.paused = false;
    this.raf = 0;
    this.time = 0;
    this.lastNow = 0;
    this.lastActivity = performance.now();
    this.themeId = pickTheme();
    this.floats = [];
    this.motes = [];
    this.look = PAL[this.themeId];
    this.targetLook = PAL[this.themeId];
    this.colorA = new THREE.Color();
    this.colorB = new THREE.Color();

    this.reducedMotion = false;
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.reducedMotion = !!mq.matches;
      if (mq.addEventListener) {
        mq.addEventListener("change", (e) => {
          this.reducedMotion = !!e.matches;
          this.lowFx = this.isLowEnd || this.reducedMotion;
          if (this.reducedMotion) this.stopLoop(true);
          else {
            this.paused = false;
            this.startLoop();
          }
        });
      }
    } catch (_) {}

    this.isLowEnd = detectLowEnd();
    this.lowFx = this.isLowEnd || this.reducedMotion;
    this.boot();
  }

  boot() {
    if (!THREE || !THREE.WebGLRenderer) throw new Error("no-three");
    if (!this.view) throw new Error("no-view3d");
    this.setup();
    this.fit();
    this.applyLook(this.look, 1);
    this.renderer.render(this.scene, this.camera);
    this.ok = true;
    this.bind();
    if (!this.reducedMotion) this.startLoop();
  }

  setup() {
    const look = this.look;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(look.bg);
    this.scene.fog = new THREE.FogExp2(look.fog, this.isLowEnd ? 0.042 : 0.026);

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.2, 80);
    this.camera.position.set(0, 0.35, 13.5);
    this.camera.lookAt(0, 0, 0);

    const mobile = this.isLowEnd;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.view,
      antialias: false,
      alpha: false,
      powerPreference: mobile ? "low-power" : "high-performance"
    });
    const dprCap = this.lowFx ? 1 : 1.5;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = false;

    this.hemi = new THREE.HemisphereLight(look.hemi, look.hemiG, 1.05);
    this.scene.add(this.hemi);
    this.amb = new THREE.AmbientLight(0xffffff, 0.38);
    this.scene.add(this.amb);
    this.sunL = new THREE.DirectionalLight(look.sun, 0.95);
    this.sunL.position.set(-6, 8, 10);
    this.sunL.castShadow = false;
    this.scene.add(this.sunL);
    this.fill = new THREE.DirectionalLight(look.fill, 0.32);
    this.fill.position.set(7, -4, 6);
    this.scene.add(this.fill);

    this.world = new THREE.Group();
    this.scene.add(this.world);

    this.geos = {
      ico: new THREE.IcosahedronGeometry(1, 0),
      oct: new THREE.OctahedronGeometry(1, 0),
      tet: new THREE.TetrahedronGeometry(1, 0),
      dod: new THREE.DodecahedronGeometry(1, 0),
      cone: new THREE.ConeGeometry(0.62, 1.35, 5),
      box: new THREE.BoxGeometry(1, 1, 1),
      slab: new THREE.BoxGeometry(0.72, 1.15, 0.12),
      shard: new THREE.BoxGeometry(0.16, 1.45, 0.22),
      blob: new THREE.SphereGeometry(0.72, 6, 5),
      torus: new THREE.TorusGeometry(0.72, 0.22, 6, 8),
      mote: new THREE.IcosahedronGeometry(0.12, 0)
    };

    this.buildField(this.themeId);

    this._onResize = () => this.fit();
    window.addEventListener("resize", this._onResize, { passive: true });
    if (typeof ResizeObserver !== "undefined" && this.view.parentElement) {
      this._ro = new ResizeObserver(() => this.fit());
      this._ro.observe(this.view.parentElement);
    }
  }

  clearGroup(list) {
    const seen = new Set();
    for (const mesh of list) {
      this.world.remove(mesh);
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        if (m && !seen.has(m)) {
          seen.add(m);
          m.dispose?.();
        }
      }
    }
    list.length = 0;
  }

  geoFor(theme, i) {
    const g = this.geos;
    if (theme === "flora") return i % 3 === 0 ? g.cone : i % 3 === 1 ? g.ico : g.oct;
    if (theme === "runas") return i % 3 === 0 ? g.slab : i % 3 === 1 ? g.tet : g.oct;
    if (theme === "neon") return i % 3 === 0 ? g.shard : i % 3 === 1 ? g.tet : g.box;
    if (theme === "comida") return i % 4 === 0 ? g.torus : i % 4 === 1 ? g.blob : i % 4 === 2 ? g.cone : g.ico;
    return i % 4 === 0 ? g.ico : i % 4 === 1 ? g.oct : i % 4 === 2 ? g.dod : g.tet;
  }

  colorFor(look, i) {
    const keys = ["a", "b", "c", "d"];
    return look[keys[i % keys.length]];
  }

  buildField(themeId) {
    this.clearGroup(this.floats);
    this.clearGroup(this.motes);
    const look = PAL[themeId] || PAL.cosmos;
    const n = this.lowFx ? 7 : 12;
    const moteN = this.lowFx ? 8 : 16;

    for (let i = 0; i < n; i++) {
      const geo = this.geoFor(themeId, i);
      const neon = themeId === "neon";
      const mesh = new THREE.Mesh(
        geo,
        mat(this.colorFor(look, i), {
          emissive: neon ? look.em : look.a,
          em: neon ? 0.55 : 0.08
        })
      );
      const scale =
        themeId === "flora" && geo === this.geos.ico
          ? 0.55
          : 0.42 + (i % 5) * 0.16;
      mesh.scale.setScalar(scale);
      if (themeId === "flora" && geo === this.geos.ico) mesh.scale.y = scale * 0.28;
      if (themeId === "comida" && geo === this.geos.blob) mesh.scale.y = scale * 0.78;
      const seed = i * 1.618;
      mesh.userData = {
        seed,
        radius: 2.2 + (i % 6) * 0.85,
        height: ((i % 5) - 2) * 0.85,
        spin: 0.12 + (i % 4) * 0.05,
        tilt: 0.08 + (i % 3) * 0.04,
        phase: seed
      };
      this.world.add(mesh);
      this.floats.push(mesh);
    }

    const moteMat = mat(look.d, { opacity: 0.72, em: 0.12, emissive: look.c });
    for (let i = 0; i < moteN; i++) {
      const mesh = new THREE.Mesh(this.geos.mote, moteMat);
      mesh.userData = {
        seed: i * 2.13,
        radius: 3.4 + (i % 7) * 0.55,
        height: ((i % 8) - 3.5) * 0.7,
        spin: 0.2 + (i % 5) * 0.06,
        phase: i * 0.7
      };
      this.world.add(mesh);
      this.motes.push(mesh);
    }
  }

  applyLook(look, t) {
    const k = Math.max(0, Math.min(1, t));
    this.colorA.set(this.scene.background.getHex());
    this.colorB.set(look.bg);
    this.scene.background.copy(this.colorA.lerp(this.colorB, k));
    this.scene.fog.color.lerp(this.colorB.set(look.fog), k);
    this.hemi.color.lerp(this.colorB.set(look.hemi), k);
    this.hemi.groundColor.lerp(this.colorB.set(look.hemiG), k);
    this.sunL.color.lerp(this.colorB.set(look.sun), k);
    this.fill.color.lerp(this.colorB.set(look.fill), k);
  }

  setTheme(id) {
    const next = PAL[id] ? id : "cosmos";
    if (next === this.themeId && this.floats.length) return;
    this.themeId = next;
    this.targetLook = PAL[next];
    this.look = this.targetLook;
    this.buildField(next);
    this.applyLook(this.look, 1);
    this.renderOnce();
  }

  setPlaying(on) {
    this.playing = !!on;
    this.notifyActivity();
    if (this.playing && !this.reducedMotion) this.startLoop();
  }

  notifyActivity() {
    this.lastActivity = performance.now();
    if (this.paused && !this.reducedMotion && document.visibilityState !== "hidden") {
      this.paused = false;
      this.startLoop();
    }
  }

  fit() {
    const w = Math.max(1, this.view.clientWidth || window.innerWidth);
    const h = Math.max(1, this.view.clientHeight || window.innerHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.renderOnce();
  }

  renderOnce() {
    if (!this.ok || !this.renderer) return;
    try {
      this.renderer.render(this.scene, this.camera);
    } catch (_) {}
  }

  tick(now) {
    this.raf = 0;
    if (this.paused || !this.ok) return;
    if (this.reducedMotion) {
      this.renderOnce();
      return;
    }

    const dt = Math.min(0.05, Math.max(0, (now - this.lastNow) / 1000 || 0.016));
    this.lastNow = now;
    const speed = this.playing ? 1 : 0.72;
    this.time += dt * speed;

    if (!this.playing && now - this.lastActivity > IDLE_MS) {
      this.stopLoop(true);
      return;
    }

    const t = this.time;
    this.camera.position.x = Math.sin(t * 0.11) * 1.15;
    this.camera.position.y = 0.28 + Math.cos(t * 0.09) * 0.42;
    this.camera.position.z = 13.2 + Math.sin(t * 0.07) * 0.35;
    this.camera.lookAt(0, 0.05, 0);

    for (const mesh of this.floats) {
      const u = mesh.userData;
      const ang = t * 0.18 + u.phase;
      mesh.position.set(
        Math.cos(ang) * u.radius,
        u.height + Math.sin(t * 0.35 + u.phase) * 0.45,
        Math.sin(ang) * u.radius * 0.72
      );
      mesh.rotation.x += u.tilt * dt;
      mesh.rotation.y += u.spin * dt;
    }
    for (const mesh of this.motes) {
      const u = mesh.userData;
      const ang = t * 0.28 + u.phase;
      mesh.position.set(
        Math.cos(ang) * u.radius,
        u.height + Math.sin(t * 0.5 + u.seed) * 0.55,
        Math.sin(ang * 0.9) * u.radius * 0.65
      );
      mesh.rotation.y += u.spin * dt;
    }

    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame((n) => this.tick(n));
  }

  startLoop() {
    if (this.reducedMotion || this.paused || !this.ok) return;
    if (this.raf) return;
    this.lastNow = performance.now();
    this.raf = requestAnimationFrame((n) => this.tick(n));
  }

  stopLoop(keepFrame) {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    this.paused = true;
    if (keepFrame) this.renderOnce();
  }

  bind() {
    this._onVis = () => {
      if (document.visibilityState === "hidden") this.stopLoop(false);
      else {
        this.paused = false;
        this.notifyActivity();
        if (!this.reducedMotion) this.startLoop();
      }
    };
    this._onAct = () => this.notifyActivity();
    document.addEventListener("visibilitychange", this._onVis);
    window.addEventListener("pointerdown", this._onAct, { passive: true });
    window.addEventListener("keydown", this._onAct);
    window.addEventListener("touchstart", this._onAct, { passive: true });

    this._mo = new MutationObserver(() => {
      const id = pickTheme();
      if (id !== this.themeId) this.setTheme(id);
    });
    this._mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
}

export async function bootMemoriumBg3D() {
  const view3d = document.getElementById("view3d");
  const failEl = document.getElementById("webgl-fail");

  const markCanvas = () => {
    document.body.classList.add("renderer-canvas");
    document.body.classList.remove("renderer-webgl", "has-webgl-bg");
  };

  if (!view3d || !webglAvailable()) {
    useFallback(view3d, failEl, view3d ? FAIL_PT : null);
    return null;
  }

  try {
    THREE = await import("three");
    const bg = new AmbientBg(view3d);
    if (!bg.ok) throw new Error("three-init-failed");
    document.body.classList.add("renderer-webgl", "has-webgl-bg");
    document.body.classList.remove("renderer-canvas");
    view3d.hidden = false;
    view3d.removeAttribute("hidden");
    window.MemoriumBG3D = {
      ok: true,
      setTheme: (id) => bg.setTheme(id),
      setPlaying: (on) => bg.setPlaying(on),
      notifyActivity: () => bg.notifyActivity()
    };
    return bg;
  } catch (err) {
    console.warn("MEMÓRIUM 3D:", err);
    markCanvas();
    useFallback(view3d, failEl, FAIL_PT);
    window.MemoriumBG3D = {
      ok: false,
      setTheme() {},
      setPlaying() {},
      notifyActivity() {}
    };
    return null;
  }
}

bootMemoriumBg3D().catch((err) => {
  console.warn("MEMÓRIUM 3D:", err);
  useFallback(document.getElementById("view3d"), document.getElementById("webgl-fail"), FAIL_PT);
});
