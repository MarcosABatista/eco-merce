// app/components/painel/ListaVagas.vue — Lista de "Minhas Vagas" do lojista com remoção.
// Renderiza um card por vaga com botão Editar e Remover. Remover abre UModal de confirmação ->
// DELETE /api/vagas/{id} (CSRF) e emite 'removido'. Estado vazio quando não há vagas.
<script setup lang="ts">
import { ref } from 'vue'
import type { Vaga } from '#shared/types/vaga'

const props = defineProps<{
  vagas: Vaga[]
}>()

const emit = defineEmits<{
  // Vaga removida com sucesso (id) — o pai remove do estado/recarrega.
  removido: [id: number]
}>()

const token = useTokenCsrf()
const toast = useToast()

const modalAberto = ref(false)
const vagaAlvo = ref<Vaga | null>(null)
const removendo = ref(false)

// Abre o modal de confirmação para a vaga escolhida.
function pedirConfirmacao(vaga: Vaga) {
  vagaAlvo.value = vaga
  modalAberto.value = true
}

// Confirma a remoção: DELETE no BFF (CSRF) e sinaliza o pai.
async function confirmarRemocao() {
  if (!vagaAlvo.value) return
  const id = vagaAlvo.value.id
  removendo.value = true
  try {
    await $fetch(`/api/vagas/${id}`, { method: 'DELETE', body: { _token: token.value } })
    emit('removido', id)
    toast.add({ title: 'Vaga removida.', color: 'success' })
    modalAberto.value = false
  }
  catch {
    toast.add({ title: 'Não foi possível remover a vaga.', color: 'error' })
  }
  finally {
    removendo.value = false
  }
}
</script>

<template>
  <div data-testid="lista-vagas">
    <div
      v-if="props.vagas.length > 0"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="vaga in props.vagas"
        :key="vaga.id"
        class="rounded-xl border border-default bg-default p-4 shadow-sm flex flex-col gap-3"
        data-testid="vaga-card"
      >
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-base font-semibold text-highlighted" data-testid="vaga-cargo">
            {{ vaga.cargo }}
          </h3>
          <UButton
            size="sm"
            variant="ghost"
            color="neutral"
            icon="i-lucide-pencil"
            label="Editar"
            data-testid="vaga-editar"
            :to="`/vagas/${vaga.id}/editar`"
          />
        </div>

        <p class="text-sm text-muted line-clamp-2" data-testid="vaga-descricao">
          {{ vaga.descricao || 'Sem descrição.' }}
        </p>

        <div class="flex items-center gap-2 text-xs text-muted mt-auto">
          <span v-if="vaga.categoria" data-testid="vaga-categoria">{{ vaga.categoria }}</span>
          <span v-if="vaga.nomeLoja" class="text-default">·</span>
          <span v-if="vaga.nomeLoja" data-testid="vaga-loja">{{ vaga.nomeLoja }}</span>
        </div>

        <div class="flex items-center justify-between mt-2">
          <USwitch
            :model-value="vaga.ativo"
            :disabled="true"
            data-testid="vaga-ativo"
          />
          <span
            :class="vaga.ativo ? 'text-success' : 'text-error'"
            class="text-xs font-medium"
            data-testid="vaga-status"
          >
            {{ vaga.ativo ? 'Ativa' : 'Inativa' }}
          </span>
        </div>

        <div class="flex justify-end mt-2">
          <UButton
            size="sm"
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            label="Remover vaga"
            data-testid="vaga-remover"
            @click="pedirConfirmacao(vaga)"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center gap-3 rounded-[--ui-radius] border border-dashed border-default py-14 text-center text-muted"
      data-testid="lista-vagas-vazia"
    >
      <UIcon name="i-lucide-briefcase" class="size-10" aria-hidden="true" />
      <p>Você ainda não cadastrou vagas.</p>
      <UButton
        color="primary"
        label="Cadastrar primeira vaga"
        data-testid="lista-vagas-adicionar"
        to="/vagas/novo"
      />
    </div>

    <!-- Confirmação de remoção. -->
    <UModal v-model:open="modalAberto" title="Remover vaga" data-testid="modal-remover-vaga">
      <template #body>
        <p class="text-muted">
          Tem certeza que deseja remover
          <span class="font-semibold text-highlighted">{{ vagaAlvo?.cargo }}</span>?
          A vaga deixa de aparecer na vitrine.
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
