(function () {
  const DIFFS = {
    easy: { id: "easy", label: "Fácil", cols: 4, rows: 3, pairs: 6, timedStart: 55, timedBonus: 4 },
    medium: { id: "medium", label: "Médio", cols: 4, rows: 4, pairs: 8, timedStart: 70, timedBonus: 5 },
    hard: { id: "hard", label: "Difícil", cols: 6, rows: 4, pairs: 12, timedStart: 95, timedBonus: 6 }
  };

  const WIN_TITLES = [
    "Memória afiada",
    "Pares no ponto",
    "Mente de aço",
    "Eco perfeito",
    "Domínio total"
  ];

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function hitStop(ms) {
    if (prefersReducedMotion()) return;
    const board = el.board;
    if (!board) return;
    board.classList.add("is-hitstop");
    setTimeout(() => board.classList.remove("is-hitstop"), ms || 70);
  }

  const state = {
    mode: "classic",
    difficulty: "medium",
    theme: "cosmos",
    cards: [],
    flipped: [],
    lock: false,
    moves: 0,
    matches: 0,
    streak: 0,
    bestStreak: 0,
    score: 0,
    startedAt: 0,
    timerId: null,
    elapsed: 0,
    timeLeft: 0,
    endsAt: 0,
    hintUsed: false,
    focusIndex: 0,
    missTimer: null,
    hintTimer: null,
    dealTimer: null,
    dealLock: false,
    ended: false
  };

  const el = {
    menu: document.getElementById("screen-menu"),
    game: document.getElementById("screen-game"),
    board: document.getElementById("board"),
    overlay: document.getElementById("overlay-win"),
    overlayLose: document.getElementById("overlay-lose"),
    loseScore: document.getElementById("lose-score"),
    moves: document.getElementById("stat-moves"),
    time: document.getElementById("stat-time"),
    timeLabel: document.getElementById("stat-time-label"),
    streak: document.getElementById("stat-streak"),
    menuBest: document.getElementById("menu-best"),
    modeHint: document.getElementById("mode-hint"),
    tip: document.getElementById("game-tip"),
    winEyebrow: document.getElementById("win-eyebrow"),
    winTitle: document.getElementById("win-title"),
    winStars: document.getElementById("win-stars"),
    winMoves: document.getElementById("win-moves"),
    winTime: document.getElementById("win-time"),
    winTimeLabel: document.getElementById("win-time-label"),
    winStreak: document.getElementById("win-streak"),
    winBest: document.getElementById("win-best"),
    muteMenu: document.getElementById("btn-mute-menu"),
    mute: document.getElementById("btn-mute"),
    hint: document.getElementById("btn-hint"),
    pairsLine: document.getElementById("pairs-line"),
    progressFg: document.getElementById("progress-fg"),
    score: document.getElementById("stat-score"),
    comboFill: document.getElementById("combo-fill"),
    winScore: document.getElementById("win-score")
  };

  function bestKey() {
    return `memorium-best-${state.mode}-${state.difficulty}-${state.theme}`;
  }

  function loadBest() {
    try {
      const raw = localStorage.getItem(bestKey());
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function saveBest(record) {
    const prev = loadBest();
    let better = !prev;
    if (prev) {
      if (state.mode === "timed") {
        better =
          (record.cleared && !prev.cleared) ||
          (record.cleared && prev.cleared && (
            record.timeLeft > prev.timeLeft ||
            (record.timeLeft === prev.timeLeft && record.moves < prev.moves) ||
            (record.timeLeft === prev.timeLeft && record.moves === prev.moves && (record.score || 0) > (prev.score || 0))
          ));
      } else {
        better =
          record.moves < prev.moves ||
          (record.moves === prev.moves && record.time < prev.time) ||
          (record.moves === prev.moves && record.time === prev.time && (record.score || 0) > (prev.score || 0));
      }
    }
    if (better) {
      try { localStorage.setItem(bestKey(), JSON.stringify(record)); } catch (_) {}
      return true;
    }
    return false;
  }

  function formatTime(sec) {
    const s = Math.max(0, sec | 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function updateMuteUI() {
    const muted = MemoriumAudio.isMuted();
    [el.muteMenu, el.mute].forEach((btn) => {
      if (!btn) return;
      btn.classList.toggle("is-muted", muted);
      btn.setAttribute("aria-label", muted ? "Ativar sons" : "Silenciar sons");
    });
  }

  function updateModeHint() {
    if (!el.modeHint) return;
    el.modeHint.textContent =
      state.mode === "timed"
        ? "Contra o relógio: cada par soma segundos. Zerar o tempo = derrota."
        : "Vire duas cartas. Pares ficam abertos.";
  }

  function updateMenuBest() {
    const best = loadBest();
    if (!best) {
      el.menuBest.hidden = true;
      return;
    }
    el.menuBest.hidden = false;
    const modeLabel = state.mode === "timed" ? "Relógio" : "Clássico";
    if (state.mode === "timed") {
      if (best.cleared) {
        const scoreBit = best.score != null ? ` · ${best.score} pts` : "";
        el.menuBest.textContent = `Melhor (${modeLabel} · ${DIFFS[state.difficulty].label} · ${window.MEMORIUM_THEMES[state.theme].name}): sobrou ${formatTime(best.timeLeft)}${scoreBit}`;
      } else {
        el.menuBest.hidden = true;
        return;
      }
    } else {
      const scoreBit = best.score != null ? ` · ${best.score} pts` : "";
      el.menuBest.textContent = `Melhor (${modeLabel} · ${DIFFS[state.difficulty].label} · ${window.MEMORIUM_THEMES[state.theme].name}): ${best.moves} mov. em ${formatTime(best.time)}${scoreBit}`;
    }
  }

  function setSeg(groupId, attr, value) {
    const group = document.getElementById(groupId);
    group.querySelectorAll(`[data-${attr}]`).forEach((btn) => {
      const on = btn.getAttribute(`data-${attr}`) === value;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
  }


  function setOverlayOpen(open) {
    if (el.game) {
      if (open) el.game.setAttribute("aria-hidden", "true");
      else el.game.removeAttribute("aria-hidden");
      try {
        if (open) el.game.inert = true;
        else el.game.inert = false;
      } catch (_) {}
    }
  }

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
  }

  function clearPendingCardTimers() {
    if (state.missTimer) {
      clearTimeout(state.missTimer);
      state.missTimer = null;
    }
    if (state.hintTimer) {
      clearTimeout(state.hintTimer);
      state.hintTimer = null;
    }
    if (state.dealTimer) {
      clearTimeout(state.dealTimer);
      state.dealTimer = null;
    }
    state.dealLock = false;
    if (el.board) {
      el.board.querySelectorAll(".card.is-miss, .card.is-hint").forEach((n) => {
        n.classList.remove("is-miss", "is-hint");
        if (!n.classList.contains("is-matched")) {
          n.classList.remove("is-flipped");
          const front = n.querySelector(".face-front");
          const back = n.querySelector(".face-back");
          if (front) front.setAttribute("aria-hidden", "true");
          if (back) back.setAttribute("aria-hidden", "false");
        }
      });
    }
    state.flipped = [];
    state.lock = false;
  }

  function layoutForBoard(diff) {
    const narrow = window.matchMedia("(max-width: 520px)").matches;
    let cols = diff.cols;
    let rows = diff.rows;
    if (narrow) {
      // cartas maiores no celular: menos colunas
      if (diff.id === "easy") {
        cols = 3;
        rows = 4;
      } else if (diff.id === "hard") {
        cols = 4;
        rows = 6;
      }
    }
    return { cols, rows };
  }

  
  function updateScoreUI() {
    if (el.score) el.score.textContent = String(state.score);
    if (el.comboFill) {
      const pct = Math.min(100, state.streak * 25);
      el.comboFill.style.width = pct + "%";
    }
  }

  function awardMatchPoints() {
    const base = 100;
    const comboBonus = Math.max(0, (state.streak - 1) * 50);
    const speedBonus = state.mode === "timed" ? 25 : 0;
    const gain = base + comboBonus + speedBonus;
    state.score += gain;
    updateScoreUI();
    return gain;
  }

function updateProgress() {
    const pairs = DIFFS[state.difficulty].pairs;
    if (el.pairsLine) el.pairsLine.textContent = `${state.matches} / ${pairs} pares`;
    if (el.progressFg) {
      const c = 94.2;
      const pct = pairs ? state.matches / pairs : 0;
      el.progressFg.style.strokeDashoffset = String(c * (1 - pct));
    }
  }

  function paintTime() {
    if (state.mode === "timed") {
      el.time.textContent = formatTime(state.timeLeft);
      el.time.classList.toggle("is-urgent", state.timeLeft <= 10);
    } else {
      el.time.textContent = formatTime(state.elapsed);
      el.time.classList.remove("is-urgent");
    }
  }

  function startTimer() {
    stopTimer();
    if (state.mode === "timed") {
      state.endsAt = Date.now() + Math.max(0, state.timeLeft) * 1000;
      state.timerId = setInterval(() => {
        if (state.ended) return;
        state.timeLeft = Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
        paintTime();
        if (state.timeLeft <= 0) {
          state.timeLeft = 0;
          paintTime();
          loseGame();
        }
      }, 250);
    } else {
      state.startedAt = Date.now() - state.elapsed * 1000;
      state.timerId = setInterval(() => {
        state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
        paintTime();
      }, 250);
    }
  }

  function starCount(moves, pairs) {
    const perfect = pairs;
    if (state.mode === "timed") {
      if (state.timeLeft >= DIFFS[state.difficulty].timedStart * 0.35) return 3;
      if (state.timeLeft >= 8) return 2;
      return 1;
    }
    if (moves <= perfect + 2) return 3;
    if (moves <= perfect * 2) return 2;
    return 1;
  }

  function buildBoard() {
    clearPendingCardTimers();
    stopTimer();
    if (window.MemoriumConfetti) MemoriumConfetti.clear();
    if (window.MemoriumFX) MemoriumFX.clear();
    state.ended = false;

    const diff = DIFFS[state.difficulty];
    const layout = layoutForBoard(diff);
    const theme = window.MEMORIUM_THEMES[state.theme];
    const faces = theme.faces.slice(0, diff.pairs);
    const deck = shuffle(faces.flatMap((svg, id) => [
      { uid: `${id}-a`, pairId: id, svg },
      { uid: `${id}-b`, pairId: id, svg }
    ]));

    state.cards = deck;
    state.flipped = [];
    state.lock = false;
    state.moves = 0;
    state.matches = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.score = 0;
    state.elapsed = 0;
    state.timeLeft = diff.timedStart;
    state.hintUsed = false;
    state.focusIndex = 0;
    state.dealLock = true;

    el.moves.textContent = "0";
    el.streak.textContent = "0";
    document.querySelector(".hud")?.classList.remove("is-hot");
    el.timeLabel.textContent = state.mode === "timed" ? "Restante" : "Tempo";
    paintTime();
    el.hint.disabled = false;
    el.hint.style.opacity = "1";
    updateProgress();
    updateScoreUI();

    el.board.classList.remove("is-dim");
    el.board.classList.toggle("is-hard", diff.id === "hard");
    el.board.style.gridTemplateColumns = `repeat(${layout.cols}, minmax(0, 1fr))`;
    el.board.style.gridTemplateRows = `repeat(${layout.rows}, minmax(0, 1fr))`;
    el.board.innerHTML = "";

    deck.forEach((card, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card";
      btn.dataset.index = String(index);
      btn.setAttribute("role", "gridcell");
      btn.setAttribute("aria-label", `Carta ${index + 1}, virada para baixo`);
      btn.innerHTML = `
        <span class="face face-back" aria-hidden="true"></span>
        <span class="face face-front" aria-hidden="true"><span class="glyph">${card.svg}</span></span>
      `;
      let pt = null;
      btn.addEventListener("pointerdown", (ev) => {
        if (ev.button != null && ev.button !== 0) return;
        pt = { x: ev.clientX, y: ev.clientY, id: ev.pointerId };
        try { btn.setPointerCapture(ev.pointerId); } catch (_) {}
      });
      btn.addEventListener("pointerup", (ev) => {
        if (!pt || pt.id !== ev.pointerId) return;
        const dx = ev.clientX - pt.x;
        const dy = ev.clientY - pt.y;
        pt = null;
        if (dx * dx + dy * dy > 100) return; // arrasto = não clica
        btn.dataset.ptrTap = "1";
        onCardClick(index);
      });
      btn.addEventListener("pointercancel", () => { pt = null; });
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        // fallback: leitores/automação que só disparam click
        if (pt) return;
        if (btn.dataset.ptrTap === "1") {
          delete btn.dataset.ptrTap;
          return;
        }
        onCardClick(index);
      });
      btn.style.animationDelay = `${Math.min(index * 28, 420)}ms`;
      btn.classList.add("is-deal");
      el.board.appendChild(btn);
    });
    clearTimeout(state.dealTimer);
    state.dealTimer = setTimeout(() => { state.dealLock = false; }, 480);
    // limpa classe de entrada
    setTimeout(() => {
      el.board.querySelectorAll(".card.is-deal").forEach((n) => n.classList.remove("is-deal"));
    }, 900);
    if (window.MemoriumAudio) {
      try { MemoriumAudio.deal(); } catch (_) {}
    }

    try {
      const seen = sessionStorage.getItem("memorium-tip-session");
      if (!seen && el.tip) {
        el.tip.hidden = false;
        el.tip.textContent = state.mode === "timed"
          ? "Relógio: ache pares antes do tempo zerar. Cada par soma segundos."
          : "Toque duas cartas. Iguais ficam abertas. Errou? Viram de volta.";
        sessionStorage.setItem("memorium-tip-session", "1");
        setTimeout(() => { if (el.tip) el.tip.hidden = true; }, 6500);
      } else if (el.tip) {
        el.tip.hidden = true;
      }
    } catch (_) {
      if (el.tip) {
        el.tip.hidden = false;
        setTimeout(() => { el.tip.hidden = true; }, 6500);
      }
    }

    const first = el.board.querySelector(".card");
    if (first) first.focus({ preventScroll: true });
  }

  function getCardEl(index) {
    return el.board.querySelector(`.card[data-index="${index}"]`);
  }

  function onCardClick(index) {
    if (state.lock || state.ended || state.dealLock) return;
    const node = getCardEl(index);
    if (!node || node.classList.contains("is-flipped") || node.classList.contains("is-matched")) return;
    node.classList.remove("is-deal");

    MemoriumAudio.unlock();
    MemoriumAudio.flip();

    if (!state.timerId) startTimer();

    node.classList.add("is-flipped", "is-just-flipped");
    setTimeout(() => node.classList.remove("is-just-flipped"), 320);
    node.setAttribute("aria-label", `Carta ${index + 1}, virada para cima`);
    const front = node.querySelector(".face-front");
    const back = node.querySelector(".face-back");
    if (front) front.setAttribute("aria-hidden", "false");
    if (back) back.setAttribute("aria-hidden", "true");
    state.flipped.push(index);

    if (state.flipped.length < 2) return;

    state.moves += 1;
    el.moves.textContent = String(state.moves);
    state.lock = true;

    const [a, b] = state.flipped;
    const ca = state.cards[a];
    const cb = state.cards[b];
    const na = getCardEl(a);
    const nb = getCardEl(b);

    if (ca.pairId === cb.pairId) {
      MemoriumAudio.match();
      state.matches += 1;
      state.streak += 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      el.streak.textContent = String(state.streak);
      document.querySelector(".hud")?.classList.toggle("is-hot", state.streak >= 2);
      document.getElementById("app")?.classList.toggle("is-combo", state.streak >= 3);
      if (state.streak >= 2) MemoriumAudio.combo?.(state.streak);
      try {
        if (state.streak >= 2) navigator.vibrate?.([10, 30, 18]);
        else navigator.vibrate?.(16);
      } catch (_) {}
      hitStop(state.streak >= 2 ? 90 : 55);
      na.classList.add("is-matched", "is-match-pop");
      nb.classList.add("is-matched", "is-match-pop");
      [na, nb].forEach((node) => {
        const flash = document.createElement("span");
        flash.className = "match-flash";
        node.appendChild(flash);
        setTimeout(() => flash.remove(), 560);
        setTimeout(() => node.classList.remove("is-match-pop"), 420);
        if (window.MemoriumFX) MemoriumFX.sparkAt(node);
      });
      updateProgress();
      const left = DIFFS[state.difficulty].pairs - state.matches;
      if (left > 0 && left <= 3) el.board.classList.add("is-dim");
      na.disabled = true;
      nb.disabled = true;
      na.setAttribute("aria-label", `Carta ${a + 1}, par encontrado`);
      nb.setAttribute("aria-label", `Carta ${b + 1}, par encontrado`);
      state.flipped = [];
      state.lock = false;

      const gained = awardMatchPoints();
      if (state.mode === "timed") {
        const bonus = DIFFS[state.difficulty].timedBonus;
        state.timeLeft += bonus;
        if (state.endsAt) state.endsAt += bonus * 1000;
        else state.endsAt = Date.now() + state.timeLeft * 1000;
        paintTime();
        spawnBonusPop(`+${bonus}s · +${gained}`);
      } else if (state.streak >= 2) {
        spawnBonusPop(`Combo ×${state.streak} · +${gained}`);
      } else {
        spawnBonusPop(`+${gained}`);
      }

      if (state.matches === DIFFS[state.difficulty].pairs) endGame();
    } else {
      MemoriumAudio.miss();
      try { navigator.vibrate?.([12, 40, 12]); } catch (_) {}
      const app = document.getElementById("app");
      app.classList.remove("is-shake");
      void app.offsetWidth;
      app.classList.add("is-shake");
      setTimeout(() => app.classList.remove("is-shake"), 300);
      state.streak = 0;
      el.streak.textContent = "0";
      document.querySelector(".hud")?.classList.remove("is-hot");
      document.getElementById("app")?.classList.remove("is-combo");
      updateScoreUI();
      na.classList.add("is-miss");
      nb.classList.add("is-miss");
      state.missTimer = setTimeout(() => {
        state.missTimer = null;
        if (!na.isConnected || !nb.isConnected) return;
        na.classList.remove("is-flipped", "is-miss");
        nb.classList.remove("is-flipped", "is-miss");
        na.setAttribute("aria-label", `Carta ${a + 1}, virada para baixo`);
        nb.setAttribute("aria-label", `Carta ${b + 1}, virada para baixo`);
        [na, nb].forEach((node) => {
          const front = node.querySelector(".face-front");
          const back = node.querySelector(".face-back");
          if (front) front.setAttribute("aria-hidden", "true");
          if (back) back.setAttribute("aria-hidden", "false");
        });
        state.flipped = [];
        state.lock = false;
      }, 900);
    }
  }

  function spawnBonusPop(text) {
    const pop = document.createElement("div");
    pop.className = "bonus-pop";
    pop.textContent = text;
    el.game.appendChild(pop);
    setTimeout(() => pop.remove(), 900);
  }

  function ensureAmbient() {
    MemoriumAudio.unlock();
    MemoriumAudio.setAmbient(true);
    MemoriumAudio.setAmbientLevel(document.getElementById("app").classList.contains("is-playing") ? 0.018 : 0.045);
  }

  function useHint() {
    if (state.hintUsed || state.lock || state.ended || state.dealLock || state.flipped.length > 0) return;
    const unmatched = state.cards
      .map((c, i) => ({ c, i }))
      .filter(({ i }) => {
        const n = getCardEl(i);
        return n && !n.classList.contains("is-matched") && !n.classList.contains("is-flipped");
      });
    if (unmatched.length < 2) return;

    const byPair = new Map();
    for (const item of unmatched) {
      const list = byPair.get(item.c.pairId) || [];
      list.push(item);
      byPair.set(item.c.pairId, list);
    }
    let pair = null;
    for (const list of byPair.values()) {
      if (list.length >= 2) { pair = list.slice(0, 2); break; }
    }
    if (!pair) return;

    state.hintUsed = true;
    state.moves += 2;
    el.moves.textContent = String(state.moves);
    el.hint.disabled = true;
    el.hint.style.opacity = "0.4";
    MemoriumAudio.click();

    if (!state.timerId) startTimer();
    pair.forEach(({ i }) => {
      const n = getCardEl(i);
      n.classList.add("is-flipped", "is-hint");
      n.setAttribute("aria-label", `Carta ${i + 1}, virada para cima (dica)`);
      const front = n.querySelector(".face-front");
      const back = n.querySelector(".face-back");
      if (front) front.setAttribute("aria-hidden", "false");
      if (back) back.setAttribute("aria-hidden", "true");
    });
    state.lock = true;
    state.hintTimer = setTimeout(() => {
      state.hintTimer = null;
      pair.forEach(({ i }) => {
        const n = getCardEl(i);
        if (n && n.isConnected && !n.classList.contains("is-matched")) {
          n.classList.remove("is-flipped", "is-hint");
          n.setAttribute("aria-label", `Carta ${i + 1}, virada para baixo`);
          const front = n.querySelector(".face-front");
          const back = n.querySelector(".face-back");
          if (front) front.setAttribute("aria-hidden", "true");
          if (back) back.setAttribute("aria-hidden", "false");
        }
      });
      state.lock = false;
    }, 1200);
  }

  function endGame() {
    if (state.ended) return;
    state.ended = true;
    stopTimer();
    MemoriumAudio.win();
    if (window.MemoriumConfetti) {
      MemoriumConfetti.burst({ count: 140 });
      setTimeout(() => MemoriumConfetti.burst({ count: 60, y: window.innerHeight * 0.55 }), 280);
    }

    const pairs = DIFFS[state.difficulty].pairs;
    const stars = starCount(state.moves, pairs);
    let perfect = false;
    if (state.moves <= pairs) {
      state.score += 250;
      perfect = true;
    }
    state.score += stars * 50;
    updateScoreUI();
    const record =
      state.mode === "timed"
        ? { cleared: true, timeLeft: state.timeLeft, moves: state.moves, streak: state.bestStreak, score: state.score }
        : { moves: state.moves, time: state.elapsed, streak: state.bestStreak, score: state.score };
    const isNew = saveBest(record);
    const best = loadBest();

    el.winEyebrow.textContent = state.mode === "timed" ? "relógio dominado" : "vitória";
    el.winTitle.textContent = WIN_TITLES[Math.floor(Math.random() * WIN_TITLES.length)];
    el.winStars.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
    el.winStars.setAttribute("aria-label", `${stars} de 3 estrelas`);
    if (el.winScore) el.winScore.textContent = String(state.score);
    el.winMoves.textContent = String(state.moves);
    el.winTimeLabel.textContent = state.mode === "timed" ? "Sobra" : "Tempo";
    el.winTime.textContent = state.mode === "timed" ? formatTime(state.timeLeft) : formatTime(state.elapsed);
    el.winStreak.textContent = String(state.bestStreak);
    const perfectLine = perfect ? "Partida perfeita! +250 pts. " : "";
    if (state.mode === "timed") {
      el.winBest.textContent = perfectLine + (isNew
        ? "Novo recorde neste modo!"
        : best && best.cleared
          ? `Melhor sobra: ${formatTime(best.timeLeft)}`
          : "");
    } else {
      el.winBest.textContent = perfectLine + (isNew
        ? "Novo recorde neste modo!"
        : best
          ? `Melhor: ${best.moves} mov. em ${formatTime(best.time)}`
          : "");
    }

    el.overlayLose.hidden = true;
    el.overlay.classList.add("is-cinematic");
    el.overlay.hidden = false;
    setOverlayOpen(true);
    document.getElementById("btn-replay").focus();
  }

  function loseGame() {
    if (state.ended) return;
    state.ended = true;
    stopTimer();
    clearPendingCardTimers();
    state.lock = true;
    MemoriumAudio.miss();
    // não grava derrota como "melhor" — só vitórias atualizam recorde
    if (el.loseScore) {
      el.loseScore.hidden = false;
      el.loseScore.textContent = `Pontuação: ${state.score}`;
    }
    el.overlay.hidden = true;
    el.overlayLose.hidden = false;
    setOverlayOpen(true);
    document.getElementById("btn-replay-lose").focus();
  }

  function showMenu() {
    clearPendingCardTimers();
    stopTimer();
    if (window.MemoriumConfetti) MemoriumConfetti.clear();
    if (window.MemoriumFX) MemoriumFX.clear();
    state.ended = true;
    el.overlay.hidden = true;
    el.overlay.classList.remove("is-cinematic");
    el.overlayLose.hidden = true;
    setOverlayOpen(false);
    el.game.hidden = true;
    el.menu.hidden = false;
    document.getElementById("app").classList.remove("is-playing", "is-combo");
    window.MemoriumBG3D?.setPlaying?.(false);
    MemoriumAudio.setAmbientLevel(0.045);
    MemoriumAudio.setAmbient(true);
    updateMenuBest();
    document.getElementById("btn-start").focus();
  }

  function startGame() {
    MemoriumAudio.unlock();
    ensureAmbient();
    MemoriumAudio.click();
    el.menu.hidden = true;
    el.overlay.hidden = true;
    el.overlayLose.hidden = true;
    setOverlayOpen(false);
    el.game.hidden = false;
    document.getElementById("app").classList.add("is-playing");
    document.documentElement.dataset.theme = state.theme;
    window.MemoriumBG3D?.setTheme?.(state.theme);
    window.MemoriumBG3D?.setPlaying?.(true);
    MemoriumAudio.setAmbientLevel(0.018);
    MemoriumAudio.setAmbient(true);
    fitViewport();
    buildBoard();
  }

  function onBoardKey(e) {
    const cards = [...el.board.querySelectorAll(".card")];
    if (!cards.length) return;
    const cols = layoutForBoard(DIFFS[state.difficulty]).cols;
    let idx = cards.findIndex((c) => c === document.activeElement);
    if (idx < 0) idx = state.focusIndex;

    const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    if (move != null) {
      e.preventDefault();
      const next = Math.max(0, Math.min(cards.length - 1, idx + move));
      state.focusIndex = next;
      cards[next].focus();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onCardClick(idx);
    }
  }


  function fitViewport() {
    const vv = window.visualViewport;
    const h = vv ? vv.height : window.innerHeight;
    document.documentElement.style.setProperty("--app-height", `${Math.round(h)}px`);
    // Chrome Android: barra inferior ~48–64px além do safe-area em muitos aparelhos
    const chromeGuess = Math.max(0, window.innerHeight - h);
    const bottom = Math.max(chromeGuess, 8);
    document.documentElement.style.setProperty("--chrome-bottom", `${Math.round(bottom)}px`);
  }

  function bind() {
    document.getElementById("mode-group").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-mode]");
      if (!btn) return;
      state.mode = btn.dataset.mode;
      setSeg("mode-group", "mode", state.mode);
      ensureAmbient();
      MemoriumAudio.click();
      updateModeHint();
      updateMenuBest();
    });

    document.getElementById("diff-group").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-diff]");
      if (!btn) return;
      state.difficulty = btn.dataset.diff;
      setSeg("diff-group", "diff", state.difficulty);
      MemoriumAudio.click();
      updateMenuBest();
    });

    document.getElementById("theme-group").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-theme]");
      if (!btn) return;
      state.theme = btn.dataset.theme;
      setSeg("theme-group", "theme", state.theme);
      document.documentElement.dataset.theme = state.theme;
      window.MemoriumBG3D?.setTheme?.(state.theme);
      MemoriumAudio.click();
      updateMenuBest();
    });

    document.getElementById("btn-start").addEventListener("click", startGame);
    document.getElementById("btn-back").addEventListener("click", showMenu);
    document.getElementById("btn-replay").addEventListener("click", startGame);
    document.getElementById("btn-menu").addEventListener("click", showMenu);
    document.getElementById("btn-replay-lose").addEventListener("click", startGame);
    document.getElementById("btn-menu-lose").addEventListener("click", showMenu);
    el.hint.addEventListener("click", useHint);

    const toggleMute = () => {
      MemoriumAudio.unlock();
      MemoriumAudio.setMuted(!MemoriumAudio.isMuted());
      updateMuteUI();
      if (!MemoriumAudio.isMuted()) {
        ensureAmbient();
        MemoriumAudio.click();
      }
    };
    el.muteMenu.addEventListener("click", toggleMute);
    el.mute.addEventListener("click", toggleMute);

    el.board.addEventListener("keydown", onBoardKey);
  }

  MemoriumAudio.loadMute();
  document.documentElement.dataset.theme = state.theme;
  updateMuteUI();
  updateModeHint();
  bind();
  updateMenuBest();
  fitViewport();
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const winOpen = el.overlay && !el.overlay.hidden;
    const loseOpen = el.overlayLose && !el.overlayLose.hidden;
    if (!winOpen && !loseOpen) return;
    e.preventDefault();
    showMenu();
  });
  window.addEventListener("resize", fitViewport);
  const boot = document.getElementById("boot");
  if (boot) {
    const finishBoot = () => boot.classList.add("is-done");
    setTimeout(finishBoot, 1500);
    boot.addEventListener("click", finishBoot, { once: true });
  }
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", fitViewport);
    visualViewport.addEventListener("scroll", fitViewport);
  }
})();
