<!-- app/components/vitrine/CabecalhoVitrine.vue — Cabeçalho fixo da vitrine (RF-VIT-1). -->
<!-- Faixa primária estilo marketplace (Shopee/Mercado Livre): logo à esquerda, barra de busca -->
<!-- proeminente e arredondada ao centro (busca por nome do produto OU da loja, client-side) e -->
<!-- ícone decorativo à direita. Fixo no topo ao rolar. O termo é v-model (busca client-side). -->

<script setup lang="ts">
import { VITRINE_BUSCA_ARIA, VITRINE_BUSCA_PLACEHOLDER, VITRINE_MARCA } from '#shared/constants/vitrine'

// v-model do termo de busca (controlado pela página; busca é client-side, case-insensitive).
const termo = defineModel<string>({ default: '' })
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full bg-primary text-inverted shadow-sm"
    data-testid="cabecalho-vitrine"
  >
    <UContainer class="flex h-16 items-center gap-3 sm:h-20 sm:gap-6">
      <!-- Logo / marca: link para a home. -->
      <NuxtLink
        to="/"
        class="flex shrink-0 items-center gap-2 font-extrabold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverted"
        data-testid="cabecalho-logo"
      >
        <UIcon name="i-lucide-store" class="size-6 sm:size-7" aria-hidden="true" />
        <span class="text-base sm:text-xl">{{ VITRINE_MARCA }}</span>
      </NuxtLink>

      <!-- Barra de busca ao centro, proeminente e arredondada. -->
      <div class="min-w-0 flex-1">
        <UInput
          v-model="termo"
          type="search"
          icon="i-lucide-search"
          :placeholder="VITRINE_BUSCA_PLACEHOLDER"
          size="lg"
          color="neutral"
          variant="none"
          class="w-full"
          :ui="{
            root: 'w-full',
            base: 'rounded-full bg-default text-default placeholder:text-dimmed shadow-md ring-0 focus-visible:ring-2 focus-visible:ring-inverted/40',
            leadingIcon: 'text-dimmed',
          }"
          :aria-label="VITRINE_BUSCA_ARIA"
          data-testid="cabecalho-busca"
        />
      </div>

      <!-- Ícone decorativo (carrinho) — a negociação é externa, mas reforça a estética marketplace. -->
      <UIcon
        name="i-lucide-shopping-cart"
        class="hidden size-6 shrink-0 sm:block"
        aria-hidden="true"
      />
    </UContainer>
  </header>
</template>
