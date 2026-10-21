// shared/types/vaga.ts — Tipos isomórficos do domínio Vaga do painel.
// Derivados do contrato real do backend Java (VagaResponse): IDs são number.
export interface Vaga {
  id: number
  usuarioId: number
  nomeUsuario: string
  nomeLoja: string | null
  cargo: string
  descricao: string | null
  categoria: string | null
  ativo: boolean
  createdAt: string
  updatedAt: string
}

// Envelope de paginação do Spring repassado pelo BFF ao cliente.
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

// Valores do formulário de vaga (sem o _token CSRF, que o pai injeta no $fetch).
export interface ValoresVaga {
  cargo: string
  descricao: string | null
  categoria: string | null
}
