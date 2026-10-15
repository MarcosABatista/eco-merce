<!-- app/pages/usuarios/novo.vue — Cadastro de novo usuário/lojista (painel). -->
<!-- Orquestra o fluxo "cria usuário -> upload -> atualiza imagemLoja": POST /api/usuarios, e se -->
<!-- houver imagem, POST /api/upload/{novoId} e PUT /api/usuarios/{novoId} com a urlImagem. 409 -->
<!-- (email/cpfCnpj) é mapeado por campo no formulário; demais erros viram toast (design §6/RF-PAI-6). -->

<script setup lang="ts">
import { ref } from 'vue'
import type { ValoresUsuario } from '~/components/painel/FormularioUsuario.vue'
import type { Usuario } from '#shared/types/usuario'

definePageMeta({ layout: 'painel' })

const token = useTokenCsrf()
const toast = useToast()
const formRef = ref()
const enviando = ref(false)
// Arquivo da imagem da loja escolhido no formulário (upload adiado até existir o id).
const arquivoLoja = ref<File | null>(null)

interface ErroCampos { data?: { fieldErrors?: Array<{ field: string, message: string }> } }

// Sobe a imagem para o usuário recém-criado e atualiza o imagemLoja. Falha aqui não desfaz a
// criação do usuário — apenas avisa (o cadastro em si já foi concluído).
async function enviarImagemLoja(novoId: number, arquivo: File) {
  try {
    const dados = new FormData()
    dados.append('file', arquivo)
    dados.append('_token', token.value)
    const resposta = await $fetch<{ url: string }>(`/api/upload/${novoId}`, { method: 'POST', body: dados })
    await $fetch(`/api/usuarios/${novoId}`, {
      method: 'PUT',
      body: { imagemLoja: resposta.url, _token: token.value },
    })
  }
  catch {
    toast.add({ title: 'Usuário criado, mas a imagem não pôde ser enviada.', color: 'warning' })
  }
}

async function criar(valores: ValoresUsuario) {
  enviando.value = true
  try {
    const novo = await $fetch<Usuario>('/api/usuarios', { method: 'POST', body: { ...valores, _token: token.value } })
    if (arquivoLoja.value) {
      await enviarImagemLoja(novo.id, arquivoLoja.value)
    }
    toast.add({ title: 'Usuário criado.', color: 'success' })
    await navigateTo('/')
  }
  catch (erro) {
    const fieldErrors = (erro as ErroCampos)?.data?.fieldErrors
    if (fieldErrors?.length) {
      formRef.value?.aplicarErrosDeCampo(fieldErrors)
    }
    else {
      toast.add({ title: 'Não foi possível criar o usuário.', color: 'error' })
    }
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6" data-testid="usuario-novo">
    <div class="flex items-center gap-3">
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-left" aria-label="Voltar" to="/" data-testid="usuario-novo-voltar" />
      <h1 class="text-2xl font-bold text-highlighted">
        Novo Usuário
      </h1>
    </div>

    <FormularioUsuario
      ref="formRef"
      v-model:arquivo-loja="arquivoLoja"
      :enviando="enviando"
      @enviar="criar"
    />
  </div>
</template>
