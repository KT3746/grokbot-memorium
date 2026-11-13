# MEMÓRIUM

Jogo da memória premium no navegador. Original, em português do Brasil. PC e celular.

## Jogar

**Live:** https://kt3746.github.io/grokbot-memorium/?v=202611122345

- Modos: **Clássico** e **Relógio** (cada par soma tempo)
- Temas: Cosmos, Flora, Runas, Neon, Comida
- Dificuldades: Fácil / Médio / Difícil
- Confete na vitória, dica, recordes locais
- Fundo ambiente em **Three.js** (baixo-poli, local, sem CDN). Se o aparelho não tiver WebGL, o jogo segue com os orbes 2D de CSS.

**Portal:** https://kt3746.github.io/grokbot-portal/

## Onda 8

- **Jogo corrido**: errou? Toque a próxima carta e as duas erradas viram na hora (antes: 0,9 s de espera em que o toque era ignorado)
- **Erro justo**: só conta como erro quando você **já tinha visto** o par; descobrir carta nova não é erro. A dica só pisca depois de 2 esquecimentos; o resumo mostra "pares esquecidos" ou "sem esquecer nenhum par!"
- **3 estrelas alcançáveis e visíveis**: meta embaixo de Movimentos ("★★★ até 13"); 3★ = até 1,6× os pares (antes pares+2, só na sorte); a vitória diz quantos movimentos faltaram
- **Figuras maiores** nas cartas (88% da face) e avisos que não saem da tela

## Onda 7

- **Marcos ligados**: primeiro par, meio caminho, quase lá / último par e combo agora aparecem de verdade
- **Dica sugerida**: depois de 3 erros o botão Dica pisca
- **Sem erros!** no resumo da vitória quando a partida saiu limpa

Cache `?v=202611122345`.

## Visual 3D

O cenário atrás das cartas usa Three.js **r160** em `js/vendor/three.module.js` (licença MIT). O `importmap` no `index.html` aponta `"three"` para esse arquivo. Cartas, HUD, toque e menus continuam em HTML/CSS — o canvas `#view3d` fica atrás e não captura clique.

Cada tema troca a paleta e as formas (sólidos, pétalas, runas, fragmentos neon, blobs de comida). Em celular / aparelho fraco o pixel ratio é limitado, sombras ficam desligadas e há menos malhas. `prefers-reduced-motion` congela a cena. Aba oculta ou menu parado por um tempo pausa o loop para poupar bateria.

Se o WebGL falhar, aparece um aviso curto em português e o fundo clássico (`.bg` / orbes) permanece.

## Rodar local

```bash
python3 -m http.server 8080
```
