<!-- app/components/painel/FormularioProduto.vue — Formulário de criação/edição de produto do painel. -->
<!-- UForm validado pelo produtoSchema isomórfico (preco>0; precoDesconto, se houver, >0 E <preco). -->
<!-- Campos: nome, descricao, preco, precoDesconto (hint opcional), categoria (USelect das 4 fixas), -->
<!-- imagem (UploadImagem). Mapeia fieldErrors do BFF (incl. 409) no campo certo (design §6/RF-PAI-4). -->

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import type { FormSubmitEvent } from '@nuxt/ui'
import { produtoSchema, atualizacaoProdutoSchema } from '#shared/schemas/produto'
import { CATEGORIAS } from '#shared/constants/categorias'
import type { Categoria, Produto } from '#shared/types/produto'

const props = defineProps<{
  // Produto a editar; quando ausente, o formulário cria um novo.
  produto?: Produto | null
  // Rótulo do botão de submit.
  rotuloEnvio?: string
  // Indica envio em andamento (desabilita o botão).
  enviando?: boolean
}>()

const emit = defineEmits<{
  // Dados validados prontos para o pai persistir (sem o _token, que o pai injeta no $fetch).
  enviar: [valores: ValoresProduto]
}>()

// Forma dos dados emitidos (schema sem _token; o pai acrescenta o CSRF ao chamar o BFF).
export interface ValoresProduto {
  nome: string
  descricao: string | null
  preco: number
  precoDesconto: number | null
  categoria: Categoria
  urlImagem: string | null
  ativo?: boolean
}

const ehEdicao = ref(Boolean(props.produto))
// Schema do UForm: edição inclui `ativo`; criação usa o schema base.
const schema = ehEdicao.value ? atualizacaoProdutoSchema : produtoSchema

const token = useTokenCsrf()
const { user } = useUserSession()
const formRef = ref()

// A imagem do produto vai para o diretório do lojista logado (upload sob /api/upload/{sessao.id}).
const userId = computed(() => user.value?.id ?? null)

// Estado do formulário. precoDesconto nulo representa "sem desconto".
const estado = reactive<{
  nome: string
  descricao: string | null
  preco: number | undefined
  precoDesconto: number | null
  categoria: Categoria | undefined
  urlImagem: string | null
  ativo: boolean
  _token: string
}>({
  nome: props.produto?.nome ?? '',
  descricao: props.produto?.descricao ?? null,
  preco: props.produto?.preco,
  precoDesconto: props.produto?.precoDesconto ?? null,
  categoria: props.produto?.categoria,
  urlImagem: props.produto?.urlImagem ?? null,
  ativo: props.produto?.ativo ?? true,
  _token: token.value,
})

// Mantém o _token sincronizado (renovação por reload do app — csrf-renovacao.client).
watchEffect(() => {
  estado._token = token.value
})

// Opções do USelect derivadas da fonte única CATEGORIAS (valor + rótulo pt-BR).
const opcoesCategoria = CATEGORIAS.map(c => ({ label: c.rotulo, value: c.valor }))

// Recebe a urlImagem resultante do upload imediato (edição: já há userId).
function aoEnviarImagem(url: string) {
  estado.urlImagem = url
}

// Submete os dados já validados pelo schema; o pai persiste e trata erros do BFF.
function aoSubmeter(evento: FormSubmitEvent<ValoresProduto & { _token: string }>) {
  const { _token, ...valores } = evento.data
  emit('enviar', valores)
}

// Mapeia os fieldErrors devolvidos pelo BFF (ex.: 409 duplicado) no campo correspondente do form.
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
    data-testid="formulario-produto"
    @submit="aoSubmeter"
  >
    <UFormField label="Nome" name="nome" required class="sm:col-span-2">
      <UInput v-model="estado.nome" placeholder="Nome do produto" class="w-full" data-testid="produto-nome" />
    </UFormField>

    <UFormField label="Descrição" name="descricao" hint="opcional" class="sm:col-span-2">
      <UTextarea
        v-model="estado.descricao"
        :rows="3"
        placeholder="Detalhes do produto"
        class="w-full"
        data-testid="produto-descricao"
      />
    </UFormField>

    <UFormField label="Preço" name="preco" required>
      <UInputNumber
        v-model="estado.preco"
        :min="0"
        :step="0.01"
        :format-options="{ style: 'currency', currency: 'BRL' }"
        class="w-full"
        data-testid="produto-preco"
      />
    </UFormField>

    <UFormField label="Preço com desconto" name="precoDesconto" hint="opcional">
      <UInputNumber
        v-model="estado.precoDesconto"
        :min="0"
        :step="0.01"
        :format-options="{ style: 'currency', currency: 'BRL' }"
        class="w-full"
        data-testid="produto-preco-desconto"
      />
    </UFormField>

    <UFormField label="Categoria" name="categoria" required>
      <USelect
        v-model="estado.categoria"
        :items="opcoesCategoria"
        placeholder="Selecione"
        class="w-full"
        data-testid="produto-categoria"
      />
    </UFormField>

    <UFormField v-if="ehEdicao" label="Produto ativo" name="ativo" hint="aparece na vitrine">
      <USwitch v-model="estado.ativo" data-testid="produto-ativo" />
    </UFormField>

    <UFormField label="Imagem" name="urlImagem" hint="opcional" class="sm:col-span-2">
      <UploadImagem
        :user-id="userId"
        :url-atual="estado.urlImagem"
        rotulo="Imagem do produto"
        data-testid="produto-imagem"
        @enviada="aoEnviarImagem"
      />
    </UFormField>

    <div class="sm:col-span-2">
      <UButton
        type="submit"
        color="primary"
        size="lg"
        :loading="props.enviando"
        :label="props.rotuloEnvio ?? (ehEdicao ? 'Salvar alterações' : 'Cadastrar produto')"
        data-testid="produto-enviar"
      />
    </div>
  </UForm>
</template>
