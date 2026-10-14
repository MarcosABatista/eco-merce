import api from './api'

export interface Produto {
  id: number
  nome: string
  descricao: string | null
  preco: number
  precoDesconto: number | null
  percentualDesconto: number | null
  categoria: string
  urlImagem: string | null
  ativo: boolean
  nomeLoja: string | null
  telefone: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateProdutoRequest {
  usuarioId: number
  nome: string
  descricao?: string
  preco: number
  precoDesconto?: number | null
  categoria: string
  urlImagem?: string
}

export interface UpdateProdutoRequest {
  nome?: string
  descricao?: string
  preco?: number
  precoDesconto?: number | null
  categoria?: string
  urlImagem?: string
  ativo?: boolean
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export const produtoService = {
  async findByUsuario(usuarioId: number, page = 0, size = 20): Promise<PageResponse<Produto>> {
    const { data } = await api.get('/produtos', { params: { usuarioId, page, size } })
    return data
  },

  async findById(id: number): Promise<Produto> {
    const { data } = await api.get(`/produtos/${id}`)
    return data
  },

  async create(request: CreateProdutoRequest): Promise<Produto> {
    const { data } = await api.post('/produtos', request)
    return data
  },

  async update(id: number, request: UpdateProdutoRequest): Promise<Produto> {
    const { data } = await api.put(`/produtos/${id}`, request)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/produtos/${id}`)
  },
}
