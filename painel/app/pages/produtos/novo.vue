<!-- app/pages/produtos/novo.vue — Cadastro de novo produto do lojista (painel). -->
<!-- Usa FormularioProduto; ao submeter, POST /api/produtos (com _token CSRF; usuarioId vem da -->
<!-- sessão no BFF). 409 duplicado é mapeado por campo no formulário; demais erros viram toast -->
<!-- genérico. Em sucesso, volta à home "Meus Produtos" (design §6/RF-PAI-4). -->

<script setup lang="ts">
import { ref } from 'vue'
import type { ValoresProduto } from '#shared/types/produto'

definePageMeta({ layout: 'painel' })

const token = useTokenCsrf()
const toast = useToast()
const formRef = ref()
const enviando = ref(false)

interface ErroCampos { data?: { fieldErrors?: Array<{ field: string, message: string }> } }

async function criar(valores: ValoresProduto) {
  enviando.value = true
  try {
    await $fetch('/api/produtos', { method: 'POST', body: { ...valores, _token: token.value } })
    toast.add({ title: 'Produto cadastrado.', color: 'success' })
    await navigateTo('/')
  }
  catch (erro) {
    const fieldErrors = (erro as ErroCampos)?.data?.fieldErrors
    if (fieldErrors?.length) {
      formRef.value?.aplicarErrosDeCampo(fieldErrors)
    }
    else {
      toast.add({ title: 'Não foi possível cadastrar o produto.', color: 'error' })
    }
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6" data-testid="produto-novo">
    <div class="flex items-center gap-3">
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Voltar" to="/" data-testid="produto-novo-voltar" />
      <h1 class="text-2xl font-bold text-highlighted">
        Novo Produto
      </h1>
    </div>

    <PainelFormularioProduto
      ref="formRef"
      :enviando="enviando"
      rotulo-envio="Cadastrar produto"
      @enviar="criar"
    />
  </div>
</template>
