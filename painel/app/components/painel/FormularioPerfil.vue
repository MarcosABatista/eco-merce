<!-- app/components/painel/FormularioPerfil.vue — Formulário de edição de perfil/loja do painel. -->
<!-- UForm validado pelo atualizacaoUsuarioSchema (edição parcial): nome, email, telefone, nomeLoja, -->
<!-- nova senha (em branco MANTÉM a atual, logo é omitida) e imagem (upload imediato, userId=sessão). -->
<!-- Ao salvar, o BFF re-grava a sessão com os novos dados (design §6/RF-PAI-7). -->

<script setup lang="ts">
import { reactive, ref, watchEffect } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import { atualizacaoUsuarioSchema } from '#shared/schemas/usuario'
import type { Usuario, ValoresPerfil } from '#shared/types/usuario'

const props = defineProps<{
  // Usuário atual (carregado do BFF) a editar.
  usuario: Usuario
  // Indica envio em andamento (desabilita o botão).
  enviando?: boolean
}>()

const emit = defineEmits<{
  // Dados validados prontos para atualizar (sem _token; a página injeta o CSRF). Senha em branco
  // é omitida (null) para o BFF manter a atual.
  // ValoresPerfil é definido em #shared/types/usuario (export não é permitido em <script setup>).
  enviar: [valores: ValoresPerfil]
}>()

const token = useTokenCsrf()
const formRef = ref()

const estado = reactive<{
  nome: string
  email: string
  telefone: string | null
  nomeLoja: string | null
  senha: string
  imagemLoja: string | null
  _token: string
}>({
  nome: props.usuario.nome,
  email: props.usuario.email,
  telefone: props.usuario.telefone,
  nomeLoja: props.usuario.nomeLoja,
  senha: '',
  imagemLoja: props.usuario.imagemLoja,
  _token: token.value,
})

watchEffect(() => {
  estado._token = token.value
})

// Recebe a urlImagem do upload imediato (userId = sessão).
function aoEnviarImagem(url: string) {
  estado.imagemLoja = url
}

function aoSubmeter(evento: FormSubmitEvent<Record<string, unknown>>) {
  // Senha em branco é omitida (mantém a atual); senão vai no payload.
  const senha = estado.senha.trim()
  emit('enviar', {
    nome: estado.nome,
    email: estado.email,
    telefone: estado.telefone,
    nomeLoja: estado.nomeLoja,
    imagemLoja: estado.imagemLoja,
    ...(senha ? { senha } : {}),
  })
}

function aplicarErrosDeCampo(fieldErrors: Array<{ field: string, message: string }>) {
  formRef.value?.setErrors(fieldErrors.map(e => ({ name: e.field, message: e.message })))
}

defineExpose({ aplicarErrosDeCampo })
</script>

<template>
  <UForm
    ref="formRef"
    :schema="atualizacaoUsuarioSchema"
    :state="estado"
    class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2"
    data-testid="formulario-perfil"
    @submit="aoSubmeter"
  >
    <UFormField label="Nome" name="nome">
      <UInput v-model="estado.nome" class="w-full" data-testid="perfil-nome" />
    </UFormField>

    <UFormField label="E-mail" name="email">
      <UInput v-model="estado.email" type="email" class="w-full" data-testid="perfil-email" />
    </UFormField>

    <UFormField label="Telefone" name="telefone" hint="opcional">
      <UInput v-model="estado.telefone" placeholder="(00) 00000-0000" class="w-full" data-testid="perfil-telefone" />
    </UFormField>

    <UFormField label="Nome da loja" name="nomeLoja" hint="opcional">
      <UInput v-model="estado.nomeLoja" class="w-full" data-testid="perfil-nomeloja" />
    </UFormField>

    <UFormField label="Nova senha" name="senha" hint="deixe em branco para manter" class="sm:col-span-2">
      <UInput
        v-model="estado.senha"
        type="password"
        placeholder="Mínimo 8 caracteres"
        class="w-full"
        data-testid="perfil-senha"
      />
    </UFormField>

    <UFormField label="Imagem da loja" name="imagemLoja" hint="opcional" class="sm:col-span-2">
      <PainelUploadImagem
        :user-id="props.usuario.id"
        :url-atual="estado.imagemLoja"
        rotulo="Imagem da loja"
        data-testid="perfil-imagem"
        @enviada="aoEnviarImagem"
      />
    </UFormField>

    <div class="sm:col-span-2">
      <UButton
        type="submit"
        color="primary"
        size="lg"
        :loading="props.enviando"
        label="Salvar perfil"
        data-testid="perfil-enviar"
      />
    </div>
  </UForm>
</template>
