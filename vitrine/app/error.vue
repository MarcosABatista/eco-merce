<!-- app/error.vue — Página de erro global da vitrine (degradação graciosa — RF-VIT-10/§9). -->
<!-- Captura erros fatais (rota inexistente, exceção não tratada) e mostra mensagem NÃO técnica + -->
<!-- ação de voltar à home; nunca tela branca nem detalhe interno/stack. clearError + navegação. -->

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

// Distingue 404 (página inexistente) dos demais, sem vazar detalhe técnico.
function voltarHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <UApp>
    <div
      class="flex min-h-screen flex-col items-center justify-center gap-5 bg-muted/30 p-6 text-center"
      data-testid="pagina-erro"
    >
      <UIcon name="i-lucide-circle-alert" class="size-16 text-primary" aria-hidden="true" />
      <h1 class="text-2xl font-bold text-highlighted">
        {{ error?.statusCode === 404 ? 'Página não encontrada' : 'Algo deu errado' }}
      </h1>
      <p class="max-w-md text-muted">
        {{ error?.statusCode === 404
          ? 'A página que você procura não existe ou foi movida.'
          : 'Não foi possível concluir sua solicitação agora. Tente novamente em instantes.' }}
      </p>
      <UButton
        color="primary"
        size="lg"
        icon="i-lucide-house"
        label="Voltar para a home"
        data-testid="erro-voltar"
        @click="voltarHome"
      />
    </div>
  </UApp>
</template>
