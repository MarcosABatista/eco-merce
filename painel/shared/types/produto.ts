// shared/types/produto.ts — Tipos isomórficos do domínio Produto do painel.
// Derivados do contrato real do backend Java (ProdutoResponse): o DTO NÃO expõe usuarioId.
// PageResponse<T> espelha a paginação Spring. IDs são number (steering tipos-numericos).

// Categorias fixas aceitas pela API (enum do backend). Fonte de verdade do tipo.
export type Categoria = 'VESTUARIO' | 'ELETRODOMESTICOS' | 'ACESSORIOS' | 'SUPLEMENTOS'

// Produto como devolvido por GET /produtos e /produtos/{id} (ProdutoResponse).
export interface Produto {
  id: number
  nome: string
  descricao: string | null
  preco: number
  precoDesconto: number | null
  percentualDesconto: number | null
  categoria: Categoria
  urlImagem: string | null
  ativo: boolean
  nomeLoja: string | null
  telefone: string | null
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
