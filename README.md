# MEMÓRIUM

Jogo da memória premium no navegador. Original, em português do Brasil. PC e celular.

## Jogar

**Live:** https://kt3746.github.io/grokbot-memorium/?v=19

- Modos: **Clássico** e **Relógio** (cada par soma tempo)
- Temas: Cosmos, Flora, Runas, Neon, Comida
- Dificuldades: Fácil / Médio / Difícil
- Confete na vitória, dica, recordes locais
- Fundo ambiente em **Three.js** (baixo-poli, local, sem CDN). Se o aparelho não tiver WebGL, o jogo segue com os orbes 2D de CSS.

**Portal:** https://kt3746.github.io/grokbot-portal/

## Visual 3D

O cenário atrás das cartas usa Three.js **r160** em `js/vendor/three.module.js` (licença MIT). O `importmap` no `index.html` aponta `"three"` para esse arquivo. Cartas, HUD, toque e menus continuam em HTML/CSS — o canvas `#view3d` fica atrás e não captura clique.

Cada tema troca a paleta e as formas (sólidos, pétalas, runas, fragmentos neon, blobs de comida). Em celular / aparelho fraco o pixel ratio é limitado, sombras ficam desligadas e há menos malhas. `prefers-reduced-motion` congela a cena. Aba oculta ou menu parado por um tempo pausa o loop para poupar bateria.

Se o WebGL falhar, aparece um aviso curto em português e o fundo clássico (`.bg` / orbes) permanece.

## Rodar local

```bash
python3 -m http.server 8080
```
