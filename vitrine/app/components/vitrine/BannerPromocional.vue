<!-- app/components/vitrine/BannerPromocional.vue — Banner promocional compacto da home (RF-VIT-2). -->
<!-- Fundo com cor semântica (primary) distinta das seções adjacentes; título <=60 truncado com -->
<!-- reticência pelo helper. Altura compacta para caber (com o cabeçalho fixo) acima da dobra em -->
<!-- viewport de 768px de altura (NIT-4). Decorativo: aria-hidden nos ícones. -->

<script setup lang="ts">
import { computed } from 'vue'
import { truncarTexto } from '~/utils/formatadores'
import {
  VITRINE_BANNER_SUBTITULO,
  VITRINE_BANNER_TITULO,
  VITRINE_BANNER_TITULO_MAX,
} from '#shared/constants/vitrine'

// Título truncado para no máximo 60 caracteres (RF-VIT-2).
const titulo = computed(() => truncarTexto(VITRINE_BANNER_TITULO, VITRINE_BANNER_TITULO_MAX))
</script>

<template>
  <section
    class="w-full bg-primary text-inverted"
    aria-label="Destaque promocional"
    data-testid="banner-promocional"
  >
    <UContainer class="flex items-center gap-4 py-4 sm:py-5">
      <UIcon
        name="i-lucide-badge-percent"
        class="hidden size-10 shrink-0 sm:block"
        aria-hidden="true"
      />
      <div class="min-w-0">
        <p class="truncate text-lg font-bold sm:text-2xl" data-testid="banner-titulo">
          {{ titulo }}
        </p>
        <p class="truncate text-sm opacity-90 sm:text-base">
          {{ VITRINE_BANNER_SUBTITULO }}
        </p>
      </div>
    </UContainer>
  </section>
</template>
