// app/components/painel/FormularioVaga.vue — Formulário de criação/edição de vaga do painel.
// UForm validado pelo vagaSchema isomórfico. Campos: cargo, descricao (opcional), categoria
// (opcional — usado pelos filtros da vitrine) e, na edição, ativo. O pai injeta o _token CSRF
// ao persistir e trata os fieldErrors do BFF.
<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import { vagaSchema, atualizacaoVagaSchema } from '#shared/schemas/vaga'
import type { Vaga, ValoresVaga } from '#shared/types/vaga'

const props = defineProps<{
  // Vaga a editar; quando ausente, o formulário cria uma nova.
  vaga?: Vaga | null
  // Rótulo do botão de submit.
  rotuloEnvio?: string
  // Indica envio em andamento (desabilita o botão).
  enviando?: boolean
}>()

const emit = defineEmits<{
  // Dados validados prontos para o pai persistir (sem o _token, que o pai injeta no $fetch).
  enviar: [valores: ValoresVaga]
}>()

const ehEdicao = ref(Boolean(props.vaga))
const schema = ehEdicao.value ? atualizacaoVagaSchema : vagaSchema

const token = useTokenCsrf()
const formRef = ref()

// Estado do formulário. categoria é opcional (filtro da vitrine).
const estado = reactive<{
  cargo: string
  descricao: string | null
  categoria: string | null
  ativo: boolean
  _token: string
}>({
  cargo: props.vaga?.cargo ?? '',
  descricao: props.vaga?.descricao ?? null,
  categoria: props.vaga?.categoria ?? null,
  ativo: props.vaga?.ativo ?? true,
  _token: token.value,
})

// Mantém o _token sincronizado (renovação por reload do app).
watchEffect(() => {
  estado._token = token.value
})

// Submete os dados já validados pelo schema; o pai persiste e trata erros do BFF.
function aoSubmeter(evento: FormSubmitEvent<ValoresVaga & { _token: string }>) {
  const { _token, ...valores } = evento.data
  emit('enviar', valores)
}

// Mapeia os fieldErrors devolvidos pelo BFF no campo correspondente do form.
function aplicarErrosDeCampo(fieldErrors: Array<{ field: string, message: string }>) {
  formRef.value?.setErrors(fieldErrors.map(e => ({ name: e.field, message: e.message })))
}

defineExpose({ aplicarErrosDeCampo })
</script>

<template>
  <UForm
    ref="formRef"
    :schema="schema"
    :state="estado"
    class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2"
    data-testid="formulario-vaga"
    @submit="aoSubmeter"
  >
    <UFormField label="Cargo" name="cargo" required class="sm:col-span-2">
      <UInput
        v-model="estado.cargo"
        placeholder="Ex.: Vendedor, Recepcionista, Motorista"
        class="w-full"
        data-testid="vaga-cargo"
      />
    </UFormField>

    <UFormField label="Descrição" name="descricao" hint="opcional" class="sm:col-span-2">
      <UTextarea
        v-model="estado.descricao"
        :rows="3"
        placeholder="Atividades, requisitos e benefícios da vaga"
        class="w-full"
        data-testid="vaga-descricao"
      />
    </UFormField>

    <UFormField label="Categoria" name="categoria" hint="opcional — filtro da vitrine">
      <UInput
        v-model="estado.categoria"
        placeholder="Ex.: Comercial, Administração"
        class="w-full"
        data-testid="vaga-categoria"
      />
    </UFormField>

    <UFormField v-if="ehEdicao" label="Vaga ativa" name="ativo" hint="aparece na vitrine">
      <USwitch v-model="estado.ativo" data-testid="vaga-ativo" />
    </UFormField>

    <div class="sm:col-span-2">
      <UButton
        type="submit"
        color="primary"
        size="lg"
        :loading="props.enviando"
        :label="props.rotuloEnvio ?? (ehEdicao ? 'Salvar alterações' : 'Cadastrar vaga')"
        data-testid="vaga-enviar"
      />
    </div>
  </UForm>
</template>
