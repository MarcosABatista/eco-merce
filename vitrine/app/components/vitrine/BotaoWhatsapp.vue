<!-- app/components/vitrine/BotaoWhatsapp.vue — Botão de contato via WhatsApp (RF-VIT-9). -->
<!-- Monta o link wa.me pela regra canônica; quando o telefone é inválido o botão NÃO é -->
<!-- renderizado no DOM (v-if sobre a URL). Verde da marca #25D366 (única hex autorizada). -->
<!-- stopPropagation para não navegar ao detalhe quando usado dentro do card clicável. -->

<script setup lang="ts">
import { computed } from 'vue'
import { montarUrlWhatsapp } from '~/utils/whatsapp'
import { WHATSAPP_COR_MARCA } from '#shared/constants/whatsapp'

const props = withDefaults(defineProps<{
  // Telefone bruto do lojista (pode vir mascarado/nulo).
  telefone: string | null | undefined
  // Nome do produto para a mensagem pré-preenchida.
  nomeProduto: string | null | undefined
  // Variante compacta (card) ou completa (detalhe).
  compacto?: boolean
  // Rótulo exibido no modo completo.
  rotulo?: string
  // id de teste do elemento.
  testid?: string
}>(), {
  compacto: false,
  rotulo: 'Chamar no WhatsApp',
  testid: 'botao-whatsapp',
})

// URL do WhatsApp (null quando telefone inválido -> botão oculto).
const url = computed(() => montarUrlWhatsapp(props.telefone, props.nomeProduto))
</script>

<template>
  <a
    v-if="url"
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    :style="{ backgroundColor: WHATSAPP_COR_MARCA }"
    class="inline-flex items-center justify-center gap-2 rounded-[--ui-radius] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="compacto ? 'size-11 shrink-0' : 'h-11 w-full px-4'"
    :aria-label="compacto ? `Falar no WhatsApp sobre ${nomeProduto ?? 'o produto'}` : undefined"
    :data-testid="testid"
    @click.stop
  >
    <UIcon name="i-lucide-message-circle" class="size-5 shrink-0" aria-hidden="true" />
    <span v-if="!compacto">{{ rotulo }}</span>
  </a>
</template>
