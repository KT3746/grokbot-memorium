# MEMÓRIUM

Jogo da memória premium no navegador. Original, em português do Brasil. Funciona no PC e no celular.

## Jogar

**Live:** https://kt3746.github.io/memorium/?v=2

1. Escolha a dificuldade (Fácil / Médio / Difícil) e o tema (Cosmos / Flora / Runas).
2. Vire duas cartas. Pares ficam abertos; erros viram de volta.
3. Use **?** para uma dica (+2 movimentos).
4. Quebre seu próprio recorde (salvo no navegador).

## Rodar local

Abra `index.html` num servidor estático, por exemplo:

```bash
python3 -m http.server 8080
```

## Deploy

GitHub Pages (branch `main`, pasta `/`). Após mudanças, use cache-bust `?v=` nos assets e na URL.
