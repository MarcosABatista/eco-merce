<!-- app/pages/perfil.vue — Edição do perfil/loja do lojista logado (painel). -->
<!-- Carrega o próprio usuário (GET /api/usuarios/{sessao.id}) e usa FormularioPerfil. Ao salvar, -->
<!-- PUT /api/usuarios/{sessao.id} com _token CSRF: o BFF re-grava o cookie de sessão com os novos -->
<!-- dados; o cliente re-hidrata a sessão para refletir no cabeçalho (design §6/RF-PAI-7). -->

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Usuario, ValoresPerfil } from '#shared/types/usuario'

definePageMeta({ layout: 'painel' })

const token = useTokenCsrf()
const toast = useToast()
const { user, fetch: hidratarSessao } = useUserSession()
const formRef = ref()
const enviando = ref(false)

// Carrega o próprio perfil (o BFF autoriza só o dono/admin).
const idSessao = computed(() => user.value?.id ?? 0)
const { data: usuario, error } = await useFetch<Usuario>(() => `/api/usuarios/${idSessao.value}`)

interface ErroCampos { data?: { fieldErrors?: Array<{ field: string, message: string }> } }

async function salvar(valores: ValoresPerfil) {
  if (!idSessao.value) return
  enviando.value = true
  try {
    await $fetch(`/api/usuarios/${idSessao.value}`, { method: 'PUT', body: { ...valores, _token: token.value } })
    // Re-hidrata a sessão (o BFF já re-gravou o cookie) para o cabeçalho refletir a mudança.
    await hidratarSessao()
    toast.add({ title: 'Perfil atualizado.', color: 'success' })
    await navigateTo('/')
  }
  catch (erro) {
    const fieldErrors = (erro as ErroCampos)?.data?.fieldErrors
    if (fieldErrors?.length) {
      formRef.value?.aplicarErrosDeCampo(fieldErrors)
    }
    else {
      toast.add({ title: 'Não foi possível atualizar o perfil.', color: 'error' })
    }
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6" data-testid="perfil">
    <div class="flex items-center gap-3">
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Voltar" to="/" data-testid="perfil-voltar" />
      <h1 class="text-2xl font-bold text-highlighted">
        Meu Perfil
      </h1>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Não foi possível carregar seu perfil."
      data-testid="perfil-erro"
    />

    <PainelFormularioPerfil
      v-else-if="usuario"
      ref="formRef"
      :usuario="usuario"
      :enviando="enviando"
      @enviar="salvar"
    />
  </div>
</template>
