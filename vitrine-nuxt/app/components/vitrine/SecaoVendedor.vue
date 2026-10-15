<!-- app/components/vitrine/SecaoVendedor.vue — Seção do vendedor no detalhe (RF-VIT-8). -->
<!-- Exibe nome da loja e telefone com fallbacks quando ausentes (nunca mostra "null"). -->

<script setup lang="ts">
const props = defineProps<{
  nomeLoja: string | null
  telefone: string | null
}>()
</script>

<template>
  <section aria-labelledby="titulo-vendedor" data-testid="secao-vendedor">
    <h2 id="titulo-vendedor" class="mb-2 text-lg font-bold text-highlighted">
      Vendedor
    </h2>
    <div class="flex items-center gap-3 rounded-[--ui-radius] border border-default bg-default p-3">
      <UIcon name="i-lucide-store" class="size-8 text-primary" aria-hidden="true" />
      <div class="min-w-0">
        <p class="truncate font-semibold text-highlighted" data-testid="vendedor-loja">
          {{ props.nomeLoja || 'Loja não informada' }}
        </p>
        <p class="truncate text-sm text-muted" data-testid="vendedor-telefone">
          {{ props.telefone || 'Telefone não informado' }}
        </p>
      </div>
    </div>
  </section>
</template>
