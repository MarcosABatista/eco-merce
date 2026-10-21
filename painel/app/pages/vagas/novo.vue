<!-- app/pages/vagas/novo.vue — Cadastro de nova vaga do lojista (painel). -->
<!-- Usa FormularioVaga; ao submeter, POST /api/vagas (com _token CSRF; usuarioId vem da sessão no BFF). -->
<!-- Em sucesso, volta à home "Minhas Vagas" (design §6/RF-PAI). -->

<script setup lang="ts">
import { ref } from 'vue'
import type { ValoresVaga } from '#shared/types/vaga'

definePageMeta({ layout: 'painel' })

const token = useTokenCsrf()
const toast = useToast()
const formRef = ref()
const enviando = ref(false)

interface ErroCampos { data?: { fieldErrors?: Array<{ field: string, message: string }> } }

async function criar(valores: ValoresVaga) {
  enviando.value = true
  try {
    await $fetch('/api/vagas', { method: 'POST', body: { ...valores, _token: token.value } })
    toast.add({ title: 'Vaga cadastrada.', color: 'success' })
    await navigateTo('/vagas')
  }
  catch (erro) {
    const fieldErrors = (erro as ErroCampos)?.data?.fieldErrors
    if (fieldErrors?.length) {
      formRef.value?.aplicarErrosDeCampo(fieldErrors)
    }
    else {
      toast.add({ title: 'Não foi possível cadastrar a vaga.', color: 'error' })
    }
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6" data-testid="vaga-novo">
    <div class="flex items-center gap-3">
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Voltar" to="/vagas" data-testid="vaga-novo-voltar" />
      <h1 class="text-2xl font-bold text-highlighted">
        Nova Vaga
      </h1>
    </div>

    <PainelFormularioVaga
      ref="formRef"
      :enviando="enviando"
      rotulo-envio="Cadastrar vaga"
      @enviar="criar"
    />
  </div>
</template>
