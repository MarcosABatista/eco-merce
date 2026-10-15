<!-- app/components/vitrine/EstadoErro.vue — Estado de erro recuperável, inline (RF-VIT-4/§9). -->
<!-- Mensagem não técnica + botão "Tentar novamente" que emite 'tentar' (o pai refaz a busca). -->
<!-- Usado tanto na grade da home (sem derrubar cabeçalho/categorias) quanto no detalhe. -->

<script setup lang="ts">
import { VITRINE_ACAO_TENTAR_NOVAMENTE } from '#shared/constants/vitrine'

withDefaults(defineProps<{
  // Mensagem principal (ex.: "Serviço temporariamente indisponível").
  titulo: string
  // Processando o retry (desabilita o botão).
  carregando?: boolean
}>(), {
  carregando: false,
})

const emit = defineEmits<{
  // Pedido de nova tentativa.
  tentar: []
}>()
</script>

<template>
  <div
    role="alert"
    class="flex flex-col items-center justify-center gap-4 py-16 text-center"
    data-testid="estado-erro"
  >
    <UIcon name="i-lucide-triangle-alert" class="size-12 text-error" aria-hidden="true" />
    <p class="text-base font-semibold text-highlighted">
      {{ titulo }}
    </p>
    <UButton
      color="primary"
      variant="solid"
      icon="i-lucide-refresh-cw"
      :label="VITRINE_ACAO_TENTAR_NOVAMENTE"
      :loading="carregando"
      :disabled="carregando"
      data-testid="estado-erro-tentar"
      @click="emit('tentar')"
    />
  </div>
</template>
