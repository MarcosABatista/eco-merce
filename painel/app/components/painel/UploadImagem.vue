<!-- app/components/painel/UploadImagem.vue — Seleção e upload de imagem do painel. -->
<!-- UFileUpload (single, accept jpg/png) com preview. Quando há userId, envia na hora o FormData -->
<!-- (campo 'file' + _token) a POST /api/upload/{userId} e emite a urlImagem resultante. Sem userId -->
<!-- (criação), guarda o File via v-model para o pai subir depois (fluxo cria->upload->atualiza §6). -->

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  // Usuário dono da imagem; null na criação (upload adiado até existir o id).
  userId: number | null
  // URL atual já persistida (caminho do proxy /api/imagens/... derivado de urlImagem).
  urlAtual?: string | null
  // Rótulo do UFileUpload.
  rotulo?: string
}>()

const emit = defineEmits<{
  // Emitido quando o upload imediato (com userId) conclui, com a urlImagem retornada pelo Java.
  enviada: [url: string]
}>()

// Arquivo selecionado (v-model): o pai usa na criação para subir após criar o usuário.
const arquivo = defineModel<File | null>({ default: null })

const token = useTokenCsrf()
const toast = useToast()
const enviando = ref(false)

// Preview: object URL do arquivo recém-escolhido ou a URL já persistida (proxy).
const previa = computed(() => {
  if (arquivo.value) return URL.createObjectURL(arquivo.value)
  return proxyImagem(props.urlAtual)
})

// Reage à escolha de arquivo: com userId, sobe na hora; sem userId, só mantém o File (v-model).
async function aoSelecionar(valor: File | null) {
  arquivo.value = valor
  if (!valor || props.userId == null) return
  await enviar(props.userId, valor)
}

// Envia o arquivo ao BFF (multipart: file + _token) e emite a URL resultante.
async function enviar(userId: number, file: File) {
  enviando.value = true
  try {
    const dados = new FormData()
    dados.append('file', file)
    dados.append('_token', token.value)
    const resposta = await $fetch<{ url: string }>(`/api/upload/${userId}`, {
      method: 'POST',
      body: dados,
    })
    emit('enviada', resposta.url)
    toast.add({ title: 'Imagem enviada.', color: 'success' })
  }
  catch {
    toast.add({ title: 'Não foi possível enviar a imagem.', color: 'error' })
  }
  finally {
    enviando.value = false
  }
}

// Expõe o envio manual para o pai (criação: chamar após criar o usuário e obter o id).
defineExpose({ enviar })
</script>

<template>
  <div class="flex flex-col gap-3" data-testid="upload-imagem">
    <div
      v-if="previa"
      class="relative size-28 overflow-hidden rounded-[--ui-radius] border border-default bg-elevated"
      data-testid="upload-previa"
    >
      <img :src="previa" alt="Pré-visualização da imagem" class="size-full object-cover">
    </div>

    <UFileUpload
      :model-value="arquivo"
      accept="image/jpeg,image/png,.jpg,.jpeg,.png"
      :label="rotulo ?? 'Selecione uma imagem'"
      description="JPG ou PNG"
      icon="i-lucide-image-up"
      :disabled="enviando"
      :preview="false"
      class="w-full"
      data-testid="upload-campo"
      @update:model-value="aoSelecionar($event as File | null)"
    />

    <p v-if="enviando" class="text-xs text-muted" data-testid="upload-enviando">
      Enviando imagem...
    </p>
  </div>
</template>
