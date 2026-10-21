<!-- app/pages/vagas/[id].vue — Detalhe de uma vaga na vitrine. -->
<!-- definePageMeta.validate barra id não numérico. Erros: 404 -> "Vaga não encontrada" + voltar;
---> timeout/5xx -> erro recuperável + "Tentar novamente". -->

<script setup lang="ts">
import { computed } from 'vue'
import { VITRINE_MSG_ERRO_DETALHE } from '#shared/constants/vitrine'
import type { Vaga } from '#shared/types/vaga'

definePageMeta({
  validate(route) {
    const id = route.params.id
    return typeof id === 'string' && /^\d+$/.test(id)
  },
})

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

const { data: vaga, status, error, refresh } = await useFetch<Vaga>(
  () => `/api/vagas/${id.value}`,
)

const carregando = computed(() => status.value === 'pending')
const naoEncontrado = computed(() => error.value?.statusCode === 404)
const erroRecuperavel = computed(() => !!error.value && !naoEncontrado.value)

function voltarHome() {
  router.push('/vagas')
}

async function tentarNovamente() {
  await refresh()
}
</script>

<template>
  <UContainer class="py-6">
    <!-- Carregando: trilha + colunas em esqueleto. -->
    <div v-if="carregando" class="flex flex-col gap-6" data-testid="vaga-detalhe-carregando">
      <USkeleton class="h-5 w-64" />
      <div class="grid gap-6 lg:grid-cols-5">
        <USkeleton class="aspect-square w-full lg:col-span-3" />
        <div class="flex flex-col gap-4 lg:col-span-2">
          <USkeleton class="h-6 w-24" />
          <USkeleton class="h-8 w-3/4" />
          <USkeleton class="h-10 w-40" />
          <USkeleton class="h-11 w-full" />
        </div>
      </div>
    </div>

    <!-- 404: vaga não encontrada + voltar. -->
    <div
      v-else-if="naoEncontrado"
      role="alert"
      class="flex flex-col items-center justify-center gap-4 py-20 text-center"
      data-testid="vaga-detalhe-nao-encontrado"
    >
      <UIcon name="i-lucide-briefcase-x" class="size-14 text-muted" aria-hidden="true" />
      <p class="text-lg font-semibold text-highlighted">
        Vaga não encontrada
      </p>
      <UButton
        color="primary"
        icon="i-lucide-arrow-left"
        label="Voltar para as vagas"
        data-testid="vaga-detalhe-voltar"
        @click="voltarHome"
      />
    </div>

    <!-- Erro recuperável (timeout/5xx): tentar novamente. -->
    <VitrineEstadoErro
      v-else-if="erroRecuperavel"
      :titulo="VITRINE_MSG_ERRO_DETALHE"
      :carregando="carregando"
      @tentar="tentarNovamente"
    />

    <!-- Detalhe carregado. -->
    <div v-else-if="vaga" class="flex flex-col gap-6" data-testid="vaga-detalhe-vaga">
      <div class="grid gap-6 lg:grid-cols-5">
        <!-- Painel de informações ~40% no desktop (esquerdo). -->
        <div class="lg:col-span-2">
          <div class="flex items-start gap-1.5">
            <UIcon name="i-lucide-briefcase" class="size-4 text-muted" aria-hidden="true" />
            <UBadge
              color="neutral"
              variant="subtle"
              class="text-xs"
              :data-testid="`vaga-detalhe-categoria-${vaga.id}`"
            >
              {{ vaga.categoria || 'Sem categoria' }}
            </UBadge>
          </div>

          <h1 class="text-2xl font-bold text-highlighted mt-1" data-testid="vaga-detalhe-cargo">
            {{ vaga.cargo }}
          </h1>

          <p v-if="vaga.nomeLoja" class="text-sm text-muted" data-testid="vaga-detalhe-loja">
            <span class="font-semibold">Loja:</span> {{ vaga.nomeLoja }}
          </p>

          <p v-if="vaga.descricao" class="mt-4 text-sm text-default leading-relaxed" data-testid="vaga-detalhe-descricao">
            {{ vaga.descricao }}
          </p>

          <div class="mt-4 flex items-center gap-2 text-xs text-muted">
            <UIcon name="i-lucide-clock" class="size-4" aria-hidden="true" />
            <span>Publicada em {{ vaga.createdAt }}</span>
          </div>
        </div>

        <!-- Espaço vazio ~60% no desktop (para simetria com o detalhe de produto). -->
        <div class="lg:col-span-3">
          <div class="aspect-square w-full rounded-[--ui-radius] border border-dashed border-default bg-elevated flex flex-col items-center justify-center gap-2 text-muted">
            <UIcon name="i-lucide-building-2" class="size-16" aria-hidden="true" />
            <span class="text-sm">Sem imagem da vaga</span>
          </div>
        </div>
      </div>

      <USeparator />

      <div class="flex items-center gap-2 mt-4">
        <UButton
          color="primary"
          variant="solid"
          label="Ver Vaga"
          :disabled="true"
          data-testid="vaga-detalhe-ver"
        />
        <VitrineBotaoWhatsapp
          :telefone="null"
          :nome-produto="vaga.cargo"
          :testid="`vaga-detalhe-whatsapp-${vaga.id}`"
        />
      </div>
    </div>
  </UContainer>
</template>
