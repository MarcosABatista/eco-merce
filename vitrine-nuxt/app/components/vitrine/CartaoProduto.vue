<!-- app/components/vitrine/CartaoProduto.vue — Cartão de produto da grade da home (RF-VIT-5). -->
<!-- UCard com imagem (NuxtImg + placeholder on-error, a11y fixa), categoria em UBadge pt-BR, nome -->
<!-- truncado em 2 linhas, nome da loja (oculto se nulo), preço BRL, bloco de desconto (riscado + -->
<!-- -X%) e CTAs "Ver Oferta" + WhatsApp compacto (stopPropagation). O card inteiro navega ao detalhe. -->

<script setup lang="ts">
import { ref } from 'vue'
import { formatarPreco } from '~/utils/formatadores'
import { rotuloCategoria } from '#shared/constants/categorias'
import { VITRINE_IMAGEM_INDISPONIVEL } from '#shared/constants/vitrine'
import type { Produto } from '#shared/types/produto'

const props = defineProps<{
  produto: Produto
}>()

// Controla a troca para o placeholder quando a imagem real falha ao carregar.
const imagemFalhou = ref(false)
</script>

<template>
  <UCard
    class="group flex h-full cursor-pointer flex-col transition-shadow hover:shadow-lg"
    :ui="{ body: 'flex flex-1 flex-col gap-2 p-3 sm:p-4' }"
    :data-testid="`cartao-produto-${props.produto.id}`"
    @click="navigateTo(`/produto/${props.produto.id}`)"
  >
    <!-- Imagem em contêiner de proporção fixa; placeholder acessível on-error/sem imagem. -->
    <div class="relative aspect-square w-full overflow-hidden rounded-[--ui-radius] bg-elevated">
      <NuxtImg
        v-if="props.produto.urlImagem && !imagemFalhou"
        :src="props.produto.urlImagem"
        :alt="props.produto.nome"
        loading="lazy"
        class="size-full object-cover transition-transform group-hover:scale-105"
        data-testid="cartao-imagem"
        @error="imagemFalhou = true"
      />
      <div
        v-else
        role="img"
        :aria-label="VITRINE_IMAGEM_INDISPONIVEL"
        class="flex size-full flex-col items-center justify-center gap-1 text-muted"
        data-testid="cartao-imagem-placeholder"
      >
        <UIcon name="i-lucide-image-off" class="size-10" aria-hidden="true" />
        <span class="text-xs">{{ VITRINE_IMAGEM_INDISPONIVEL }}</span>
      </div>

      <!-- Badge de desconto sobre a imagem quando houver preço com desconto. -->
      <UBadge
        v-if="props.produto.precoDesconto != null && props.produto.percentualDesconto != null"
        color="error"
        variant="solid"
        class="absolute left-2 top-2 font-bold"
        :data-testid="`cartao-desconto-badge-${props.produto.id}`"
      >
        -{{ props.produto.percentualDesconto }}%
      </UBadge>
    </div>

    <!-- Categoria em badge pt-BR (RF-VIT-5 / MEDIUM-2). -->
    <UBadge
      color="neutral"
      variant="subtle"
      class="w-fit"
      :data-testid="`cartao-categoria-${props.produto.id}`"
    >
      {{ rotuloCategoria(props.produto.categoria) }}
    </UBadge>

    <!-- Nome truncado em 2 linhas. -->
    <h3
      class="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-highlighted"
      data-testid="cartao-nome"
    >
      {{ props.produto.nome }}
    </h3>

    <!-- Nome da loja (oculto se nulo). -->
    <p
      v-if="props.produto.nomeLoja"
      class="truncate text-xs text-muted"
      data-testid="cartao-loja"
    >
      {{ props.produto.nomeLoja }}
    </p>

    <!-- Bloco de preço: com desconto (riscado + destaque) ou preço simples. -->
    <div class="mt-auto">
      <template v-if="props.produto.precoDesconto != null">
        <p class="text-xs text-dimmed line-through" data-testid="cartao-preco-original">
          {{ formatarPreco(props.produto.preco) }}
        </p>
        <p class="text-lg font-bold text-primary" data-testid="cartao-preco-desconto">
          {{ formatarPreco(props.produto.precoDesconto) }}
        </p>
      </template>
      <p v-else class="text-lg font-bold text-highlighted" data-testid="cartao-preco">
        {{ formatarPreco(props.produto.preco) }}
      </p>
    </div>

    <!-- CTAs: Ver Oferta (navega) + WhatsApp compacto (stopPropagation). -->
    <div class="flex items-center gap-2">
      <UButton
        color="primary"
        variant="solid"
        block
        label="Ver Oferta"
        class="flex-1"
        :data-testid="`cartao-ver-oferta-${props.produto.id}`"
        @click.stop="navigateTo(`/produto/${props.produto.id}`)"
      />
      <BotaoWhatsapp
        compacto
        :telefone="props.produto.telefone"
        :nome-produto="props.produto.nome"
        :testid="`cartao-whatsapp-${props.produto.id}`"
      />
    </div>
  </UCard>
</template>
