<!-- app/pages/login.vue — Página de login do lojista (painel). -->
<!-- O token CSRF é gerado no SSR (useTokenCsrf) e enviado como _token no POST /api/sessao/login. -->
<!-- UForm/UFormField com email + senha (toggle de visibilidade). Qualquer falha vira mensagem -->
<!-- genérica (não-enumeração). Em sucesso, hidrata a sessão e vai para a home (design §6/RF-PAI-1). -->

<script setup lang="ts">
import { reactive, ref, watchEffect } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import { loginSchema } from '#shared/schemas/login'

definePageMeta({ layout: false })

const token = useTokenCsrf()
const { fetch: hidratarSessao } = useUserSession()

const estado = reactive<{ email: string, senha: string, _token: string }>({
  email: '',
  senha: '',
  _token: token.value,
})

watchEffect(() => {
  estado._token = token.value
})

const mostrarSenha = ref(false)
const enviando = ref(false)
const erroGeral = ref('')

async function aoSubmeter(_evento: FormSubmitEvent<{ email: string, senha: string, _token: string }>) {
  erroGeral.value = ''
  enviando.value = true
  try {
    await $fetch('/api/sessao/login', {
      method: 'POST',
      body: { email: estado.email, senha: estado.senha, _token: token.value },
    })
    await hidratarSessao()
    await navigateTo('/')
  }
  catch {
    // Mensagem genérica: não revela se o e-mail existe nem se a conta está inativa.
    erroGeral.value = 'E-mail ou senha inválidos.'
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-muted/30 p-6">
    <UCard class="w-full max-w-md" data-testid="login-cartao">
      <template #header>
        <div class="flex flex-col items-center gap-2 text-center">
          <UIcon name="i-lucide-store" class="size-8 text-primary" aria-hidden="true" />
          <h1 class="text-xl font-bold text-highlighted">
            Painel daqui
          </h1>
          <p class="text-sm text-muted">
            Acesse para gerenciar sua loja e produtos.
          </p>
        </div>
      </template>

      <UForm
        :schema="loginSchema"
        :state="estado"
        class="flex flex-col gap-4"
        data-testid="login-formulario"
        @submit="aoSubmeter"
      >
        <UAlert
          v-if="erroGeral"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :title="erroGeral"
          data-testid="login-erro"
        />

        <UFormField label="E-mail" name="email" required>
          <UInput
            v-model="estado.email"
            type="email"
            placeholder="email@exemplo.com"
            autocomplete="email"
            class="w-full"
            data-testid="login-email"
          />
        </UFormField>

        <UFormField label="Senha" name="senha" required>
          <UInput
            v-model="estado.senha"
            :type="mostrarSenha ? 'text' : 'password'"
            placeholder="Sua senha"
            autocomplete="current-password"
            class="w-full"
            data-testid="login-senha"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="mostrarSenha ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
                data-testid="login-alternar-senha"
                @click="mostrarSenha = !mostrarSenha"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          :loading="enviando"
          label="Entrar"
          data-testid="login-enviar"
        />
      </UForm>
    </UCard>
  </div>
</template>
