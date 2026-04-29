# Ficha Técnica Frontend — Harvverse

## 1) Objetivo

Este documento describe el frontend implementado para Harvverse (demo testnet), con enfoque de reutilización por otros equipos: arquitectura, sistema visual, componentes, rutas, contratos de datos y pasos de integración.

---

## 2) Stack y base técnica

- **Framework:** Next.js (App Router) + React + TypeScript.
- **UI:** Tailwind CSS + DaisyUI (tema custom `harvverse`).
- **Web3/UI base:** RainbowKit + Scaffold-ETH 2 (`@scaffold-ui/components`).
- **Fuentes:** Geist (sans) + IBM Plex Mono (mono).
- **Tema forzado:** `data-theme="harvverse"` en layout raíz.

Archivos base:
- `packages/nextjs/app/layout.tsx`
- `packages/nextjs/styles/globals.css`

---

## 3) Principios de diseño implementados

- **Dark premium + glassmorphism:** superficies `glass` y `glass-strong`.
- **Legibilidad de datos onchain:** hashes, estados y métricas con tipografía mono.
- **Prueba antes que promesa:** UI orientada a evidencia verificable y settlement determinístico.
- **Navegación por rol:** experiencia separada para partner, admin y custody.
- **Demo boundary explícito:** disclaimers visibles (testnet, MockUSDC, no financial advice).

---

## 4) Sistema visual reutilizable

### Paleta principal (tokens)

Definida en `packages/nextjs/styles/globals.css`:

- `--color-harv-bg`: `#081412`
- `--color-harv-primary`: `#0e5e4b`
- `--color-harv-secondary`: `#22a06b`
- `--color-harv-accent`: `#c8a96b`
- `--color-harv-mint`: `#7fffd4`
- `--color-harv-text`: `#f5f7f6`
- `--color-harv-muted`: `#9fb5ad`

### Utilidades CSS clave

- Efectos de superficie: `glass`, `glass-strong`
- Fondo técnico: `grid-overlay`, `grid-overlay-dense`
- Tipografía de datos: `mono-hash`, `eyebrow`
- Estado visual: `shadow-glow`, `shadow-glow-gold`
- Marca textual: `text-gradient-harv`
- Divisor: `divider-harv`
- Motion: `animate-drift`, `animate-pulse-glow`, `animate-float-slow`

---

## 5) Arquitectura de frontend

### Estructura por dominios

- **Landing y discovery público:** `/`, `/partner/lots`, `/partner/lots/[lotCode]`
- **Flujo de propuesta/partner:** `/partner/proposals/[proposalId]`, `/partner/dashboard`
- **Operación admin:** `/admin`, `/admin/milestones`, `/admin/settlement`
- **Operación custodia:** `/custody/settlement-funding`

### Layouts por rol

- `packages/nextjs/app/partner/layout.tsx`
- `packages/nextjs/app/admin/layout.tsx`
- `packages/nextjs/app/custody/layout.tsx`

Cada layout comparte:
- `GridBackdrop` como base visual
- barra superior contextual por rol
- navegación secundaria interna del dominio

---

## 6) Librería de componentes Harvverse

Barrel export: `packages/nextjs/components/harvverse/index.ts`

### Core layout / superficie
- `Section`
- `GlassCard`
- `GridBackdrop`
- `TopographicLines`
- `ParticleField`
- `HeroParticleField`

### Branding / visual language
- `HarvverseLogo`
- `CoffeeBeanArt`

### Data display
- `MetricCard`
- `StatusPill`
- `MonoHash`
- `WalletPillMock`

### Flujo de prueba/evidencia
- `MilestoneStep`
- `ProofTimeline`
- `CertificateProofCard`
- `SettlementProofPanel`
- `AIExplanationCard`

### Entidades de negocio
- `LotCard`
- `LotMapPreview`

### Utilidad de demo
- `RoleSwitcher` (simulación de contexto de rol)

---

## 7) Contrato de datos (mock-first, listo para Convex)

Los tipos del frontend están centralizados en:
- `packages/nextjs/lib/mock/types.ts`

Entidades principales:
- `Lot`
- `Plan`
- `Proposal`
- `Partnership`
- `EvidenceRecord`
- `Settlement`

Estado actual de integración:
- El frontend usa datos mock (`packages/nextjs/lib/mock/*`).
- Ya hay puntos de reemplazo con TODOs `useQuery(api...)` en páginas clave.
- La migración a backend real está preparada para cambio incremental (misma forma de datos).

---

## 8) Flujo funcional implementado en UI

1. **Discover lot** (`/` y `/partner/lots`)
2. **Ver detalle + términos bloqueados** (`/partner/lots/[lotCode]`)
3. **Crear/confirmar propuesta** (`/partner/proposals/[proposalId]`)
4. **Seguir partnership y milestones** (`/partner/dashboard`)
5. **Registrar y atestar evidencia** (`/admin/milestones`)
6. **Preparar/ejecutar settlement** (`/admin/settlement`)
7. **Fondeo de pool para settlement** (`/custody/settlement-funding`)

---

## 9) Reutilización rápida en otro proyecto

### Opción A — Reutilizar “tal cual” dentro de este monorepo

1. Mantener:
   - `packages/nextjs/components/harvverse/*`
   - `packages/nextjs/styles/globals.css` (tokens/classes Harvverse)
   - rutas `app/partner`, `app/admin`, `app/custody`
2. Ajustar copy, datos mock y navegación según producto.
3. Reemplazar mocks por queries reales en cada TODO.

### Opción B — Portar sólo Design System + patrones

Copiar como mínimo:
- `components/harvverse/*`
- tokens y clases utilitarias Harvverse de `globals.css`
- `HarvverseLogo`, `Section`, `GlassCard`, `MetricCard`, `StatusPill`, `MonoHash`

Después:
- mapear nuevos tipos de dominio al contrato de componentes
- conservar estructura visual de `Section` + cards para coherencia UX

---

## 10) Dependencias funcionales que no romper

- DaisyUI habilitado con tema `harvverse`.
- `ThemeProvider` forzado en `data-theme="harvverse"`.
- `@rainbow-me/rainbowkit/styles.css` y `@scaffold-ui/components/styles.css` cargados en layout raíz.
- Navegación principal y conectividad wallet desde `packages/nextjs/components/Header.tsx`.

---

## 11) Riesgos y límites actuales

- Es una demo de testnet con `MockUSDC`.
- Parte del flujo depende de fixtures/mocks aún no conectados a backend productivo.
- Hay estados visuales de operación (admin/custody) que deben protegerse con autorización real al pasar a producción.

---

## 12) Checklist para pasar a producción

- [ ] Sustituir `lib/mock/*` por `useQuery/api` y mutaciones reales.
- [ ] Integrar control de acceso real por rol (no sólo `RoleSwitcher`).
- [ ] Conectar estados de settlement/evidence a eventos onchain y reconciliación backend.
- [ ] Añadir pruebas E2E de flujo completo (partner -> admin -> custody -> settlement).
- [ ] Endurecer textos legales y disclaimers por jurisdicción.

---

## 13) Inventario de archivos clave

- `packages/nextjs/app/layout.tsx`
- `packages/nextjs/styles/globals.css`
- `packages/nextjs/components/Header.tsx`
- `packages/nextjs/components/harvverse/index.ts`
- `packages/nextjs/app/page.tsx`
- `packages/nextjs/app/partner/dashboard/page.tsx`
- `packages/nextjs/app/partner/lots/page.tsx`
- `packages/nextjs/app/partner/lots/[lotCode]/page.tsx`
- `packages/nextjs/app/partner/proposals/[proposalId]/page.tsx`
- `packages/nextjs/app/admin/page.tsx`
- `packages/nextjs/app/admin/milestones/page.tsx`
- `packages/nextjs/app/admin/settlement/page.tsx`
- `packages/nextjs/app/custody/settlement-funding/page.tsx`
- `packages/nextjs/lib/mock/types.ts`

