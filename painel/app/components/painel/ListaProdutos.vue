<!-- app/components/painel/ListaProdutos.vue — Grade de "Meus Produtos" com remoção e toggle de status. -->
<!-- Renderiza um CartaoProdutoAdmin por produto. Remover abre UModal de confirmação -> DELETE -->
<!-- /api/produtos/{id} (CSRF) e emite 'removido'. Alternar ativo faz PUT /api/produtos/{id} com -->
<!-- `ativo` invertido (CSRF) e emite 'alterado'. Estado vazio quando não há produtos (design §6/RF-PAI-3). -->

<script setup lang="ts">
import { ref } from 'vue'
import type { Produto } from '#shared/types/produto'

const props = defineProps<{
  produtos: Produto[]
}>()

const emit = defineEmits<{
  // Produto removido com sucesso (id) — o pai remove do estado/recarrega.
  removido: [id: number]
  // Status ativo/inativo alterado com sucesso — o pai recarrega para refletir.
  alterado: [id: number]
}>()

const token = useTokenCsrf()
const toast = useToast()

const modalAberto = ref(false)
const produtoAlvo = ref<Produto | null>(null)
const removendo = ref(false)

// Id do produto cujo status está sendo alternado (desabilita só aquele USwitch).
const alternandoId = ref<number | null>(null)

// Alterna ativo/inativo via PUT /api/produtos/{id}. O schema de edição exige os campos atuais
// (nome, preco, categoria, _token) além de `ativo`; reenviamos o produto com o `ativo` invertido.
async function alternarAtivo(produto: Produto) {
  alternandoId.value = produto.id
  try {
    await $fetch(`/api/produtos/${produto.id}`, {
      method: 'PUT',
      body: {
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco,
        precoDesconto: produto.precoDesconto,
        categoria: produto.categoria,
        urlImagem: produto.urlImagem,
        ativo: !produto.ativo,
        _token: token.value,
      },
    })
    toast.add({
      title: produto.ativo ? 'Produto desativado.' : 'Produto ativado.',
      color: 'success',
    })
    emit('alterado', produto.id)
  }
  catch {
    toast.add({ title: 'Não foi possível alterar o status do produto.', color: 'error' })
  }
  finally {
    alternandoId.value = null
  }
}

// Abre o modal de confirmação para o produto escolhido (vindo do cartão).
function pedirConfirmacao(produto: Produto) {
  produtoAlvo.value = produto
  modalAberto.value = true
}

// Confirma a remoção: DELETE no BFF (CSRF) e sinaliza o pai.
async function confirmarRemocao() {
  if (!produtoAlvo.value) return
  const id = produtoAlvo.value.id
  removendo.value = true
  try {
    await $fetch(`/api/produtos/${id}`, { method: 'DELETE', body: { _token: token.value } })
    emit('removido', id)
    toast.add({ title: 'Produto removido.', color: 'success' })
    modalAberto.value = false
  }
  catch {
    toast.add({ title: 'Não foi possível remover o produto.', color: 'error' })
  }
  finally {
    removendo.value = false
  }
}
</script>

<template>
  <div data-testid="lista-produtos">
    <div
      v-if="props.produtos.length > 0"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <PainelCartaoProdutoAdmin
        v-for="produto in props.produtos"
        :key="produto.id"
        :produto="produto"
        :alternando="alternandoId === produto.id"
        @deletar="pedirConfirmacao"
        @alternar-ativo="alternarAtivo"
      />
    </div>

    <div
      v-else
      class="flex flex-col items-center gap-3 rounded-[--ui-radius] border border-dashed border-default py-14 text-center text-muted"
      data-testid="lista-produtos-vazia"
    >
      <UIcon name="i-lucide-package-open" class="size-10" aria-hidden="true" />
      <p>Você ainda não cadastrou produtos.</p>
    </div>

    <!-- Confirmação de remoção (substitui confirm() nativo — acessível e consistente). -->
    <UModal v-model:open="modalAberto" title="Remover produto" data-testid="modal-remover-produto">
      <template #body>
        <p class="text-muted">
          Tem certeza que deseja remover
          <span class="font-semibold text-highlighted">{{ produtoAlvo?.nome }}</span>?
          O produto deixa de aparecer na vitrine.
        </p>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            label="Cancelar"
            data-testid="modal-remover-cancelar"
            @click="modalAberto = false"
          />
          <UButton
            color="error"
            :loading="removendo"
            label="Remover"
            data-testid="modal-remover-confirmar"
            @click="confirmarRemocao"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
