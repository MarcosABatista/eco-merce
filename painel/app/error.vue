<!-- app/error.vue — Página de erro global do painel (degradação graciosa — design §9). -->
<!-- Captura erros fatais (rota inexistente, exceção não tratada, falha de dados que precisa do -->
<!-- recurso) e mostra mensagem NÃO técnica + ação de voltar; nunca tela branca nem stack. -->

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

// Volta à home do painel limpando o estado de erro (sem vazar detalhe técnico).
function voltarInicio() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <UApp>
    <div
      class="flex min-h-screen flex-col items-center justify-center gap-5 bg-muted/30 p-6 text-center"
      data-testid="painel-pagina-erro"
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
        label="Voltar ao início"
        data-testid="painel-erro-voltar"
        @click="voltarInicio"
      />
    </div>
  </UApp>
</template>
