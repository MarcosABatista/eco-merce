<!-- app/components/painel/CartaoProdutoAdmin.vue — Cartão de produto na lista "Meus Produtos". -->
<!-- Imagem via proxy /api/imagens/..., preço com desconto riscado, badge "Inativo" quando -->
<!-- ativo=false, e ações Editar (navega) e Deletar (emite para a lista abrir o UModal de -->
<!-- confirmação). Sem lógica de remoção aqui — só sinaliza a intenção (design §6/RF-PAI-3). -->

<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatarPreco } from '~/utils/formatadores'
import { proxyImagem } from '~/utils/imagem'
import type { Produto } from '#shared/types/produto'

const props = defineProps<{
  produto: Produto
}>()

const emit = defineEmits<{
  // Pede à lista para confirmar e remover este produto (abre o UModal).
  deletar: [produto: Produto]
}>()

// URL de exibição via proxy local (ou null -> placeholder).
const urlExibicao = computed(() => proxyImagem(props.produto.urlImagem))
const imagemFalhou = ref(false)
</script>

<template>
  <UCard
    class="flex h-full flex-col"
    :ui="{ body: 'flex flex-1 flex-col gap-3 p-4' }"
    :data-testid="`cartao-admin-${props.produto.id}`"
  >
    <div class="relative aspect-video w-full overflow-hidden rounded-[--ui-radius] bg-elevated">
      <img
        v-if="urlExibicao && !imagemFalhou"
        :src="urlExibicao"
        :alt="props.produto.nome"
        class="size-full object-cover"
        data-testid="cartao-admin-imagem"
        @error="imagemFalhou = true"
      >
      <div
        v-else
        role="img"
        aria-label="Imagem indisponível"
        class="flex size-full flex-col items-center justify-center gap-1 text-muted"
        data-testid="cartao-admin-imagem-placeholder"
      >
        <UIcon name="i-lucide-image-off" class="size-10" aria-hidden="true" />
      </div>

      <UBadge
        v-if="!props.produto.ativo"
        color="neutral"
        variant="solid"
        class="absolute left-2 top-2"
        :data-testid="`cartao-admin-inativo-${props.produto.id}`"
      >
        Inativo
      </UBadge>
    </div>

    <h3 class="line-clamp-2 text-sm font-semibold text-highlighted" data-testid="cartao-admin-nome">
      {{ props.produto.nome }}
    </h3>

    <div class="mt-auto">
      <template v-if="props.produto.precoDesconto != null">
        <p class="text-xs text-dimmed line-through" data-testid="cartao-admin-preco-original">
          {{ formatarPreco(props.produto.preco) }}
        </p>
        <p class="text-lg font-bold text-primary" data-testid="cartao-admin-preco-desconto">
          {{ formatarPreco(props.produto.precoDesconto) }}
        </p>
      </template>
      <p v-else class="text-lg font-bold text-highlighted" data-testid="cartao-admin-preco">
        {{ formatarPreco(props.produto.preco) }}
      </p>
    </div>

    <div class="flex items-center gap-2">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-pencil"
        label="Editar"
        class="flex-1"
        :to="`/produtos/${props.produto.id}/editar`"
        :data-testid="`cartao-admin-editar-${props.produto.id}`"
      />
      <UButton
        color="error"
        variant="ghost"
        icon="i-lucide-trash-2"
        aria-label="Deletar produto"
        :data-testid="`cartao-admin-deletar-${props.produto.id}`"
        @click="emit('deletar', props.produto)"
      />
    </div>
  </UCard>
</template>
