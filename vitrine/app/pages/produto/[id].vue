<!-- app/pages/produto/[id].vue — Detalhe do produto estilo Mercado Livre (RF-VIT-8/11). -->
<!-- definePageMeta.validate barra id não numérico (redireciona à home). Grid lg:grid-cols-5 -->
<!-- (galeria col-span-3 ~60%, painel col-span-2 ~40%), empilha abaixo de 1024px. Erros: 404 -> -->
<!-- "Produto não encontrado" + voltar; timeout(>30s)/5xx -> erro recuperável + "Tentar novamente". -->

<script setup lang="ts">
import { computed } from 'vue'
import {
  VITRINE_MSG_ERRO_DETALHE,
  VITRINE_MSG_PRODUTO_NAO_ENCONTRADO,
} from '#shared/constants/vitrine'
import type { Produto } from '#shared/types/produto'

definePageMeta({
  // Só prossegue com id inteiro positivo; não numérico cai no validate (false) -> redireciona.
  validate(route) {
    const id = route.params.id
    return typeof id === 'string' && /^\d+$/.test(id)
  },
})

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

// Busca o detalhe pelo BFF (SSR + hidratação). Não-fatal: tratamos 404 vs 5xx na própria página.
const { data: produto, status, error, refresh } = await useFetch<Produto>(
  () => `/api/produtos/${id.value}`,
)

const carregando = computed(() => status.value === 'pending')
// 404 do BFF -> produto inexistente (não recuperável, oferece voltar à home).
const naoEncontrado = computed(() => error.value?.statusCode === 404)
// Demais erros (502/timeout/rede) -> recuperável com "Tentar novamente".
const erroRecuperavel = computed(() => !!error.value && !naoEncontrado.value)

function voltarHome() {
  router.push('/')
}

async function tentarNovamente() {
  await refresh()
}
</script>

<template>
  <UContainer class="py-6">
    <!-- Carregando: trilha + colunas em esqueleto. -->
    <div v-if="carregando" class="flex flex-col gap-6" data-testid="detalhe-carregando">
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

    <!-- 404: produto não encontrado + voltar à home. -->
    <div
      v-else-if="naoEncontrado"
      role="alert"
      class="flex flex-col items-center justify-center gap-4 py-20 text-center"
      data-testid="detalhe-nao-encontrado"
    >
      <UIcon name="i-lucide-package-x" class="size-14 text-muted" aria-hidden="true" />
      <p class="text-lg font-semibold text-highlighted">
        {{ VITRINE_MSG_PRODUTO_NAO_ENCONTRADO }}
      </p>
      <UButton
        color="primary"
        icon="i-lucide-arrow-left"
        label="Voltar para a home"
        data-testid="detalhe-voltar"
        @click="voltarHome"
      />
    </div>

    <!-- Erro recuperável (timeout/5xx): tentar novamente (retries ilimitados). -->
    <VitrineEstadoErro
      v-else-if="erroRecuperavel"
      :titulo="VITRINE_MSG_ERRO_DETALHE"
      :carregando="carregando"
      @tentar="tentarNovamente"
    />

    <!-- Detalhe carregado. -->
    <div v-else-if="produto" class="flex flex-col gap-6" data-testid="detalhe-produto">
      <VitrineTrilhaNavegacao :categoria="produto.categoria" :nome="produto.nome" />

      <div class="grid gap-6 lg:grid-cols-5">
        <!-- Galeria ~60% no desktop. -->
        <div class="lg:col-span-3">
          <VitrineGaleriaImagem :url="produto.urlImagem" :nome="produto.nome" />
        </div>
        <!-- Painel de informações ~40% no desktop. -->
        <div class="lg:col-span-2">
          <VitrinePainelInformacoes :produto="produto" />
        </div>
      </div>

      <USeparator />
      <VitrineSecaoDescricao :descricao="produto.descricao" />
      <VitrineSecaoVendedor :nome-loja="produto.nomeLoja" :telefone="produto.telefone" />
    </div>
  </UContainer>
</template>
