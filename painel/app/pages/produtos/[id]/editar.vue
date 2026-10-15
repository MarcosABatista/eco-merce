<!-- app/pages/produtos/[id]/editar.vue — Edição de um produto do lojista (painel). -->
<!-- Carrega o produto por id via GET /api/produtos/{id} (o BFF confirma a propriedade). Usa -->
<!-- FormularioProduto (mesmos campos + ativo); ao submeter, PUT /api/produtos/{id} com _token CSRF. -->
<!-- 409 mapeado por campo; demais erros viram toast; em sucesso volta à home (design §6/RF-PAI-5). -->

<script setup lang="ts">
import { ref } from 'vue'
import type { ValoresProduto } from '~/components/painel/FormularioProduto.vue'
import type { Produto } from '#shared/types/produto'

definePageMeta({ layout: 'painel' })

const route = useRoute()
const id = Number(route.params.id)
if (!Number.isInteger(id) || id <= 0) {
  await navigateTo('/')
}

const token = useTokenCsrf()
const toast = useToast()
const formRef = ref()
const enviando = ref(false)

const { data: produto, error } = await useFetch<Produto>(`/api/produtos/${id}`)

interface ErroCampos { data?: { fieldErrors?: Array<{ field: string, message: string }> } }

async function salvar(valores: ValoresProduto) {
  enviando.value = true
  try {
    await $fetch(`/api/produtos/${id}`, { method: 'PUT', body: { ...valores, _token: token.value } })
    toast.add({ title: 'Produto atualizado.', color: 'success' })
    await navigateTo('/')
  }
  catch (erro) {
    const fieldErrors = (erro as ErroCampos)?.data?.fieldErrors
    if (fieldErrors?.length) {
      formRef.value?.aplicarErrosDeCampo(fieldErrors)
    }
    else {
      toast.add({ title: 'Não foi possível atualizar o produto.', color: 'error' })
    }
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6" data-testid="produto-editar">
    <div class="flex items-center gap-3">
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Voltar" to="/" data-testid="produto-editar-voltar" />
      <h1 class="text-2xl font-bold text-highlighted">
        Editar Produto
      </h1>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Não foi possível carregar o produto."
      data-testid="produto-editar-erro"
    />

    <FormularioProduto
      v-else-if="produto"
      ref="formRef"
      :produto="produto"
      :enviando="enviando"
      rotulo-envio="Salvar alterações"
      @enviar="salvar"
    />
  </div>
</template>
