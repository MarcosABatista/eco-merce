<!-- app/pages/vagas/[id]/editar.vue — Edição de uma vaga do lojista (painel). -->
<!-- Carrega a vaga por id via GET /api/vagas/{id} (o BFF confirma a propriedade). Usa -->
<!-- FormularioVaga; ao submeter, PUT /api/vagas/{id} com _token CSRF. Em sucesso volta à home. -->

<script setup lang="ts">
import { ref } from 'vue'
import type { Vaga, ValoresVaga } from '#shared/types/vaga'

definePageMeta({ layout: 'painel' })

const route = useRoute()
const id = Number(route.params.id)
if (!Number.isInteger(id) || id <= 0) {
  await navigateTo('/vagas')
}

const token = useTokenCsrf()
const toast = useToast()
const formRef = ref()
const enviando = ref(false)

const { data: vaga, error } = await useFetch<Vaga>(`/api/vagas/${id}`)

interface ErroCampos { data?: { fieldErrors?: Array<{ field: string, message: string }> } }

async function salvar(valores: ValoresVaga) {
  enviando.value = true
  try {
    await $fetch(`/api/vagas/${id}`, { method: 'PUT', body: { ...valores, _token: token.value } })
    toast.add({ title: 'Vaga atualizada.', color: 'success' })
    await navigateTo('/vagas')
  }
  catch (erro) {
    const fieldErrors = (erro as ErroCampos)?.data?.fieldErrors
    if (fieldErrors?.length) {
      formRef.value?.aplicarErrosDeCampo(fieldErrors)
    }
    else {
      toast.add({ title: 'Não foi possível atualizar a vaga.', color: 'error' })
    }
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6" data-testid="vaga-editar">
    <div class="flex items-center gap-3">
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Voltar" to="/vagas" data-testid="vaga-editar-voltar" />
      <h1 class="text-2xl font-bold text-highlighted">
        Editar Vaga
      </h1>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Não foi possível carregar a vaga."
      data-testid="vaga-editar-erro"
    />

    <PainelFormularioVaga
      v-else-if="vaga"
      ref="formRef"
      :vaga="vaga"
      :enviando="enviando"
      rotulo-envio="Salvar alterações"
      @enviar="salvar"
    />
  </div>
</template>
