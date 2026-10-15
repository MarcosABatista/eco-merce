<!-- app/layouts/painel.vue — Layout autenticado do painel do lojista. -->
<!-- Cabeçalho com a marca + nome da loja e botão Sair (POST /api/sessao/logout com _token CSRF, -->
<!-- depois limpa a sessão local e volta ao login). Conteúdo via <slot />. Base de todas as telas -->
<!-- internas do painel (meus produtos, produto, usuário, perfil) — design §6. -->

<script setup lang="ts">
import { computed } from 'vue'

const { user, clear: limparSessao } = useUserSession()
const token = useTokenCsrf()
const toast = useToast()

// Rótulo da loja no cabeçalho: nome da loja quando houver, senão o nome do usuário.
const rotuloLoja = computed(() => user.value?.nomeLoja || user.value?.nome || 'Minha loja')

// Encerra a sessão no BFF (CSRF) e localmente, então redireciona ao login.
async function sair() {
  try {
    await $fetch('/api/sessao/logout', { method: 'POST', body: { _token: token.value } })
  }
  catch {
    toast.add({ title: 'Não foi possível sair agora. Tente novamente.', color: 'error' })
    return
  }
  await limparSessao()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-muted/30">
    <header
      class="sticky top-0 z-10 border-b border-default bg-default"
      data-testid="painel-cabecalho"
    >
      <UContainer class="flex items-center justify-between gap-4 py-3">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-bold text-primary"
          data-testid="painel-marca"
        >
          <UIcon name="i-lucide-store" class="size-5" aria-hidden="true" />
          <span>PlaceOffers</span>
        </NuxtLink>

        <div class="flex items-center gap-3">
          <span class="hidden max-w-[12rem] truncate text-sm text-muted sm:inline" data-testid="painel-loja">
            {{ rotuloLoja }}
          </span>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-log-out"
            label="Sair"
            data-testid="painel-sair"
            @click="sair"
          />
        </div>
      </UContainer>
    </header>

    <main class="flex-1" data-testid="painel-conteudo">
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </main>
  </div>
</template>
