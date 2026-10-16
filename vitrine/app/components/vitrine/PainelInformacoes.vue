<!-- app/components/vitrine/PainelInformacoes.vue — Painel de informações do detalhe (RF-VIT-8). -->
<!-- Categoria-tag clicável (navega à home filtrada), nome em h1, preço em destaque (>=1,5x bold), -->
<!-- bloco de desconto quando aplicável e botão "Chamar no WhatsApp". Ocupa ~40% no desktop. -->

<script setup lang="ts">
import { formatarPreco } from '~/utils/formatadores'
import { rotuloCategoria } from '#shared/constants/categorias'
import type { Produto } from '#shared/types/produto'

const props = defineProps<{
  produto: Produto
}>()

// Navega à home filtrando pela categoria do produto (categoria-tag clicável).
function filtrarPorCategoria() {
  navigateTo({ path: '/', query: { categoria: props.produto.categoria } })
}
</script>

<template>
  <div class="flex flex-col gap-4" data-testid="painel-informacoes">
    <!-- Categoria como tag clicável. -->
    <UButton
      color="neutral"
      variant="subtle"
      size="sm"
      class="w-fit"
      :label="rotuloCategoria(props.produto.categoria)"
      data-testid="painel-categoria"
      @click="filtrarPorCategoria"
    />

    <!-- Nome do produto (h1). -->
    <h1 class="text-2xl font-bold text-highlighted" data-testid="painel-nome">
      {{ props.produto.nome }}
    </h1>

    <!-- Preço em destaque + bloco de desconto quando houver. -->
    <div data-testid="painel-preco">
      <template v-if="props.produto.precoDesconto != null">
        <div class="flex items-center gap-2">
          <span class="text-base text-dimmed line-through" data-testid="painel-preco-original">
            {{ formatarPreco(props.produto.preco) }}
          </span>
          <UBadge
            v-if="props.produto.percentualDesconto != null"
            color="error"
            variant="solid"
            class="font-bold"
          >
            -{{ props.produto.percentualDesconto }}%
          </UBadge>
        </div>
        <p class="text-3xl font-bold text-primary" data-testid="painel-preco-desconto">
          {{ formatarPreco(props.produto.precoDesconto) }}
        </p>
      </template>
      <p v-else class="text-3xl font-bold text-highlighted">
        {{ formatarPreco(props.produto.preco) }}
      </p>
    </div>

    <!-- Contato direto com a loja. -->
    <VitrineBotaoWhatsapp
      :telefone="props.produto.telefone"
      :nome-produto="props.produto.nome"
      rotulo="Chamar no WhatsApp"
      testid="painel-whatsapp"
    />
  </div>
</template>
