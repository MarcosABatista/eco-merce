<!-- app/pages/vagas/index.vue — Home das "Minhas Vagas" do lojista logado. -->
<!-- Lista via BFF (usuarioId derivado da sessão, nunca do cliente). Renderiza ListaVagas -->
<!-- com botão "Cadastrar Nova Vaga". Erro tratado inline (não derruba o painel). -->

<script setup lang="ts">
import { computed } from 'vue'
import type { PageResponse, Vaga } from '#shared/types/vaga'

definePageMeta({ layout: 'painel' })

// Lista "Minhas Vagas" (o BFF força usuarioId = sessao.id; o cliente não escolhe o dono).
const { data, status, error, refresh } = await useFetch<PageResponse<Vaga>>('/api/vagas', {
  query: { page: 0, size: 50 },
})

const vagas = computed<Vaga[]>(() => data.value?.content ?? [])
const carregando = computed(() => status.value === 'pending')

// Após remover uma vaga, recarrega a lista a partir do BFF (reflete o soft delete).
async function aoRemovido() {
  await refresh()
}
</script>

<template>
  <div class="flex flex-col gap-6" data-testid="minhas-vagas">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-highlighted">
          Minhas Vagas
        </h1>
        <p class="text-sm text-muted">
          Anuncie oportunidades de emprego na sua vitrine.
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-lucide-plus"
        label="Cadastrar Nova Vaga"
        to="/vagas/novo"
        data-testid="minhas-vagas-adicionar"
      />
    </div>

    <!-- Erro de dados tratado inline (degradação graciosa — não derruba o painel). -->
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Não foi possível carregar suas vagas."
      description="Tente novamente em instantes."
      data-testid="minhas-vagas-erro"
    >
      <template #actions>
        <UButton color="error" variant="solid" label="Tentar novamente" @click="refresh()" />
      </template>
    </UAlert>

    <!-- Esqueletos durante o carregamento. -->
    <div v-else-if="carregando" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="minhas-vagas-carregando">
      <USkeleton v-for="n in 6" :key="n" class="h-64 w-full" />
    </div>

    <PainelListaVagas
      v-else
      :vagas="vagas"
      @removido="aoRemovido"
    />
  </div>
</template>
