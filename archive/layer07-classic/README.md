# layer07.cl — snapshot clásico

Copia congelada del sitio marketing de **layer07.cl** (layout, páginas, chrome y tokens) tal como estaba **antes** del restyle alineado a SEVEN.

Fecha: 2026-09-02  
Tag git: `archive/layer07-classic`

## Para qué sirve

- Comparar el look anterior con el actual sin deshacer el trabajo nuevo.
- Restaurar archivos puntuales si hace falta.

## Restaurar

Desde la raíz del repo:

```bash
git checkout archive/layer07-classic -- \
  src/app/'(marketing)' \
  src/components/layout \
  src/components/home \
  src/components/ui \
  src/components/shared \
  src/components/contact \
  src/components/portfolio \
  src/app/globals.css \
  src/app/layout.tsx \
  src/app/not-found.tsx \
  src/lib/site.ts
```

O copiar desde esta carpeta hacia `src/`.

Este snapshot no incluye labs (`/s/seven`, `/s/neo`, …) ni `node_modules`.
