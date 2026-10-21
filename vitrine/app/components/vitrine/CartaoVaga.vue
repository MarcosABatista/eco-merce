<!-- app/components/vitrine/CartaoVaga.vue — Cartão de vaga da grade da vitrine. -->
<!-- UCard com categoria, cargo (nome da vaga), descrição truncada, nome da loja e CTAs -->
-->"Ver Vaga" (navega ao detalhe) + WhatsApp compacto (se houver telefone). O card inteiro navega. -->
<script setup lang="ts">
import { VITRINE_IMAGEM_INDISPONIVEL } from '#shared/constants/vitrine'
import type { Vaga } from '#shared/types/vaga'

const props = defineProps<{
  vaga: Vaga
}>()

const router = useRouter()

function verVaga() {
  router.push(`/vagas/${props.vaga.id}`)
}
</script>

<template>
  <UCard
    class="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-primary/30"
    :ui="{ body: 'flex flex-1 flex-col gap-2 p-3 sm:p-4' }"
    :data-testid="`cartao-vaga-${props.vaga.id}`"
    @click="verVaga"
  >
    <!-- Contêiner superior com ícone de categoria + categoria. -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <UIcon name="i-lucide-briefcase" class="size-4 text-muted" aria-hidden="true" />
        <UBadge
          color="neutral"
          variant="subtle"
          class="text-xs"
          :data-testid="`cartao-vaga-categoria-${props.vaga.id}`"
        >
          {{ props.vaga.categoria || 'Sem categoria' }}
        </UBadge>
      </div>
    </div>

    <!-- Cargo (nome da vaga) truncado em 2 linhas. -->
    <h3
      class="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-highlighted"
      data-testid="cartao-vaga-cargo"
    >
      {{ props.vaga.cargo }}
    </h3>

    <!-- Nome da loja (oculto se nulo). -->
    <p v-if="props.vaga.nomeLoja" class="truncate text-xs text-muted" data-testid="cartao-vaga-loja">
      {{ props.vaga.nomeLoja }}
    </p>

    <!-- Descrição truncada em 3 linhas. -->
    <p
      v-if="props.vaga.descricao"
      class="line-clamp-3 min-h-[3.6rem] text-sm text-muted mt-1"
      data-testid="cartao-vaga-descricao"
    >
      {{ props.vaga.descricao }}
    </p>

    <!-- CTAs: Ver Vaga (navega) + WhatsApp compacto (stopPropagation). -->
    <div class="mt-auto flex items-center gap-2">
      <UButton
        color="primary"
        variant="solid"
        block
        label="Ver Vaga"
        class="flex-1"
        :data-testid="`cartao-vaga-ver-${props.vaga.id}`"
        @click.stop="verVaga"
      />
      <VitrineBotaoWhatsapp
        compacto
        :telefone="null"
        :nome-produto="props.vaga.cargo"
        :testid="`cartao-vaga-whatsapp-${props.vaga.id}`"
      />
    </div>
  </UCard>
</template>
