<!-- app/layouts/default.vue — Layout padrão da vitrine: cabeçalho fixo + conteúdo + rodapé. -->
<!-- O cabeçalho e o rodapé vivem aqui (fora do bloco da grade), de modo que um erro de dados da -->
<!-- grade NÃO os derruba (degradação graciosa — design §9/RF-VIT-10). O termo de busca é um -->
<!-- estado compartilhado (useState) lido pela home; o layout só o liga à barra de busca. -->

<script setup lang="ts">
import { VITRINE_MARCA } from '#shared/constants/vitrine'

// Termo de busca compartilhado com a home via useState (mesma chave do composable useProdutos).
const termoBusca = useState<string>('vitrine-produtos-busca', () => '')
const anoAtual = new Date().getFullYear()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-muted/30">
    <VitrineCabecalhoVitrine v-model="termoBusca" />

    <main class="flex-1" data-testid="vitrine-conteudo">
      <slot />
    </main>

    <footer
      class="border-t border-default bg-default py-6 text-sm text-muted"
      data-testid="vitrine-rodape"
    >
      <UContainer class="flex flex-col items-center gap-1 text-center">
        <span class="font-semibold text-primary">{{ VITRINE_MARCA }}</span>
        <span>&copy; {{ anoAtual }} — Vitrine de ofertas. Negociação direto com a loja.</span>
      </UContainer>
    </footer>
  </div>
</template>
