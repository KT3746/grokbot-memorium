/** @typedef {{ id: string, name: string, faces: string[] }} Theme */

function svg(id, inner, c1, c2) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${id}" x1="18%" y1="8%" x2="88%" y2="96%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="28%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <radialGradient id="${id}r" cx="32%" cy="28%" r="72%">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.7"/>
        <stop offset="42%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </radialGradient>
      <filter id="${id}s" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="2.2" stdDeviation="1.6" flood-color="#000" flood-opacity="0.4"/>
      </filter>
    </defs>
    ${inner(id, c1, c2)}
  </svg>`;
}

function cosmosFaces() {
  const pal = [
    ["#d7e7ff", "#4c7cff"], ["#ffe7a3", "#d4a017"], ["#ffd0e4", "#e0569b"],
    ["#c8ffe4", "#1fa971"], ["#ead4ff", "#7b4ad6"], ["#fff1c2", "#e0a100"],
    ["#c7fff6", "#1299a8"], ["#ffd3b8", "#e06a3a"], ["#d5dcff", "#5b6ee8"],
    ["#ffd6ee", "#d44a9a"], ["#d4ffd8", "#2ea35a"], ["#ffe8a8", "#e8b020"]
  ];
  const draw = [
    (id) => `<polygon points="50,7 61,36 93,36 67,55 77,88 50,69 23,88 33,55 7,36 39,36" fill="url(#${id})" filter="url(#${id}s)"/><polygon points="50,22 56,38 72,38 59,48 64,64 50,54 36,64 41,48 28,38 44,38" fill="#fff" opacity="0.28"/>`,
    (id) => `<ellipse cx="50" cy="52" rx="40" ry="11" fill="none" stroke="url(#${id})" stroke-width="5" transform="rotate(-22 50 52)" opacity="0.9"/><circle cx="50" cy="50" r="21" fill="url(#${id}r)" filter="url(#${id}s)"/><circle cx="42" cy="43" r="6" fill="#fff" opacity="0.28"/>`,
    (id) => `<circle cx="50" cy="52" r="26" fill="url(#${id}r)" filter="url(#${id}s)"/><circle cx="64" cy="42" r="18" fill="#12182a" opacity="0.92"/><circle cx="40" cy="44" r="5" fill="#fff" opacity="0.2"/>`,
    (id) => `<path d="M58 38 L16 82 L30 70 L22 90 Z" fill="url(#${id})" opacity="0.9"/><circle cx="70" cy="30" r="13" fill="url(#${id}r)" filter="url(#${id}s)"/><circle cx="66" cy="26" r="4" fill="#fff" opacity="0.4"/>`,
    (id) => `<path d="M22 30 L50 16 L80 32 L72 70 L40 62 Z" fill="none" stroke="url(#${id})" stroke-width="2.4"/><circle cx="22" cy="30" r="4.2" fill="url(#${id}r)"/><circle cx="50" cy="16" r="4.2" fill="url(#${id}r)"/><circle cx="80" cy="32" r="4.2" fill="url(#${id}r)"/><circle cx="72" cy="70" r="4.2" fill="url(#${id}r)"/><circle cx="40" cy="62" r="4.2" fill="url(#${id}r)"/>`,
    (id) => `<ellipse cx="50" cy="50" rx="42" ry="13" fill="none" stroke="url(#${id})" stroke-width="5.5"/><circle cx="50" cy="50" r="18" fill="url(#${id}r)" filter="url(#${id}s)"/><ellipse cx="50" cy="50" rx="42" ry="13" fill="none" stroke="#fff" stroke-width="1.2" opacity="0.25"/>`,
    (id) => `<circle cx="50" cy="50" r="40" fill="none" stroke="url(#${id})" stroke-width="3" opacity="0.45"/><circle cx="50" cy="50" r="27" fill="none" stroke="url(#${id})" stroke-width="6" stroke-dasharray="11 7"/><circle cx="50" cy="50" r="9" fill="#0b0f1a"/><circle cx="50" cy="50" r="5" fill="url(#${id}r)"/>`,
    (id) => `<path d="M50 10 L63 46 L50 40 L37 46 Z" fill="url(#${id})" filter="url(#${id}s)"/><rect x="43.5" y="44" width="13" height="22" rx="3" fill="url(#${id})"/><path d="M43 66 L36 88 L50 76 L64 88 L57 66" fill="url(#${id})" opacity="0.85"/><circle cx="50" cy="28" r="3" fill="#fff" opacity="0.45"/>`,
    (id) => `<ellipse cx="50" cy="48" rx="27" ry="32" fill="url(#${id}r)" filter="url(#${id}s)"/><ellipse cx="38" cy="48" rx="6.5" ry="12" fill="#0b0f1a"/><ellipse cx="62" cy="48" rx="6.5" ry="12" fill="#0b0f1a"/><ellipse cx="38" cy="46" rx="2" ry="3.5" fill="#7dffb3" opacity="0.7"/><ellipse cx="62" cy="46" rx="2" ry="3.5" fill="#7dffb3" opacity="0.7"/>`,
    (id) => `<ellipse cx="50" cy="50" rx="36" ry="13" fill="none" stroke="url(#${id})" stroke-width="5" transform="rotate(34 50 50)"/><ellipse cx="50" cy="50" rx="36" ry="13" fill="none" stroke="url(#${id})" stroke-width="2.6" opacity="0.5" transform="rotate(-24 50 50)"/><circle cx="50" cy="50" r="8" fill="url(#${id}r)" filter="url(#${id}s)"/>`,
    (id) => `<rect x="41" y="36" width="18" height="28" rx="3" fill="url(#${id})" filter="url(#${id}s)"/><rect x="16" y="45" width="22" height="9" rx="2" fill="url(#${id})" opacity="0.88"/><rect x="62" y="45" width="22" height="9" rx="2" fill="url(#${id})" opacity="0.88"/><circle cx="50" cy="28" r="7" fill="url(#${id}r)"/>`,
    (id) => `<circle cx="50" cy="50" r="16" fill="url(#${id}r)" filter="url(#${id}s)"/><g stroke="url(#${id})" stroke-width="4" stroke-linecap="round"><line x1="50" y1="10" x2="50" y2="24"/><line x1="50" y1="76" x2="50" y2="90"/><line x1="10" y1="50" x2="24" y2="50"/><line x1="76" y1="50" x2="90" y2="50"/><line x1="20" y1="20" x2="30" y2="30"/><line x1="70" y1="70" x2="80" y2="80"/><line x1="80" y1="20" x2="70" y2="30"/><line x1="30" y1="70" x2="20" y2="80"/></g>`
  ];
  return draw.map((fn, i) => svg("cx" + i, fn, pal[i][0], pal[i][1]));
}

function floraFaces() {
  const pal = [
    ["#c8ffd8", "#1f9a58"], ["#ffd0dc", "#e05680"], ["#ffe7a8", "#d4a017"],
    ["#d4ffd0", "#2ea35a"], ["#ffd4e8", "#e0709a"], ["#e8ffa8", "#7aaa18"],
    ["#ffd6ee", "#d44a9a"], ["#b8ffd0", "#18a35a"], ["#ffc8d4", "#e04868"],
    ["#e4ffa8", "#6aa818"], ["#ffc8e8", "#d04088"], ["#b8ffe0", "#149a6a"]
  ];
  const draw = [
    (id) => `<g filter="url(#${id}s)" fill="url(#${id}r)"><ellipse cx="50" cy="24" rx="13" ry="18"/><ellipse cx="50" cy="76" rx="13" ry="18"/><ellipse cx="24" cy="50" rx="18" ry="13"/><ellipse cx="76" cy="50" rx="18" ry="13"/></g><circle cx="50" cy="50" r="12" fill="url(#${id})"/><circle cx="50" cy="50" r="5" fill="#fff3c4"/>`,
    (id) => `<path d="M50 90 C50 90 16 60 16 38 C16 22 32 16 50 36 C68 16 84 22 84 38 C84 60 50 90 50 90 Z" fill="url(#${id}r)" filter="url(#${id}s)"/><path d="M36 42 C44 34 50 46 50 54" fill="none" stroke="#fff" stroke-width="2" opacity="0.35"/>`,
    (id) => `<path d="M50 14 C60 40 84 48 50 90 C16 48 40 40 50 14 Z" fill="url(#${id}r)" filter="url(#${id}s)"/><path d="M50 48 C38 52 28 64 26 76" fill="none" stroke="#14532d" stroke-width="2.6"/>`,
    (id) => `<circle cx="50" cy="40" r="22" fill="url(#${id}r)" filter="url(#${id}s)"/><rect x="46" y="58" width="8" height="26" rx="3" fill="#166534"/><ellipse cx="34" cy="72" rx="13" ry="6" fill="url(#${id})" transform="rotate(-28 34 72)"/><ellipse cx="66" cy="72" rx="13" ry="6" fill="url(#${id})" transform="rotate(28 66 72)"/><circle cx="43" cy="34" r="5" fill="#fff" opacity="0.28"/>`,
    (id) => `<g fill="url(#${id}r)" filter="url(#${id}s)"><circle cx="50" cy="26" r="10"/><circle cx="30" cy="40" r="10"/><circle cx="70" cy="40" r="10"/><circle cx="34" cy="62" r="10"/><circle cx="66" cy="62" r="10"/></g><circle cx="50" cy="48" r="8" fill="#fff3c4"/>`,
    (id) => `<ellipse cx="50" cy="58" rx="28" ry="26" fill="url(#${id}r)" filter="url(#${id}s)"/><path d="M36 40 Q50 8 64 40" fill="none" stroke="url(#${id})" stroke-width="7" stroke-linecap="round"/><circle cx="40" cy="54" r="4" fill="#0b0f1a"/><circle cx="60" cy="54" r="4" fill="#0b0f1a"/><path d="M42 68 Q50 75 58 68" fill="none" stroke="#0b0f1a" stroke-width="2.6"/>`,
    (id) => `<path d="M20 70 C30 28 70 28 80 70 Z" fill="url(#${id}r)" filter="url(#${id}s)"/><ellipse cx="50" cy="70" rx="30" ry="8" fill="url(#${id})"/><rect x="46" y="68" width="8" height="18" rx="2" fill="#166534"/>`,
    (id) => `<circle cx="50" cy="50" r="30" fill="none" stroke="url(#${id})" stroke-width="7"/><circle cx="50" cy="50" r="12" fill="url(#${id}r)" filter="url(#${id}s)"/><circle cx="50" cy="16" r="6" fill="url(#${id})"/><circle cx="50" cy="84" r="6" fill="url(#${id})"/><circle cx="16" cy="50" r="6" fill="url(#${id})"/><circle cx="84" cy="50" r="6" fill="url(#${id})"/>`,
    (id) => `<path d="M50 10 L59 38 L90 38 L65 56 L75 88 L50 70 L25 88 L35 56 L10 38 L41 38 Z" fill="url(#${id})" filter="url(#${id}s)" opacity="0.95"/><circle cx="50" cy="50" r="9" fill="#fff3c4"/>`,
    (id) => `<ellipse cx="50" cy="56" rx="18" ry="30" fill="url(#${id}r)" filter="url(#${id}s)"/><path d="M50 24 C72 24 80 46 50 56 C20 46 28 24 50 24 Z" fill="url(#${id})" opacity="0.8"/>`,
    (id) => `<path d="M50 90 L50 40" stroke="#166534" stroke-width="5"/><path d="M50 48 C18 28 28 6 50 20 C72 6 82 28 50 48 Z" fill="url(#${id}r)" filter="url(#${id}s)"/><ellipse cx="34" cy="64" rx="14" ry="7" fill="url(#${id})" transform="rotate(-24 34 64)"/>`,
    (id) => `<g fill="url(#${id}r)" filter="url(#${id}s)"><circle cx="50" cy="50" r="8"/><circle cx="26" cy="34" r="10"/><circle cx="74" cy="34" r="10"/><circle cx="22" cy="60" r="9"/><circle cx="78" cy="60" r="9"/><circle cx="50" cy="78" r="9"/></g>`
  ];
  return draw.map((fn, i) => svg("fx" + i, fn, pal[i][0], pal[i][1]));
}

function runasFaces() {
  const pal = [
    ["#ffc8a8", "#e0562a"], ["#ffe7a3", "#d4a017"], ["#ead4ff", "#7b4ad6"],
    ["#c7fff6", "#1299a8"], ["#ffd0dc", "#e05680"], ["#d5dcff", "#5b6ee8"],
    ["#fff1c2", "#e0a100"], ["#ead4ff", "#6a3ad0"], ["#ffd0dc", "#d04060"],
    ["#c8ffe4", "#1fa971"], ["#ffe8a8", "#e8b020"], ["#d5dcff", "#4c5ad8"]
  ];
  const draw = [
    (id) => `<path d="M50 8 L72 90 L50 74 L28 90 Z" fill="none" stroke="url(#${id})" stroke-width="6.5" stroke-linejoin="round" filter="url(#${id}s)"/>`,
    (id) => `<path d="M24 18 H76 V82 H24" fill="none" stroke="url(#${id})" stroke-width="6.5" filter="url(#${id}s)"/><line x1="24" y1="50" x2="76" y2="50" stroke="url(#${id})" stroke-width="6.5"/>`,
    (id) => `<circle cx="50" cy="50" r="28" fill="none" stroke="url(#${id})" stroke-width="6" filter="url(#${id}s)"/><path d="M50 20 V80 M27 38 L73 62 M27 62 L73 38" stroke="url(#${id})" stroke-width="5"/>`,
    (id) => `<path d="M50 10 L90 80 H10 Z" fill="none" stroke="url(#${id})" stroke-width="6.5" stroke-linejoin="round" filter="url(#${id}s)"/><circle cx="50" cy="56" r="8" fill="url(#${id}r)"/>`,
    (id) => `<path d="M18 78 L50 12 L82 78" fill="none" stroke="url(#${id})" stroke-width="6.5" filter="url(#${id}s)"/><path d="M32 54 H68" stroke="url(#${id})" stroke-width="6.5"/>`,
    (id) => `<rect x="20" y="20" width="60" height="60" rx="8" fill="none" stroke="url(#${id})" stroke-width="6.5" filter="url(#${id}s)"/><path d="M34 50 H66 M50 34 V66" stroke="url(#${id})" stroke-width="6"/>`,
    (id) => `<path d="M50 12 V88 M18 34 L50 50 L82 34 M18 66 L50 50 L82 66" fill="none" stroke="url(#${id})" stroke-width="5.2" stroke-linecap="round" filter="url(#${id}s)"/>`,
    (id) => `<path d="M28 18 V82 M28 18 L74 50 L28 82" fill="none" stroke="url(#${id})" stroke-width="6.5" stroke-linejoin="round" filter="url(#${id}s)"/>`,
    (id) => `<path d="M22 24 H78 L50 78 Z" fill="none" stroke="url(#${id})" stroke-width="6.5" filter="url(#${id}s)"/><circle cx="50" cy="40" r="7" fill="url(#${id}r)"/>`,
    (id) => `<path d="M50 16 L84 50 L50 84 L16 50 Z" fill="none" stroke="url(#${id})" stroke-width="6.5" filter="url(#${id}s)"/><path d="M50 30 V70 M30 50 H70" stroke="url(#${id})" stroke-width="5"/>`,
    (id) => `<path d="M20 50 H80 M38 22 L62 78 M62 22 L38 78" stroke="url(#${id})" stroke-width="6" stroke-linecap="round" filter="url(#${id}s)"/>`,
    (id) => `<circle cx="50" cy="50" r="30" fill="none" stroke="url(#${id})" stroke-width="6" filter="url(#${id}s)"/><path d="M50 26 L66 70 H34 Z" fill="url(#${id}r)"/>`
  ];
  return draw.map((fn, i) => svg("rx" + i, fn, pal[i][0], pal[i][1]));
}

function neonFaces() {
  const pal = [
    ["#ff9af5", "#c000b0"], ["#9affff", "#00b8c8"], ["#fff38a", "#e0b000"],
    ["#b8ff9a", "#2ad000"], ["#ff9ac4", "#e00070"], ["#d4a8ff", "#7a20e0"],
    ["#9affd8", "#00c888"], ["#ffc08a", "#ff6a00"], ["#9ad4ff", "#0090e0"],
    ["#ff9ad4", "#e00080"], ["#e8ff8a", "#a0c800"], ["#e0b8ff", "#8020e8"]
  ];
  const draw = [
    (id) => `<rect x="20" y="20" width="60" height="60" rx="8" fill="none" stroke="url(#${id})" stroke-width="5" filter="url(#${id}s)"/><rect x="34" y="34" width="32" height="32" rx="4" fill="url(#${id}r)"/>`,
    (id) => `<circle cx="50" cy="50" r="28" fill="none" stroke="url(#${id})" stroke-width="5" filter="url(#${id}s)"/><circle cx="50" cy="50" r="10" fill="url(#${id}r)"/><circle cx="50" cy="50" r="38" fill="none" stroke="url(#${id})" stroke-width="2" opacity="0.45"/>`,
    (id) => `<path d="M50 10 L59 40 L92 40 L66 58 L76 90 L50 72 L24 90 L34 58 L8 40 L41 40 Z" fill="none" stroke="url(#${id})" stroke-width="4" filter="url(#${id}s)"/><circle cx="50" cy="52" r="8" fill="url(#${id}r)"/>`,
    (id) => `<path d="M50 12 L88 84 H12 Z" fill="none" stroke="url(#${id})" stroke-width="5" filter="url(#${id}s)"/><path d="M50 32 L72 74 H28 Z" fill="url(#${id}r)" opacity="0.9"/>`,
    (id) => `<path d="M18 50 L50 18 L82 50 L50 82 Z" fill="none" stroke="url(#${id})" stroke-width="5" filter="url(#${id}s)"/><path d="M34 50 L50 34 L66 50 L50 66 Z" fill="url(#${id}r)"/>`,
    (id) => `<rect x="16" y="40" width="68" height="20" rx="4" fill="url(#${id})" filter="url(#${id}s)"/><rect x="40" y="16" width="20" height="68" rx="4" fill="url(#${id})"/>`,
    (id) => `<path d="M24 76 Q24 24 50 24 Q76 24 76 76" fill="none" stroke="url(#${id})" stroke-width="6" filter="url(#${id}s)"/><circle cx="50" cy="72" r="8" fill="url(#${id}r)"/>`,
    (id) => `<circle cx="32" cy="40" r="14" fill="none" stroke="url(#${id})" stroke-width="4"/><circle cx="68" cy="40" r="14" fill="none" stroke="url(#${id})" stroke-width="4"/><circle cx="50" cy="68" r="14" fill="none" stroke="url(#${id})" stroke-width="4"/><circle cx="50" cy="48" r="6" fill="url(#${id}r)"/>`,
    (id) => `<path d="M50 8 C72 30 88 46 50 92 C12 46 28 30 50 8 Z" fill="none" stroke="url(#${id})" stroke-width="5" filter="url(#${id}s)"/><circle cx="50" cy="48" r="8" fill="url(#${id}r)"/>`,
    (id) => `<polyline points="16,72 34,28 50,60 66,22 84,72" fill="none" stroke="url(#${id})" stroke-width="5" stroke-linejoin="round" filter="url(#${id}s)"/><circle cx="34" cy="28" r="5" fill="url(#${id}r)"/><circle cx="66" cy="22" r="5" fill="url(#${id}r)"/>`,
    (id) => `<rect x="20" y="20" width="60" height="60" rx="30" fill="none" stroke="url(#${id})" stroke-width="5" filter="url(#${id}s)"/><path d="M34 50 H66 M50 34 V66" stroke="url(#${id})" stroke-width="5"/>`,
    (id) => `<path d="M14 50 H86 M50 14 V86" stroke="url(#${id})" stroke-width="3.5" opacity="0.7"/><circle cx="50" cy="50" r="16" fill="none" stroke="url(#${id})" stroke-width="5"/><circle cx="50" cy="50" r="5" fill="url(#${id}r)"/>`
  ];
  return draw.map((fn, i) => svg("nx" + i, fn, pal[i][0], pal[i][1]));
}

function comidaFaces() {
  const pal = [
    ["#ffc4b0", "#e04a2a"], ["#ffe7a3", "#e0a100"], ["#c8ffe4", "#12a878"],
    ["#ffd0dc", "#e04870"], ["#b8e0ff", "#1a7ab8"], ["#ffd8b0", "#e08a30"],
    ["#fff1c2", "#d4a017"], ["#b8ffe0", "#1a9a78"], ["#ffc8b0", "#e06030"],
    ["#d8f0b0", "#6aa818"], ["#ffb8b8", "#e03030"], ["#c8d8f0", "#3a6a98"]
  ];
  const draw = [
    (id) => `<ellipse cx="50" cy="60" rx="32" ry="24" fill="url(#${id}r)" filter="url(#${id}s)"/><path d="M28 48 Q50 18 72 48" fill="url(#${id})"/><circle cx="40" cy="56" r="3" fill="#5c3317"/><circle cx="58" cy="62" r="3" fill="#5c3317"/><circle cx="50" cy="50" r="2.4" fill="#5c3317"/>`,
    (id) => `<circle cx="50" cy="54" r="28" fill="url(#${id}r)" filter="url(#${id}s)"/><path d="M34 40 Q50 56 66 40" fill="none" stroke="#fff" stroke-width="3" opacity="0.45"/><ellipse cx="50" cy="28" rx="11" ry="6" fill="#86efac"/>`,
    (id) => `<path d="M22 64 C22 30 78 30 78 64 Z" fill="url(#${id}r)" filter="url(#${id}s)"/><ellipse cx="50" cy="64" rx="28" ry="10" fill="url(#${id})"/><circle cx="50" cy="48" r="6" fill="#fff" opacity="0.35"/>`,
    (id) => `<ellipse cx="50" cy="56" rx="30" ry="26" fill="url(#${id}r)" filter="url(#${id}s)"/><path d="M26 44 Q50 72 74 44" fill="#fff" opacity="0.22"/><circle cx="42" cy="50" r="4" fill="#fff"/><circle cx="58" cy="52" r="3" fill="#fff"/>`,
    (id) => `<rect x="28" y="30" width="44" height="50" rx="8" fill="url(#${id})" filter="url(#${id}s)"/><rect x="34" y="38" width="32" height="8" rx="2" fill="#fff" opacity="0.35"/><rect x="34" y="52" width="32" height="8" rx="2" fill="#fff" opacity="0.35"/><circle cx="50" cy="22" r="8" fill="#86efac"/>`,
    (id) => `<path d="M50 16 C74 16 84 40 70 72 C60 90 40 90 30 72 C16 40 26 16 50 16 Z" fill="url(#${id}r)" filter="url(#${id}s)"/><path d="M50 16 C60 36 60 52 50 72" fill="none" stroke="#fff" stroke-width="3" opacity="0.35"/>`,
    (id) => `<ellipse cx="50" cy="62" rx="34" ry="18" fill="url(#${id})" filter="url(#${id}s)"/><path d="M18 56 Q50 24 82 56" fill="#ffd166"/><path d="M30 54 Q50 36 70 54" fill="url(#${id})" opacity="0.75"/>`,
    (id) => `<circle cx="50" cy="50" r="30" fill="url(#${id}r)" filter="url(#${id}s)"/><circle cx="50" cy="50" r="18" fill="#fff" opacity="0.16"/><circle cx="50" cy="50" r="8" fill="#fff"/><path d="M50 18 L55 40 L50 36 L45 40 Z" fill="#86efac"/>`,
    (id) => `<path d="M24 72 L36 28 H64 L76 72 Z" fill="url(#${id})" filter="url(#${id}s)"/><ellipse cx="50" cy="28" rx="18" ry="8" fill="#ffd166"/><path d="M40 46 H60 M38 56 H62" stroke="#fff" stroke-width="3" opacity="0.4"/>`,
    (id) => `<ellipse cx="50" cy="60" rx="26" ry="22" fill="url(#${id}r)" filter="url(#${id}s)"/><circle cx="50" cy="38" r="15" fill="url(#${id})"/><circle cx="44" cy="36" r="2.6" fill="#1a1200"/><circle cx="56" cy="36" r="2.6" fill="#1a1200"/><path d="M45 44 Q50 48 55 44" fill="none" stroke="#1a1200" stroke-width="2"/>`,
    (id) => `<path d="M50 88 C18 62 24 24 50 28 C76 24 82 62 50 88 Z" fill="url(#${id}r)" filter="url(#${id}s)"/><circle cx="50" cy="48" r="6" fill="#fff" opacity="0.28"/>`,
    (id) => `<rect x="16" y="40" width="68" height="28" rx="6" fill="url(#${id})" filter="url(#${id}s)"/><circle cx="34" cy="54" r="6" fill="#fff"/><circle cx="50" cy="54" r="6" fill="#fff"/><circle cx="66" cy="54" r="6" fill="#fff"/><path d="M28 40 L40 20 H60 L72 40" fill="#ffd166"/>`
  ];
  return draw.map((fn, i) => svg("mx" + i, fn, pal[i][0], pal[i][1]));
}

window.MEMORIUM_THEMES = {
  cosmos: { id: "cosmos", name: "Cosmos", faces: cosmosFaces() },
  flora: { id: "flora", name: "Flora", faces: floraFaces() },
  runas: { id: "runas", name: "Runas", faces: runasFaces() },
  neon: { id: "neon", name: "Neon", faces: neonFaces() },
  comida: { id: "comida", name: "Comida", faces: comidaFaces() }
};
