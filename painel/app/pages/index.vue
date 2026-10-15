<!-- app/pages/index.vue — Home do painel: "Meus Produtos" do lojista logado. -->
<!-- useFetch('/api/produtos') (usuarioId derivado da sessão no BFF, nunca do cliente). Lista via -->
<!-- ListaProdutos (ativos e inativos, badge "Inativo") + botão "Adicionar Novo Produto". Erro de -->
<!-- dados é tratado inline (não derruba o painel) e removido do estado após deletar (design §6/RF-PAI-3). -->

<script setup lang="ts">
import { computed } from 'vue'
import type { PageResponse, Produto } from '#shared/types/produto'

definePageMeta({ layout: 'painel' })

// Lista "Meus Produtos" (o BFF força usuarioId = sessao.id; o cliente não escolhe o dono).
const { data, status, error, refresh } = await useFetch<PageResponse<Produto>>('/api/produtos', {
  query: { page: 0, size: 50 },
})

const produtos = computed<Produto[]>(() => data.value?.content ?? [])
const carregando = computed(() => status.value === 'pending')

// Após remover um produto, atualiza a lista a partir do BFF (reflete o soft delete).
async function aoRemover() {
  await refresh()
}
</script>

<template>
  <div class="flex flex-col gap-6" data-testid="meus-produtos">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">
          Meus Produtos
        </h1>
        <p class="text-sm text-muted">
          Gerencie as ofertas que aparecem na sua vitrine.
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-lucide-plus"
        label="Adicionar Novo Produto"
        to="/produtos/novo"
        data-testid="meus-produtos-adicionar"
      />
    </div>

    <!-- Erro de dados tratado inline (degradação graciosa — não derruba o painel). -->
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Não foi possível carregar seus produtos."
      description="Tente novamente em instantes."
      data-testid="meus-produtos-erro"
    >
      <template #actions>
        <UButton color="error" variant="solid" label="Tentar novamente" @click="refresh()" />
      </template>
    </UAlert>

    <!-- Esqueletos durante o carregamento. -->
    <div v-else-if="carregando" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="meus-produtos-carregando">
      <USkeleton v-for="n in 6" :key="n" class="h-64 w-full" />
    </div>

    <ListaProdutos v-else :produtos="produtos" @removido="aoRemover" />
  </div>
</template>
