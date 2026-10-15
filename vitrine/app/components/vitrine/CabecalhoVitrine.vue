<!-- app/components/vitrine/CabecalhoVitrine.vue — Cabeçalho fixo da vitrine (RF-VIT-1). -->
<!-- Logo "PLACE OFFERS" à esquerda e Barra_de_Busca ao centro, fixo no topo ao rolar. -->
<!-- Usa <header> nativo (fallback aprovado no design §5) para controle total da altura compacta -->
<!-- exigida pelo critério above-the-fold (NIT-4). O termo de busca é v-model (busca client-side). -->

<script setup lang="ts">
import { VITRINE_MARCA } from '#shared/constants/vitrine'

// v-model do termo de busca (controlado pela página; busca é client-side, case-insensitive).
const termo = defineModel<string>({ default: '' })
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-default bg-default/95 backdrop-blur"
    data-testid="cabecalho-vitrine"
  >
    <UContainer class="flex h-16 items-center gap-4">
      <!-- Logo / marca: link para a home. -->
      <NuxtLink
        to="/"
        class="shrink-0 text-lg font-extrabold tracking-tight text-primary sm:text-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        data-testid="cabecalho-logo"
      >
        {{ VITRINE_MARCA }}
      </NuxtLink>

      <!-- Barra de busca ao centro, ocupando o espaço disponível. -->
      <div class="min-w-0 flex-1">
        <UInput
          v-model="termo"
          type="search"
          icon="i-lucide-search"
          placeholder="Buscar produtos"
          size="lg"
          class="w-full"
          :ui="{ root: 'w-full' }"
          aria-label="Buscar produtos"
          data-testid="cabecalho-busca"
        />
      </div>
    </UContainer>
  </header>
</template>
