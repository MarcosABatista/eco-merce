<!-- app/components/vitrine/BannerPromocional.vue — Banner promocional da home (RF-VIT-2). -->
<!-- Hero com gradiente da cor primária (estilo marketplace), título <=60 truncado, selo "direto -->
<!-- com a loja" e padrão decorativo. Altura compacta para caber acima da dobra em 768px (NIT-4). -->
<!-- Decorativo: aria-hidden nos ícones; cores semânticas do design system (sem hex solto). -->

<script setup lang="ts">
import { computed } from 'vue'
import { truncarTexto } from '~/utils/formatadores'
import {
  VITRINE_BANNER_SELO,
  VITRINE_BANNER_SUBTITULO,
  VITRINE_BANNER_TITULO,
  VITRINE_BANNER_TITULO_MAX,
} from '#shared/constants/vitrine'

// Título truncado para no máximo 60 caracteres (RF-VIT-2).
const titulo = computed(() => truncarTexto(VITRINE_BANNER_TITULO, VITRINE_BANNER_TITULO_MAX))
</script>

<template>
  <section
    class="w-full bg-gradient-to-r from-primary to-primary/70 text-inverted"
    aria-label="Destaque promocional"
    data-testid="banner-promocional"
  >
    <UContainer class="relative overflow-hidden">
      <!-- Círculos decorativos de fundo. -->
      <div
        class="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-inverted/10"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-16 right-24 size-48 rounded-full bg-inverted/5"
        aria-hidden="true"
      />

      <div class="relative flex items-center gap-4 py-6 sm:py-10">
        <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-inverted/15 sm:size-20">
          <UIcon name="i-lucide-badge-percent" class="size-8 sm:size-11" aria-hidden="true" />
        </div>
        <div class="min-w-0">
          <span
            class="mb-2 inline-flex items-center gap-1 rounded-full bg-inverted/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            data-testid="banner-selo"
          >
            <UIcon name="i-lucide-store" class="size-3.5" aria-hidden="true" />
            {{ VITRINE_BANNER_SELO }}
          </span>
          <p class="truncate text-xl font-extrabold sm:text-3xl" data-testid="banner-titulo">
            {{ titulo }}
          </p>
          <p class="truncate text-sm opacity-90 sm:text-lg">
            {{ VITRINE_BANNER_SUBTITULO }}
          </p>
        </div>
      </div>
    </UContainer>
  </section>
</template>
