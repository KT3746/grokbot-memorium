/** @typedef {{ id: string, name: string, faces: string[] }} Theme */

const SVG = {
  wrap(inner, colors) {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  }
};

function cosmosFaces() {
  const c = ["#9ec1ff", "#f0b429", "#ff8fab", "#7dffb3", "#c9a0ff", "#ffd978", "#5eead4", "#ffa07a", "#a5b4fc", "#f9a8d4", "#86efac", "#fcd34d"];
  const shapes = [
    // star
    (col) => `<polygon points="50,8 61,38 94,38 67,58 78,90 50,70 22,90 33,58 6,38 39,38" fill="${col}"/>`,
    // planet + ring
    (col) => `<circle cx="50" cy="50" r="22" fill="${col}"/><ellipse cx="50" cy="50" rx="38" ry="10" fill="none" stroke="#fff" stroke-width="3" opacity="0.7" transform="rotate(-20 50 50)"/>`,
    // moon
    (col) => `<circle cx="50" cy="50" r="26" fill="${col}"/><circle cx="62" cy="42" r="20" fill="#12182a"/>`,
    // comet
    (col) => `<circle cx="68" cy="32" r="12" fill="${col}"/><path d="M56 40 L18 78 L28 70 L22 88 Z" fill="${col}" opacity="0.85"/>`,
    // constellation
    (col) => `<circle cx="22" cy="30" r="4" fill="${col}"/><circle cx="50" cy="18" r="4" fill="${col}"/><circle cx="78" cy="34" r="4" fill="${col}"/><circle cx="40" cy="60" r="4" fill="${col}"/><circle cx="70" cy="70" r="4" fill="${col}"/><path d="M22 30 L50 18 L78 34 L70 70 L40 60 Z" fill="none" stroke="${col}" stroke-width="2"/>`,
    // saturn-ish
    (col) => `<ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="${col}" stroke-width="4"/><circle cx="50" cy="50" r="18" fill="${col}"/>`,
    // black hole swirl
    (col) => `<circle cx="50" cy="50" r="10" fill="#0b0f1a"/><circle cx="50" cy="50" r="28" fill="none" stroke="${col}" stroke-width="6" stroke-dasharray="12 8"/><circle cx="50" cy="50" r="40" fill="none" stroke="${col}" stroke-width="3" opacity="0.5"/>`,
    // rocket
    (col) => `<path d="M50 12 L62 48 L50 42 L38 48 Z" fill="${col}"/><rect x="44" y="48" width="12" height="22" rx="3" fill="${col}"/><path d="M44 70 L38 88 L50 78 L62 88 L56 70" fill="${col}" opacity="0.8"/>`,
    // alien
    (col) => `<ellipse cx="50" cy="48" rx="28" ry="32" fill="${col}"/><ellipse cx="38" cy="48" rx="7" ry="12" fill="#0b0f1a"/><ellipse cx="62" cy="48" rx="7" ry="12" fill="#0b0f1a"/>`,
    // galaxy
    (col) => `<ellipse cx="50" cy="50" rx="36" ry="14" fill="none" stroke="${col}" stroke-width="5" transform="rotate(35 50 50)"/><ellipse cx="50" cy="50" rx="36" ry="14" fill="none" stroke="${col}" stroke-width="3" opacity="0.5" transform="rotate(-25 50 50)"/><circle cx="50" cy="50" r="8" fill="${col}"/>`,
    // satellite
    (col) => `<rect x="42" y="38" width="16" height="24" rx="3" fill="${col}"/><rect x="18" y="46" width="20" height="8" rx="2" fill="${col}" opacity="0.85"/><rect x="62" y="46" width="20" height="8" rx="2" fill="${col}" opacity="0.85"/><circle cx="50" cy="30" r="6" fill="${col}"/>`,
    // sun rays
    (col) => `<circle cx="50" cy="50" r="16" fill="${col}"/><g stroke="${col}" stroke-width="4" stroke-linecap="round"><line x1="50" y1="12" x2="50" y2="24"/><line x1="50" y1="76" x2="50" y2="88"/><line x1="12" y1="50" x2="24" y2="50"/><line x1="76" y1="50" x2="88" y2="50"/><line x1="22" y1="22" x2="30" y2="30"/><line x1="70" y1="70" x2="78" y2="78"/><line x1="78" y1="22" x2="70" y2="30"/><line x1="30" y1="70" x2="22" y2="78"/></g>`
  ];
  return shapes.map((fn, i) => SVG.wrap(fn(c[i % c.length])));
}

function floraFaces() {
  const c = ["#7dffb3", "#ff8fab", "#f0b429", "#86efac", "#fda4af", "#a3e635", "#f9a8d4", "#4ade80", "#fb7185", "#bef264", "#f472b6", "#34d399"];
  const shapes = [
    (col) => `<circle cx="50" cy="50" r="14" fill="${col}"/><g fill="${col}"><ellipse cx="50" cy="26" rx="12" ry="16"/><ellipse cx="50" cy="74" rx="12" ry="16"/><ellipse cx="26" cy="50" rx="16" ry="12"/><ellipse cx="74" cy="50" rx="16" ry="12"/></g>`,
    (col) => `<path d="M50 88 C50 88 18 60 18 40 C18 24 32 18 50 36 C68 18 82 24 82 40 C82 60 50 88 50 88 Z" fill="${col}"/>`,
    (col) => `<path d="M50 18 C58 40 80 48 50 88 C20 48 42 40 50 18 Z" fill="${col}"/><path d="M50 50 C40 52 30 62 28 72" fill="none" stroke="#14532d" stroke-width="3"/>`,
    (col) => `<circle cx="50" cy="42" r="22" fill="${col}"/><rect x="46" y="60" width="8" height="26" rx="3" fill="#166534"/><ellipse cx="34" cy="72" rx="12" ry="6" fill="#22c55e" transform="rotate(-30 34 72)"/><ellipse cx="66" cy="72" rx="12" ry="6" fill="#22c55e" transform="rotate(30 66 72)"/>`,
    (col) => `<g fill="${col}"><circle cx="50" cy="28" r="10"/><circle cx="32" cy="40" r="10"/><circle cx="68" cy="40" r="10"/><circle cx="36" cy="60" r="10"/><circle cx="64" cy="60" r="10"/><circle cx="50" cy="48" r="8" fill="#fef3c7"/></g>`,
    (col) => `<ellipse cx="50" cy="58" rx="28" ry="26" fill="${col}"/><path d="M36 40 Q50 10 64 40" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round"/><circle cx="40" cy="54" r="4" fill="#0b0f1a"/><circle cx="60" cy="54" r="4" fill="#0b0f1a"/><path d="M42 68 Q50 74 58 68" fill="none" stroke="#0b0f1a" stroke-width="3"/>`,
    (col) => `<path d="M20 70 C30 30 70 30 80 70 Z" fill="${col}"/><rect x="46" y="68" width="8" height="18" fill="#166534"/>`,
    (col) => `<circle cx="50" cy="50" r="30" fill="none" stroke="${col}" stroke-width="8"/><circle cx="50" cy="50" r="12" fill="${col}"/><circle cx="50" cy="18" r="6" fill="${col}"/><circle cx="50" cy="82" r="6" fill="${col}"/><circle cx="18" cy="50" r="6" fill="${col}"/><circle cx="82" cy="50" r="6" fill="${col}"/>`,
    (col) => `<path d="M50 12 L58 40 L88 40 L64 58 L74 88 L50 70 L26 88 L36 58 L12 40 L42 40 Z" fill="${col}" opacity="0.9"/><circle cx="50" cy="52" r="10" fill="#fef3c7"/>`,
    (col) => `<ellipse cx="50" cy="55" rx="18" ry="30" fill="${col}"/><path d="M50 25 C70 25 78 45 50 55 C22 45 30 25 50 25 Z" fill="${col}" opacity="0.75"/>`,
    (col) => `<path d="M50 90 L50 40" stroke="#166534" stroke-width="5"/><path d="M50 48 C20 30 28 8 50 22 C72 8 80 30 50 48 Z" fill="${col}"/><ellipse cx="34" cy="62" rx="14" ry="7" fill="#22c55e" transform="rotate(-25 34 62)"/>`,
    (col) => `<g fill="${col}"><circle cx="50" cy="50" r="8"/><circle cx="28" cy="35" r="10"/><circle cx="72" cy="35" r="10"/><circle cx="24" cy="60" r="9"/><circle cx="76" cy="60" r="9"/><circle cx="50" cy="78" r="9"/></g>`
  ];
  return shapes.map((fn, i) => SVG.wrap(fn(c[i % c.length])));
}

function runasFaces() {
  const c = ["#ff8a5b", "#f0b429", "#c9a0ff", "#5eead4", "#fda4af", "#93c5fd", "#fbbf24", "#a78bfa", "#fb7185", "#34d399", "#fcd34d", "#818cf8"];
  const shapes = [
    (col) => `<path d="M50 10 L70 90 L50 75 L30 90 Z" fill="none" stroke="${col}" stroke-width="6" stroke-linejoin="round"/>`,
    (col) => `<path d="M25 20 L75 20 L75 80 L25 80" fill="none" stroke="${col}" stroke-width="6"/><line x1="25" y1="50" x2="75" y2="50" stroke="${col}" stroke-width="6"/>`,
    (col) => `<circle cx="50" cy="50" r="28" fill="none" stroke="${col}" stroke-width="6"/><path d="M50 22 L50 78 M28 40 L72 60 M28 60 L72 40" stroke="${col}" stroke-width="5"/>`,
    (col) => `<path d="M50 12 L88 78 L12 78 Z" fill="none" stroke="${col}" stroke-width="6" stroke-linejoin="round"/><circle cx="50" cy="55" r="8" fill="${col}"/>`,
    (col) => `<path d="M20 75 L50 15 L80 75" fill="none" stroke="${col}" stroke-width="6"/><path d="M32 55 H68" stroke="${col}" stroke-width="6"/>`,
    (col) => `<rect x="22" y="22" width="56" height="56" rx="8" fill="none" stroke="${col}" stroke-width="6"/><path d="M35 50 H65 M50 35 V65" stroke="${col}" stroke-width="6"/>`,
    (col) => `<path d="M50 15 V85 M20 35 L50 50 L80 35 M20 65 L50 50 L80 65" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round"/>`,
    (col) => `<path d="M30 20 V80 M30 20 L70 50 L30 80" fill="none" stroke="${col}" stroke-width="6" stroke-linejoin="round"/>`,
    (col) => `<path d="M25 25 L75 25 L50 75 Z" fill="none" stroke="${col}" stroke-width="6"/><circle cx="50" cy="40" r="7" fill="${col}"/>`,
    (col) => `<path d="M50 18 L82 50 L50 82 L18 50 Z" fill="none" stroke="${col}" stroke-width="6"/><path d="M50 32 V68 M32 50 H68" stroke="${col}" stroke-width="5"/>`,
    (col) => `<path d="M22 50 H78 M40 25 L60 75 M60 25 L40 75" stroke="${col}" stroke-width="6" stroke-linecap="round"/>`,
    (col) => `<circle cx="50" cy="50" r="30" fill="none" stroke="${col}" stroke-width="6"/><path d="M50 28 L65 68 H35 Z" fill="${col}"/>`
  ];
  return shapes.map((fn, i) => SVG.wrap(fn(c[i % c.length])));
}

/** @type {Record<string, Theme>} */
window.MEMORIUM_THEMES = {
  cosmos: { id: "cosmos", name: "Cosmos", faces: cosmosFaces() },
  flora: { id: "flora", name: "Flora", faces: floraFaces() },
  runas: { id: "runas", name: "Runas", faces: runasFaces() }
};
