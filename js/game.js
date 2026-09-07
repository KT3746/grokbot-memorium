(function () {
  const DIFFS = {
    easy: { id: "easy", label: "Fácil", cols: 4, rows: 3, pairs: 6 },
    medium: { id: "medium", label: "Médio", cols: 4, rows: 4, pairs: 8 },
    hard: { id: "hard", label: "Difícil", cols: 6, rows: 4, pairs: 12 }
  };

  const WIN_TITLES = [
    "Memória afiada",
    "Pares no ponto",
    "Mente de aço",
    "Eco perfeito",
    "Domínio total"
  ];

  const state = {
    difficulty: "medium",
    theme: "cosmos",
    cards: [],
    flipped: [],
    lock: false,
    moves: 0,
    matches: 0,
    streak: 0,
    bestStreak: 0,
    startedAt: 0,
    timerId: null,
    elapsed: 0,
    hintUsed: false,
    focusIndex: 0,
    missTimer: null,
    hintTimer: null
  };

  const el = {
    menu: document.getElementById("screen-menu"),
    game: document.getElementById("screen-game"),
    board: document.getElementById("board"),
    overlay: document.getElementById("overlay-win"),
    moves: document.getElementById("stat-moves"),
    time: document.getElementById("stat-time"),
    streak: document.getElementById("stat-streak"),
    menuBest: document.getElementById("menu-best"),
    winTitle: document.getElementById("win-title"),
    winStars: document.getElementById("win-stars"),
    winMoves: document.getElementById("win-moves"),
    winTime: document.getElementById("win-time"),
    winStreak: document.getElementById("win-streak"),
    winBest: document.getElementById("win-best"),
    muteMenu: document.getElementById("btn-mute-menu"),
    mute: document.getElementById("btn-mute"),
    hint: document.getElementById("btn-hint")
  };

  function bestKey() {
    return `memorium-best-${state.difficulty}-${state.theme}`;
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
    const better =
      !prev ||
      record.moves < prev.moves ||
      (record.moves === prev.moves && record.time < prev.time);
    if (better) {
      try { localStorage.setItem(bestKey(), JSON.stringify(record)); } catch (_) {}
      return true;
    }
    return false;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
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

  function updateMenuBest() {
    const best = loadBest();
    if (!best) {
      el.menuBest.hidden = true;
      return;
    }
    el.menuBest.hidden = false;
    el.menuBest.textContent = `Melhor (${DIFFS[state.difficulty].label} · ${window.MEMORIUM_THEMES[state.theme].name}): ${best.moves} mov. em ${formatTime(best.time)}`;
  }

  function setSeg(groupId, attr, value) {
    const group = document.getElementById(groupId);
    group.querySelectorAll(`[data-${attr}]`).forEach((btn) => {
      const on = btn.getAttribute(`data-${attr}`) === value;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  function startTimer() {
    stopTimer();
    state.startedAt = Date.now() - state.elapsed * 1000;
    state.timerId = setInterval(() => {
      state.elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      el.time.textContent = formatTime(state.elapsed);
    }, 250);
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
  }

  function layoutForBoard(diff) {
    const narrow = window.matchMedia("(max-width: 520px)").matches;
    let cols = diff.cols;
    let rows = diff.rows;
    // No celular, difícil fica 4x6 em vez de 6x4 (cartas legíveis)
    if (narrow && diff.id === "hard") {
      cols = 4;
      rows = 6;
    }
    return { cols, rows };
  }

  function starCount(moves, pairs) {
    const perfect = pairs;
    if (moves <= perfect + 2) return 3;
    if (moves <= perfect * 2) return 2;
    return 1;
  }

  function buildBoard() {
    clearPendingCardTimers();
    stopTimer();
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
    state.elapsed = 0;
    state.hintUsed = false;
    state.focusIndex = 0;

    el.moves.textContent = "0";
    el.time.textContent = "0:00";
    el.streak.textContent = "0";
    el.hint.disabled = false;
    el.hint.style.opacity = "1";
    el.hint.setAttribute("aria-label", "Dica: revela um par (+2 movimentos)");
    el.hint.title = "Dica (+2 movimentos)";

    el.board.classList.toggle("is-hard", diff.id === "hard");
    el.board.style.gridTemplateColumns = `repeat(${layout.cols}, minmax(0, 1fr))`;
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
      btn.addEventListener("click", () => onCardClick(index));
      el.board.appendChild(btn);
    });

    const first = el.board.querySelector(".card");
    if (first) first.focus({ preventScroll: true });
  }

  function getCardEl(index) {
    return el.board.querySelector(`.card[data-index="${index}"]`);
  }

  function onCardClick(index) {
    if (state.lock) return;
    const card = state.cards[index];
    const node = getCardEl(index);
    if (!node || node.classList.contains("is-flipped") || node.classList.contains("is-matched")) return;

    MemoriumAudio.unlock();
    MemoriumAudio.flip();

    if (!state.timerId) startTimer();

    node.classList.add("is-flipped");
    node.setAttribute("aria-label", `Carta ${index + 1}, virada para cima`);
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
      na.classList.add("is-matched");
      nb.classList.add("is-matched");
      na.disabled = true;
      nb.disabled = true;
      na.setAttribute("aria-label", `Carta ${a + 1}, par encontrado`);
      nb.setAttribute("aria-label", `Carta ${b + 1}, par encontrado`);
      state.flipped = [];
      state.lock = false;
      if (state.matches === DIFFS[state.difficulty].pairs) endGame();
    } else {
      MemoriumAudio.miss();
      state.streak = 0;
      el.streak.textContent = "0";
      na.classList.add("is-miss");
      nb.classList.add("is-miss");
      state.missTimer = setTimeout(() => {
        state.missTimer = null;
        if (!na.isConnected || !nb.isConnected) return;
        na.classList.remove("is-flipped", "is-miss");
        nb.classList.remove("is-flipped", "is-miss");
        na.setAttribute("aria-label", `Carta ${a + 1}, virada para baixo`);
        nb.setAttribute("aria-label", `Carta ${b + 1}, virada para baixo`);
        state.flipped = [];
        state.lock = false;
      }, 900);
    }
  }

  function useHint() {
    if (state.hintUsed || state.lock || state.flipped.length > 0) return;
    const unmatched = state.cards
      .map((c, i) => ({ c, i }))
      .filter(({ i }) => {
        const n = getCardEl(i);
        return n && !n.classList.contains("is-matched") && !n.classList.contains("is-flipped");
      });
    if (unmatched.length < 2) return;

    // Escolhe um par completo ainda fechado
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

    pair.forEach(({ i }) => {
      const n = getCardEl(i);
      n.classList.add("is-flipped");
    });
    state.lock = true;
    state.hintTimer = setTimeout(() => {
      state.hintTimer = null;
      pair.forEach(({ i }) => {
        const n = getCardEl(i);
        if (n && n.isConnected && !n.classList.contains("is-matched")) {
          n.classList.remove("is-flipped");
        }
      });
      state.lock = false;
    }, 1100);
  }

  function endGame() {
    stopTimer();
    MemoriumAudio.win();
    const pairs = DIFFS[state.difficulty].pairs;
    const stars = starCount(state.moves, pairs);
    const record = { moves: state.moves, time: state.elapsed, streak: state.bestStreak };
    const isNew = saveBest(record);
    const best = loadBest();

    el.winTitle.textContent = WIN_TITLES[Math.floor(Math.random() * WIN_TITLES.length)];
    el.winStars.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
    el.winStars.setAttribute("aria-label", `${stars} de 3 estrelas`);
    el.winMoves.textContent = String(state.moves);
    el.winTime.textContent = formatTime(state.elapsed);
    el.winStreak.textContent = String(state.bestStreak);
    el.winBest.textContent = isNew
      ? "Novo recorde neste modo!"
      : best
        ? `Melhor: ${best.moves} mov. em ${formatTime(best.time)}`
        : "";

    el.overlay.hidden = false;
    document.getElementById("btn-replay").focus();
  }

  function showMenu() {
    clearPendingCardTimers();
    stopTimer();
    el.overlay.hidden = true;
    el.game.hidden = true;
    el.menu.hidden = false;
    updateMenuBest();
    document.getElementById("btn-start").focus();
  }

  function startGame() {
    MemoriumAudio.unlock();
    MemoriumAudio.click();
    el.menu.hidden = true;
    el.overlay.hidden = true;
    el.game.hidden = false;
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

  function bind() {
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
      MemoriumAudio.click();
      updateMenuBest();
    });

    document.getElementById("btn-start").addEventListener("click", startGame);
    document.getElementById("btn-back").addEventListener("click", showMenu);
    document.getElementById("btn-replay").addEventListener("click", startGame);
    document.getElementById("btn-menu").addEventListener("click", showMenu);
    el.hint.addEventListener("click", useHint);

    const toggleMute = () => {
      MemoriumAudio.setMuted(!MemoriumAudio.isMuted());
      updateMuteUI();
      MemoriumAudio.click();
    };
    el.muteMenu.addEventListener("click", toggleMute);
    el.mute.addEventListener("click", toggleMute);

    el.board.addEventListener("keydown", onBoardKey);
  }

  MemoriumAudio.loadMute();
  updateMuteUI();
  bind();
  updateMenuBest();
})();
