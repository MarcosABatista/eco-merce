<!-- app/components/vitrine/GaleriaImagem.vue — Galeria da imagem do detalhe (RF-VIT-8). -->
<!-- Imagem real com alt={nome}; placeholder on-error/sem imagem com role="img" + aria-label fixo -->
<!-- (NIT-1 / product-detail Req 7.5). Ocupa ~60% no desktop (col-span-3 definido na página). -->

<script setup lang="ts">
import { ref } from 'vue'
import { VITRINE_IMAGEM_INDISPONIVEL } from '#shared/constants/vitrine'

const props = defineProps<{
  // URL da imagem (null -> placeholder).
  url: string | null
  // Nome do produto para o alt da imagem real.
  nome: string
}>()

const imagemFalhou = ref(false)
</script>

<template>
  <div
    class="aspect-square w-full overflow-hidden rounded-[--ui-radius] border border-default bg-elevated"
    data-testid="galeria-imagem"
  >
    <NuxtImg
      v-if="props.url && !imagemFalhou"
      :src="props.url"
      :alt="props.nome"
      class="size-full object-contain"
      data-testid="galeria-imagem-real"
      @error="imagemFalhou = true"
    />
    <div
      v-else
      role="img"
      :aria-label="VITRINE_IMAGEM_INDISPONIVEL"
      class="flex size-full flex-col items-center justify-center gap-2 text-muted"
      data-testid="galeria-imagem-placeholder"
    >
      <UIcon name="i-lucide-image-off" class="size-16" aria-hidden="true" />
      <span class="text-sm">{{ VITRINE_IMAGEM_INDISPONIVEL }}</span>
    </div>
  </div>
</template>
