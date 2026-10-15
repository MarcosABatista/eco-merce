<!-- app/components/painel/FormularioUsuario.vue — Formulário de criação de usuário/lojista do painel. -->
<!-- UForm validado pelo usuarioSchema (cpfCnpj 11/14, nome>=3, email, senha>=8, flags via USwitch). -->
<!-- A imagem da loja fica em v-model (File) porque o upload só é possível DEPOIS de criar o usuário -->
<!-- (fluxo cria->upload->atualiza imagemLoja, orquestrado pela página — design §6/RF-PAI-6). -->

<script setup lang="ts">
import { reactive, ref, watchEffect } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import { usuarioSchema } from '#shared/schemas/usuario'

const props = defineProps<{
  // Indica envio em andamento (desabilita o botão).
  enviando?: boolean
}>()

const emit = defineEmits<{
  // Dados validados prontos para criar o usuário (sem _token; a página injeta o CSRF).
  enviar: [valores: ValoresUsuario]
}>()

// Dados emitidos (schema sem _token; a página acrescenta o CSRF ao chamar o BFF).
export interface ValoresUsuario {
  cpfCnpj: string
  nome: string
  email: string
  telefone: string | null
  nomeLoja: string | null
  senha: string
  ativo: boolean
  admin: boolean
}

const token = useTokenCsrf()
const formRef = ref()

// Arquivo da imagem da loja (v-model): a página sobe após criar o usuário e obter o id.
const arquivoLoja = defineModel<File | null>('arquivoLoja', { default: null })

const estado = reactive<{
  cpfCnpj: string
  nome: string
  email: string
  telefone: string | null
  nomeLoja: string | null
  senha: string
  ativo: boolean
  admin: boolean
  _token: string
}>({
  cpfCnpj: '',
  nome: '',
  email: '',
  telefone: null,
  nomeLoja: null,
  senha: '',
  ativo: true,
  admin: false,
  _token: token.value,
})

watchEffect(() => {
  estado._token = token.value
})

function aoSubmeter(evento: FormSubmitEvent<ValoresUsuario & { _token: string }>) {
  const { _token, ...valores } = evento.data
  emit('enviar', valores)
}

// Mapeia os fieldErrors do BFF (ex.: 409 email/cpfCnpj duplicado) no campo correspondente.
function aplicarErrosDeCampo(fieldErrors: Array<{ field: string, message: string }>) {
  formRef.value?.setErrors(fieldErrors.map(e => ({ name: e.field, message: e.message })))
}

defineExpose({ aplicarErrosDeCampo })
</script>

<template>
  <UForm
    ref="formRef"
    :schema="usuarioSchema"
    :state="estado"
    class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2"
    data-testid="formulario-usuario"
    @submit="aoSubmeter"
  >
    <UFormField label="CPF/CNPJ" name="cpfCnpj" required>
      <UInput
        v-model="estado.cpfCnpj"
        placeholder="Somente números (11 ou 14 dígitos)"
        class="w-full"
        data-testid="usuario-cpfcnpj"
      />
    </UFormField>

    <UFormField label="Nome" name="nome" required>
      <UInput v-model="estado.nome" placeholder="Nome do responsável" class="w-full" data-testid="usuario-nome" />
    </UFormField>

    <UFormField label="E-mail" name="email" required>
      <UInput v-model="estado.email" type="email" placeholder="email@exemplo.com" class="w-full" data-testid="usuario-email" />
    </UFormField>

    <UFormField label="Telefone" name="telefone" hint="opcional">
      <UInput v-model="estado.telefone" placeholder="(00) 00000-0000" class="w-full" data-testid="usuario-telefone" />
    </UFormField>

    <UFormField label="Nome da loja" name="nomeLoja" hint="opcional">
      <UInput v-model="estado.nomeLoja" placeholder="Nome exibido na vitrine" class="w-full" data-testid="usuario-nomeloja" />
    </UFormField>

    <UFormField label="Senha" name="senha" required>
      <UInput v-model="estado.senha" type="password" placeholder="Mínimo 8 caracteres" class="w-full" data-testid="usuario-senha" />
    </UFormField>

    <UFormField label="Conta ativa" name="ativo">
      <USwitch v-model="estado.ativo" data-testid="usuario-ativo" />
    </UFormField>

    <UFormField label="Administrador" name="admin">
      <USwitch v-model="estado.admin" data-testid="usuario-admin" />
    </UFormField>

    <UFormField label="Imagem da loja" name="imagemLoja" hint="opcional" class="sm:col-span-2">
      <UploadImagem
        v-model="arquivoLoja"
        :user-id="null"
        rotulo="Imagem da loja"
        data-testid="usuario-imagem"
      />
    </UFormField>

    <div class="sm:col-span-2">
      <UButton
        type="submit"
        color="primary"
        size="lg"
        :loading="props.enviando"
        label="Criar usuário"
        data-testid="usuario-enviar"
      />
    </div>
  </UForm>
</template>
